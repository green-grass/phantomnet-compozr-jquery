(function () {

    "use strict";

    GG.namespace("GG.DocCompozr");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        ICON_CSS_CLASS = "glyphicon",
        EDIT_CSS_CLASS = "glyphicon-edit",
        PREVIEW_CSS_CLASS = "glyphicon-check",
        ENABLED_CSS_CLASS = "glyphicon-star",
        DISABLED_CSS_CLASS = "glyphicon-star-empty",

        _htmlEditorToolbar = new Compozr.HtmlEditorToolbar(); // IntelliSense support only actuall toolbar will be created later

    GG.DocCompozr.DocModel = GG.Class.extend({
        Id: null,
        Enabled: null,
        Tags: null,
        Filters: null,
        Series: null,
        Title: null,
        UrlFriendlyTitle: null,
        DescriptionMeta: null,
        KeywordsMeta: null,
        ViewCount: null
    });

    GG.DocCompozr.DocControllerOptions = GG.Class.extend({
        newDocUrl: null,
        saveDocUrl: null,
        toggleDocUrl: null,
        deleteDocUrl: null,
        docUrl: null,

        imagesPath: null,
        editMode: false,
        previewAfterSave: true,
        searchTagsUrl: null,
        allowedFilters: [],
        searchSeriesUrl: null
    });

    GG.DocCompozr.DocController = GG.Class.extend({
        view: new GG.DocCompozr.DocView(),
        options: new GG.DocCompozr.DocControllerOptions(),
        model: new GG.DocCompozr.DocModel(),
        resources: new GG.DocCompozr.Resources(),

        assignElementsLock: 0,
        enableElementsEditabilityLock: 0,
        disableElementsEditabilityLock: 0,
        shortcutLock: true,

        init: function (view, options, viewModel, resources) {
            this.view = $.extend(this.view, view);
            this.view.container.data("gg.doc-compozr.doc-controller", this);
            this.options = $.extend(this.options, options);
            this.model = $.extend(this.model, viewModel);
            this.resources = $.extend(this.resources, resources);

            this.options.saveDocUrl += "/" + this.model.Id;
            this.options.toggleDocUrl += "/" + this.model.Id;
            this.options.deleteDocUrl += "/" + this.model.Id;

            this.view.options.imageListUrl += "/" + this.model.Id;
            this.view.options.uploadImageUrl += "/" + this.model.Id;
            this.view.options.renameImageUrl += "/" + this.model.Id;
            this.view.options.deleteImageUrl += "/" + this.model.Id;

            var that = this;

            $.each(this.options.allowedFilters, function (index, value) {
                that.options.allowedFilters[index] = {
                    id: value.toLowerCase(),
                    text: value
                };
            });
            this.model.Filters = this.model.Filters.toLowerCase();

            initGlobalEvents();

            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                data.show = false;
                data.attachEditorEvents = false;

                _htmlEditorToolbar = new Compozr.HtmlEditorToolbar(Compozr.container, {
                    pasteDescription: that.resources.pasteToolbarItemDescription
                });
                _htmlEditorToolbar.hide();
                that.initMenu();
                that.assignElements();
                Compozr.queueTask("finishInit",
                    function () { // action
                        that.backupData();
                        Compozr.fadeIn();
                        that.shortcutLock = false;
                        if (that.options.editMode) {
                            Compozr.menu.EditDoc.click();
                        }
                    },
                    function () { // condition
                        return that.assignElementsLock === 0;
                    }
                );
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
            $Compozr.on("saveDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onSaveDoc();
            });
            $Compozr.on("revertDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onRevertDoc();
            });
            $Compozr.on("deleteDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onDeleteDoc();
            });

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.shortcutLock) { return; }
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 69:
                            case 101:
                                // Ctrl + E
                                e.preventDefault();
                                $(":focus").blur();
                                Compozr.menu.EditDoc.click();
                                break;
                            case 78:
                            case 110:
                                // Ctrl + N
                                if (!that.isEditMode()) {
                                    e.preventDefault();
                                    $(":focus").blur();
                                    Compozr.menu.NewDoc.click();
                                }
                                break;
                        }
                    }
                });
            }
        },

        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc);
        },

        onBeforeSaveDoc: function (doc) {
        },

        onSaveDoc: function () {
            var doc = this.view.loadDocModel();
            doc = $.extend(doc,
            {
                Id: this.model.Id,
                Enabled: this.model.Enabled,
                // Tags
                // Filters
                // Series
                // Title
                // UrlFriendlyTitle
                // DescriptionMeta
                // KeywordsMeta
                // ViewCount
            });

            this.onBeforeSaveDoc(doc);

            var that = this;
            Compozr.postSave(that.options.saveDocUrl, Compozr.menu.Save.add(Compozr.menu.Revert), doc, function () {
                if (!that.model.Enabled && window.confirm(that.resources.enableDocMessage)) {
                    Compozr.menu.ToggleDoc.click();
                }

                if (doc.UrlFriendlyTitle !== that.model.UrlFriendlyTitle) {
                    Compozr.cancelTask("redirectByUrlFriendlyTitle");
                    Compozr.queueTask("redirectByUrlFriendlyTitle",
                        function () { // action
                            Compozr.dirty(false);
                            window.location = that.options.docUrl + "/" + doc.UrlFriendlyTitle;
                        },
                        function () { // condition
                            return !Compozr.menu.ToggleDoc.data("jqXHR");
                        }
                    );
                }

                if (that.isEditMode()) {
                    if (that.options.previewAfterSave) {
                        Compozr.menu.EditDoc.click();
                    } else {
                        Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
                    }
                }
                Compozr.menuWithAlias.Save.prev().add(Compozr.menuWithAlias.Revert.prev()).hide();
                if (!that.isEditMode()) {
                    Compozr.menuWithAlias.NewDoc.show();
                }

                $Compozr.triggerHandler("save", doc);

                that.model = $.extend(that.model, doc);
            });
        },

        onRevertDoc: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
                Compozr.menuWithAlias.NewDoc.show();
            }

            var that = this;
            Compozr.queueTask("restoreData",
                function () { // action
                    that.restoreData();
                },
                function () { // condition
                    return that.view.cleanupDocEditorLock === 0;
                }
            );
        },

        onDeleteDoc: function () {
            Compozr.postDelete(this.options.deleteDocUrl, Compozr.menu.DeleteDoc);
        },

        initMenu: function () {
            var that = this;

            Compozr.menu.EditDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.switchMode();
            });

            Compozr.menu.ToggleDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.toggleDoc();
            });

            Compozr.menu.DeleteDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.deleteDoc();
            });

            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        },

        switchMode: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                this.switchToEditMode();
            }
        },

        isEditMode: function () {
            return $("." + ICON_CSS_CLASS, Compozr.menu.EditDoc).hasClass(PREVIEW_CSS_CLASS);
        },

        switchToEditMode: function () {
            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            $("." + ICON_CSS_CLASS, Compozr.menuWithAlias.EditDoc).removeClass(EDIT_CSS_CLASS)
                                                                  .addClass(PREVIEW_CSS_CLASS);
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.backToPreview);
            Compozr.menuWithAlias.NewDoc.hide();
            _htmlEditorToolbar.show();
            Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();

            this.view.hiddenOnEditMode.hide();
            this.view.prepareDocEditor(function (contentHtml) {
                return that.turnOffContentHtml(contentHtml);
            });

            Compozr.queueTask("enableElementsEditability",
                function () { // action
                    that.enableElementsEditability();
                },
                function () { // condition
                    return that.view.prepareDocEditorLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToEditMode",
                function () { // action
                    Compozr.attachEditorEvents();
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                    $Compozr.triggerHandler("edit", that.isEditMode());
                },
                function () { // condition
                    return that.enableElementsEditabilityLock === 0;
                }
            );
        },

        switchToPreviewMode: function () {
            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            $("." + ICON_CSS_CLASS, Compozr.menuWithAlias.EditDoc).removeClass(PREVIEW_CSS_CLASS)
                                                                  .addClass(EDIT_CSS_CLASS);
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.edit);
            if (!Compozr.dirty()) {
                Compozr.menuWithAlias.NewDoc.show();
            }
            _htmlEditorToolbar.hide();
            if (!Compozr.dirty()) {
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
            }

            Compozr.detachEditorEvents();
            this.disableElementsEditability();

            Compozr.queueTask("cleanupDocEditor",
                function () { // action
                    that.view.cleanupDocEditor(function (contentHtml) {
                        return that.turnOnContentHtml(contentHtml);
                    });
                },
                function () { // condition
                    return that.disableElementsEditabilityLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToPreviewMode",
                function () { // action
                    that.view.hiddenOnEditMode.show();
                    that.view.updateRelatedDocs(that.model.Id, that.options.docUrl);
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                    $Compozr.triggerHandler("edit", that.isEditMode());
                },
                function () { // condition
                    return that.view.cleanupDocEditorLock === 0;
                }
            );
        },

        backupData: function () {
            this.model = $.extend(this.model, {
                Title: this.view.title.html()
            });
            $Compozr.triggerHandler("backupData"); // TODO:: Remove
        },

        restoreData: function () {
            this.view.tags.val(this.model.Tags);
            this.view.filters.val(this.model.Filters);
            this.view.series.val(this.model.Series);
            this.view.title.html(this.model.Title);
            this.view.urlFriendlyTitle.html(this.model.UrlFriendlyTitle);
            this.view.descriptionMeta.html(this.model.DescriptionMeta);
            this.view.keywordsMeta.html(this.model.KeywordsMeta);
            this.view.viewCount.html(this.model.ViewCount);
            $Compozr.triggerHandler("restoreData"); // TODO:: Remove
        },

        toggleDoc: function () {
            var that = this;
            Compozr.menu.ToggleDoc.data("jqXHR", Compozr.postJSON(this.options.toggleDocUrl, {
                data: { enabled: !this.model.Enabled },
                onSuccess: function (data, textStatus, jqXHR) {
                    if (jqXHR !== Compozr.menu.ToggleDoc.data("jqXHR")) {
                        return;
                    }

                    that.model.Enabled = !that.model.Enabled;
                    updateToggleDocMenuItem(that.model, that.resources);

                    function updateToggleDocMenuItem(model, resources) {
                        Compozr.menuWithAlias.ToggleDoc.children("a").attr("title", model.Enabled ? resources.hide : resources.show)
                                                                     .children("span").removeClass(ENABLED_CSS_CLASS)
                                                                                      .removeClass(DISABLED_CSS_CLASS)
                                                                                      .addClass(model.Enabled ? ENABLED_CSS_CLASS : DISABLED_CSS_CLASS);
                    }
                },
                onComplete: function (jqXHR, textStatus) {
                    if (jqXHR === Compozr.menu.ToggleDoc.data("jqXHR")) {
                        Compozr.menu.ToggleDoc.removeData("jqXHR");
                    }
                }
            }));
        },

        assignElements: function () {
            this.assignElementsLock++;

            var that = this;
            this.view.assignElements();
            Compozr.queueTask("finishAssignElements",
                function () {
                    that.view.tags.val(that.model.Tags);
                    that.view.filters.val(that.model.Filters);
                    that.view.series.val(that.model.Series);
                    that.view.urlFriendlyTitle.html(that.model.UrlFriendlyTitle);
                    that.view.descriptionMeta.html(that.model.DescriptionMeta);
                    that.view.keywordsMeta.html(that.model.KeywordsMeta);
                    that.view.viewCount.html(that.model.ViewCount);

                    new Compozr.HtmlImageToolbar(that.view.imagesPanel, { imageCaptionMessage: that.resources.imageCaptionMessage });

                    that.assignElementsLock--;
                },
                function () {
                    return that.view.assignElementsLock === 0;
                }
            );
        },

        enableElementsEditability: function () {
            this.enableElementsEditabilityLock++;

            var that = this,
                editables = this.view.titleEditor.add(this.view.urlFriendlyTitle)
                                                 .add(this.view.descriptionMeta)
                                                 .add(this.view.keywordsMeta)
                                                 .add(this.view.viewCount);
            editables.attr(Compozr.CONTENTEDITABLE, "true")
                     .attr(Compozr.SINGLE_LINE, "")
                     .attr(Compozr.NO_HTML, "")
                     .attr(Compozr.SELECT_ON_FOCUS, "");
            this.view.urlFriendlyTitle.attr(Compozr.URL_FRIENDLY, "");

            Compozr.includeAllInputs(this.view.tags.add(this.view.filters)
                                                   .add(this.view.series));
            this.view.tags.select2({
                width: "100%",
                placeholder: this.resources.tags,
                tags: [],
                createSearchChoice: function (term) {
                    return { id: term, text: term };
                },
                tokenSeparators: [","],
                query: function (query) {
                    Compozr.getJSON(that.options.searchTagsUrl, {
                        data: { term: query.term },
                        onSuccess: function (data/*, textStatus, jqXHR*/) {
                            $.each(data.models, function (index, value) {
                                data.models[index] = {
                                    id: value,
                                    text: value
                                };
                            });
                            query.callback({ results: data.models });
                        },
                    });
                },
                initSelection: function (element, callback) {
                    var items = $(element).val();
                    if (items !== "") {
                        var itemArray = items.split(",");
                        $.each(itemArray, function (index, value) {
                            itemArray[index] = {
                                id: value,
                                text: value
                            };
                        });
                        callback(itemArray);
                    }
                }
            }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.view.filters.select2({
                width: "100%",
                placeholder: this.resources.filters,
                multiple: true,
                data: this.options.allowedFilters,
                maximumSelectionSize: this.options.allowedFilters.length
            }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.view.series.select2({
                width: "100%",
                placeholder: this.resources.series,
                tags: [],
                createSearchChoice: function (term) {
                    return { id: term, text: term };
                },
                tokenSeparators: [","],
                query: function (query) {
                    Compozr.getJSON(that.options.searchSeriesUrl, {
                        data: { term: query.term },
                        onSuccess: function (data/*, textStatus, jqXHR*/) {
                            $.each(data.models, function (index, value) {
                                data.models[index] = {
                                    id: value,
                                    text: value
                                };
                            });
                            query.callback({ results: data.models });
                        },
                    });
                },
                initSelection: function (element, callback) {
                    var items = $(element).val();
                    if (items !== "") {
                        var itemArray = items.split(",");
                        $.each(itemArray, function (index, value) {
                            itemArray[index] = {
                                id: value,
                                text: value
                            };
                        });
                        callback(itemArray);
                    }
                }
            }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.enableElementsEditabilityLock--;
        },

        disableElementsEditability: function () {
            this.disableElementsEditabilityLock++;

            var editables = this.view.titleEditor.add(this.view.urlFriendlyTitle)
                                                 .add(this.view.descriptionMeta)
                                                 .add(this.view.keywordsMeta)
                                                 .add(this.view.viewCount);
            editables.removeAttr(Compozr.CONTENTEDITABLE);

            this.view.tags.select2("destroy")
                          .removeAttr("style");
            this.view.filters.select2("destroy")
                             .removeAttr("style");
            this.view.series.select2("destroy")
                            .removeAttr("style");

            this.disableElementsEditabilityLock--;
        },

        turnOffContentHtml: function (contentHtml) {
            // Images, captions
            var container = $("<div></div>").html(contentHtml),
                figures = container.find("figure");

            $.each(figures, function (index, value) {
                var $value = $(value),
                    image = $("img", $value),
                    figcaption = $("figcaption", $value).html(),
                    replacement = "";
                if (image.is("*")) {
                    var src = image.attr("src"),
                        alt = image.attr("alt"),
                        caption = image.attr("caption"),
                        description = image.attr("description"),
                        imageName = src.substring(Math.max(src.lastIndexOf("/"), src.lastIndexOf("\\")) + 1, src.length);
                    alt = alt === undefined ? "" : alt;
                    caption = caption === undefined ? "" : caption;
                    description = description === undefined ? "" : description;
                    replacement += "[image name=\"" + imageName + "\" alt=\"" + alt + "\" caption=\"" + caption + "\" description=\"" + description + "\"]";
                }
                if (figcaption) {
                    replacement += "[label]" + figcaption + "[/label]";
                }
                $value.replaceWith(replacement);
            });

            // Youtube
            var videos = container.find(".video-wrapper");
            $.each(videos, function (index, value) {
                var $value = $(value),
                    iframe = $("iframe", $value),
                    clipId,
                    replacement;
                if (iframe.attr("src") && iframe.attr("src").indexOf("http://www.youtube.com") === 0) {
                    clipId = iframe.attr("src").substr("http://www.youtube.com/embed/".length, 11);
                    replacement = "[youtube]" + clipId + "[/youtube]";
                    $value.replaceWith(replacement);
                }
            });

            // Asides
            var asides = container.find("div.aside");
            $.each(asides, function (index, value) {
                var $value = $(value),
                    replacement = "[aside]" + $value.html() + "[/aside]";
                $value.replaceWith(replacement);
            });

            return container.html();
        },

        turnOnContentHtml: function (contentHtml) {
            var regexp, match, replacement;

            // Name base images
            regexp = /\[image\s+name\s*=\s*('\s*((\w|\-)+.\w+)\s*'|"\s*((\w|\-)+.\w+)\s*")(\s+alt=\s*('\s*([\s\S]*?)\s*'|"\s*([\s\S]*?)\s*"))*(\s+caption=\s*('\s*([\s\S]*?)\s*'|"\s*([\s\S]*?)\s*"))*(\s+description=\s*('\s*([\s\S]*?)\s*'|"\s*([\s\S]*?)\s*"))*\s*\]/g;
            while ((match = regexp.exec(contentHtml)) !== null) {
                var name = match[2] ? match[2] : match[4],
                    alt = match[8] ? match[8] : match[9],
                    caption = match[12] ? match[12] : match[13],
                    description = match[16] ? match[16] : match[17],
                    src = this.options.imagesPath + "/" + name;
                replacement = "<figure><img alt=\"" + alt + "\" caption=\"" + caption + "\" description=\"" + description + "\" src=\"" + src + "\" /></figure>";
                contentHtml = contentHtml.replace(match[0], replacement);
            }

            // Captions
            regexp = /\[label\][\s\S]*?\[\/label\]/g;
            while ((match = regexp.exec(contentHtml)) !== null) {
                replacement = match[0].replace(/<\/div>\s*<div>/g, '<br />');
                contentHtml = contentHtml.replace(match[0], replacement);
            }
            contentHtml = contentHtml.replace(/\[label\]/g, "<figure><figcaption>");
            contentHtml = contentHtml.replace(/\[\/label\]/g, "</figcaption></figure>");
            contentHtml = contentHtml.replace(/<\/figure><figure><figcaption>/g, "<figcaption>");

            // Youtube
            regexp = /\[youtube\]([a-zA-Z0-9]{11})\[\/youtube\]/g;
            while ((match = regexp.exec(contentHtml)) !== null) {
                replacement = "<div class=\"video-wrapper\"><div class=\"video-container\"><iframe width=\"640\" height=\"480\" src=\"http://www.youtube.com/embed/" + match[1] + "?rel=0\" frameborder=\"0\" allowfullscreen></iframe></div></div>";
                contentHtml = contentHtml.replace(match[0], replacement);
            }

            // Asides
            contentHtml = contentHtml.replace(/\[aside\]/g, "<div class=\"aside\">");
            contentHtml = contentHtml.replace(/\[\/aside\]/g, "</div>");

            return contentHtml;
        }
    });

})();
