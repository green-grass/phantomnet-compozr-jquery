(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.ArticleModel = GG.DocCompozr.DocModel.extend({
        CategoryId: null,
        PublishDate: null,
        Author: null,
        SourceUrl: null,
        HeaderDisplay: null,
        Breadcrumbs: null
    });

    GG.Blog.ArticleControllerOptions = GG.DocCompozr.DocControllerOptions.extend({
        findCategoryUrl: null,
        searchCategoriesUrl: null,

        language: null,
        autoRefreshOnCategoryChange: false
    });

    GG.Blog.ArticleController = GG.DocCompozr.DocController.extend({
        view: new GG.Blog.ArticleView(),
        options: new GG.Blog.ArticleControllerOptions(),
        model: new GG.Blog.ArticleModel(),
        resources: new GG.Blog.Resources(),

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            $.extend($.fn.select2.defaults, $.fn.select2.locales[this.options.language]);

            if (this.options.autoRefreshOnCategoryChange) {
                var that = this;
                $Compozr.on("save" + DEFAULT_EVENT_DOMAIN, function (event, data) {
                    if (data.CategoryId !== that.model.CategoryId && data.UrlFriendlyTitle === that.model.UrlFriendlyTitle) {
                        Compozr.cancelTask("redirectByCategoryId");
                        Compozr.queueTask("redirectByCategoryId",
                            function () { // action
                                Compozr.dirty(false);
                                window.location = that.options.docUrl + "/" + data.UrlFriendlyTitle;
                            },
                            function () { // condition
                                return !Compozr.menu.ToggleDoc.data("jqXHR");
                            }
                        );
                    }

                    Compozr.menuWithAlias.ManageCategories.show();

                    that.view.updateBreadcrumbsCategories();
                    that.model = $.extend(that.model, {
                        HeaderDisplay: that.view.headerDisplay.html(),
                        Breadcrumbs: that.view.breadcrumbs.html()
                    });
                });
            }
        },

        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc, { categoryId: this.view.categoryId.val() });
        },

        onBeforeSaveDoc: function (doc) {
            doc.ShortContent = $.trim(this.isEditMode() ? doc.ShortContent : this.turnOffContentHtml(doc.ShortContent));
            doc.Content = $.trim(this.isEditMode() ? doc.Content : this.turnOffContentHtml(doc.Content));
        },

        onRevertDoc: function () {
            this._super();
            Compozr.menuWithAlias.ManageCategories.show();
        },

        switchToEditMode: function () {
            this._super();
            Compozr.menuWithAlias.ManageCategories.hide();
        },

        switchToPreviewMode: function () {
            this._super();
            if (!Compozr.dirty()) {
                Compozr.menuWithAlias.ManageCategories.show();
            }
            this.view.updateBreadcrumbsCategories();
        },

        backupData: function () {
            this._super();
            this.model = $.extend(this.model, {
                ShortContent: this.view.shortContent.html(),
                Content: this.view.content.html(),
                HeaderDisplay: this.view.headerDisplay.html(),
                Breadcrumbs: this.view.breadcrumbs.html()
            });
        },

        restoreData: function () {
            this._super();

            this.view.categoryId.val(this.model.CategoryId);
            this.view.publishDate.find("input").val(this.model.PublishDate);
            this.view.author.html(this.model.Author);
            this.view.sourceUrl.html(this.model.SourceUrl);
            this.view.shortContent.html(this.model.ShortContent);
            this.view.content.html(this.model.Content);
            this.view.headerDisplay.html(this.model.HeaderDisplay);
            this.view.title.prev().remove();
            var avatar = $("a.avatar", this.view.headerDisplay);
            if (avatar.is("*")) {
                this.view.title.before(avatar.clone());
            }
            this.view.breadcrumbs.html(this.model.Breadcrumbs);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var that = this;
            Compozr.queueTask("finishAssignElements",
                function () {
                    that.view.categoryId.val(that.model.CategoryId);
                    that.view.publishDate.find("input").val(that.model.PublishDate);
                    that.view.author.html(that.model.Author);
                    that.view.sourceUrl.html(that.model.SourceUrl);

                    that.assignElementsLock--;
                },
                function () {
                    return that.view.assignElementsLock === 0;
                }
            );
        },

        enableElementsEditability: function () {
            this.enableElementsEditabilityLock++;
            this._super();

            var that = this,
                editables = this.view.author.add(this.view.sourceUrl)
                                            .add(this.view.shortContent)
                                            .add(this.view.content);
            editables.attr(Compozr.CONTENTEDITABLE, "true")
                     .not(this.view.shortContent)
                     .not(this.view.content)
                     .attr(Compozr.SINGLE_LINE, "")
                     .attr(Compozr.NO_HTML, "")
                     .attr(Compozr.SELECT_ON_FOCUS, "");

            if (this.options.editMode) {
                this.view.shortContent.attr(Compozr.SELECT_ON_FIRST_FOCUS, "");
            }

            Compozr.includeAllInputs(this.view.categoryId);
            this.view.categoryId.select2({
                width: "100%",
                placeholder: this.resources.category,
                allowClear: true,
                query: function (query) {
                    Compozr.getJSON(that.options.searchCategoriesUrl, {
                        data: { term: query.term },
                        onSuccess: function (data/*, textStatus, jqXHR*/) {
                            $.each(data.models, function (index, value) {
                                data.models[index] = {
                                    id: value.Id,
                                    enabled: value.Enabled,
                                    name: value.Name,
                                    urlFriendlyName: value.UrlFriendlyName,
                                    text: value.Name + " (" + value.UrlFriendlyName + ")"
                                };
                            });
                            query.callback({ results: data.models });
                        },
                    });
                },
                initSelection: function (element, callback) {
                    var id = $(element).val();
                    if (id !== "") {
                        Compozr.getJSON(that.options.findCategoryUrl, {
                            data: { id: id },
                            onSuccess: function (data/*, textStatus, jqXHR*/) {
                                callback({
                                    id: data.model.Id,
                                    enabled: data.model.Enabled,
                                    name: data.model.Name,
                                    urlFriendlyName: data.model.UrlFriendlyName,
                                    text: data.model.Name + " (" + data.model.UrlFriendlyName + ")"
                                });
                            }
                        });
                    }
                }
            }).on("change" + DEFAULT_EVENT_DOMAIN, function () {
                that.view.updateHeaderDisplay();
            }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.view.publishDate.datetimepicker({
                locale: this.options.language
            }).on("change.dp" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.dirty(true);
                that.view.updateHeaderDisplay();
            }).on("show.dp" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("hide.dp" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.view.author.add(this.view.sourceUrl).on("paste" + DEFAULT_EVENT_DOMAIN +
                " blur" + DEFAULT_EVENT_DOMAIN, function () {
                    that.view.updateHeaderDisplay();
                });

            this.enableElementsEditabilityLock--;
        },

        disableElementsEditability: function () {
            this.disableElementsEditabilityLock++;
            this._super();

            var editables = this.view.author.add(this.view.sourceUrl)
                                            .add(this.view.shortContent)
                                            .add(this.view.content);
            editables.removeAttr(Compozr.CONTENTEDITABLE);

            this.view.categoryId.select2("destroy")
                                .removeAttr("style");

            this.view.publishDate.data("DateTimePicker").destroy();

            this.view.categoryId.add(this.view.publishDate)
                                .add(this.view.author)
                                .add(this.view.sourceUrl)
                                .off(DEFAULT_EVENT_DOMAIN);

            this.disableElementsEditabilityLock--;
        }
    });

})();
