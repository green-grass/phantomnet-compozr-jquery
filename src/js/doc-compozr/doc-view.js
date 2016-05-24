(function () {

    "use strict";

    GG.namespace("GG.DocCompozr");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        PLACE_HOLDER_EVENT_DOMAIN = ".doc-compozr-place-holder",
        EXTRA_INFO_CSS_CLASS = "extra-info",
        PLACE_HOLDER_CSS_CLASS = "place-holder",
        CLEARFIX_CSS_CLASS = "clearfix",
        ON_TWO_COLUMN_BREAK_CSS_CLASS = "clearfix visible-sm",
        ON_THREE_COLUMN_BREAK_CSS_CLASS = "clearfix visible-md visible-lg",
        COLUMN_CSS_CLASS = "col-sm-6 col-md-4",
        FULL_COLUMN_CSS_CLASS = "col-sm-12",
        FIXED_BOTTOM_CSS_CLASS = "navbar-fixed-bottom",
        IMAGES_PANEL_CSS_CLASS = "images-panel",
        IMAGES_PANEL_TITLE_CSS_CLASS = "text-info",
        IMAGES_PANEL_HINT_CSS_CLASS = "text-info note",
        IMAGES_PANEL_REMOTE_FOLDER_CONTAINER_CSS_CLASS = "folder-container",
        IMAGES_PANEL_UPLOAD_BUTTON_CSS_CLASS = "btn btn-link btn-lg",
        IMAGES_PANEL_UPLOAD_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-plus",
        DISABLED_DOC_CSS_CLASS = "disabled";

    GG.DocCompozr.DocViewOptions = GG.Class.extend({
        imageListUrl: null,
        uploadImageUrl: null,
        renameImageUrl: null,
        deleteImageUrl: null,
        predefinedImageFileNames: [],
        searchRelatedDocsUrl: null
    });

    GG.DocCompozr.DocView = GG.Class.extend({
        container: $(),
        options: new GG.DocCompozr.DocViewOptions(),
        resources: new GG.DocCompozr.Resources(),

        imagesPanel: $(),
        doc: $(),
        extraInfo: $(),
        tags: $(),
        filters: $(),
        series: $(),
        title: $(),
        titleEditor: $(),
        urlFriendlyTitle: $(),
        descriptionMeta: $(),
        keywordsMeta: $(),
        viewCount: $(),
        relatedDocs: $(),

        hiddenOnEditMode: $(),

        assignElementsLock: 0,
        prepareDocEditorLock: 0,
        cleanupDocEditorLock: 0,

        init: function (container, options, resources) {
            this.container = $(container);
            this.options = $.extend(this.options, options);
            this.resources = $.extend(this.resources, resources);

            this.doc = $(".doc", this.container);
            this.title = $("header h1", this.doc);
            this.relatedDocs = $(".related-docs", this.container);

            this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.relatedDocs);
        },

        assignElements: function () {
            this.assignElementsLock++;

            var list;
            this.doc.append(this.extraInfo = $("<div></div>").hide()
                                                             .addClass(EXTRA_INFO_CSS_CLASS)
                                                             .append(list = $("<ul></ul>").addClass(CLEARFIX_CSS_CLASS)));
            list.append($("<li></li>").addClass(FULL_COLUMN_CSS_CLASS).css("margin-bottom", "0").append(this.urlFriendlyTitle = $("<div></div>")));
            this.urlFriendlyTitle.after($("<span></span>").html(this.resources.urlFriendlyTitleDescription));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.tags = $("<input type=\"hidden\" />")));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.filters = $("<input type=\"hidden\" />")));
            list.append($("<li></li>").addClass(ON_TWO_COLUMN_BREAK_CSS_CLASS));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.series = $("<input type=\"hidden\" />")));
            list.append($("<li></li>").addClass(ON_THREE_COLUMN_BREAK_CSS_CLASS));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.viewCount = $("<div></div>")));
            list.append($("<li></li>").addClass(ON_TWO_COLUMN_BREAK_CSS_CLASS));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.descriptionMeta = $("<div></div>")));
            list.append($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.keywordsMeta = $("<div></div>")));

            var imagesPanelFolder;
            $("body").append(this.imagesPanel = $('<section></section>'));
            this.imagesPanel.addClass(FIXED_BOTTOM_CSS_CLASS)
                            .addClass(IMAGES_PANEL_CSS_CLASS)
                            .hide()
                            .append($("<h2></h2>").addClass(IMAGES_PANEL_TITLE_CSS_CLASS).html(this.resources.docImages))
                            .append($("<div></div>").addClass(IMAGES_PANEL_HINT_CSS_CLASS).html(this.resources.insertImageHint).hide())
                            .append($("<div></div>").addClass(IMAGES_PANEL_REMOTE_FOLDER_CONTAINER_CSS_CLASS).append(imagesPanelFolder = $("<div></div>")));
            var options = {
                listUrl: this.options.imageListUrl,
                uploadUrl: this.options.uploadImageUrl,
                renameUrl: this.options.renameImageUrl,
                deleteUrl: this.options.deleteImageUrl,
                predefinedFileNames: this.options.predefinedImageFileNames,
                formatUploadButton: function () {
                    return $("<div></div>").addClass(IMAGES_PANEL_UPLOAD_BUTTON_CSS_CLASS)
                                           .append($("<span></span>").addClass(IMAGES_PANEL_UPLOAD_BUTTON_ICON_CSS_CLASS));
                }
            };
            var remoteFolder = new GG.Components.RemoteFolder(imagesPanelFolder, options);
            imagesPanelFolder.data("remoteFolder", remoteFolder);
            $(remoteFolder)
                .on("beginEdit" + DEFAULT_EVENT_DOMAIN, function (e, item) {
                    Compozr.fixSizeViewport();
                    $("[" + Compozr.CONTENTEDITABLE + "]", item).attr(Compozr.EXCLUDED, "");
                })
                .on("comitEdit" + DEFAULT_EVENT_DOMAIN + " cancelEdit" + DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.restoreViewport();
                });

            this.assignElementsLock--;
        },

        prepareDocEditor: function () {
            this.prepareDocEditorLock++;

            var that = this;

            $("body").css("padding-bottom", "+=" + this.imagesPanel.outerHeight());
            if (Modernizr.touch) {
                $Compozr.on("inputfocus" + DEFAULT_EVENT_DOMAIN, function () {
                    $("body").css("padding-bottom", "-=" + that.imagesPanel.outerHeight());
                });
                $Compozr.on("inputblur" + DEFAULT_EVENT_DOMAIN, function () {
                    $("body").css("padding-bottom", "+=" + that.imagesPanel.outerHeight());
                });
            }
            this.imagesPanel.show();

            this.titleEditor = $("<div></div>").html(this.title.text());
            this.title.html("").append(this.titleEditor);
            this.extraInfo.show();

            this.initPlaceHolder(this.titleEditor, this.resources.title, true, false);
            this.initPlaceHolder(this.urlFriendlyTitle, this.resources.urlFriendlyTitle, true, false);
            this.initPlaceHolder(this.descriptionMeta, this.resources.descriptionMeta, false, true);
            this.initPlaceHolder(this.keywordsMeta, this.resources.keywordsMeta, false, true);
            this.initPlaceHolder(this.viewCount, this.resources.viewCount, false, true);

            this.titleEditor.on("keyup" + DEFAULT_EVENT_DOMAIN, function () {
                var original = that.urlFriendlyTitle.html();
                that.urlFriendlyTitle.removeClass(PLACE_HOLDER_CSS_CLASS);
                that.urlFriendlyTitle.html(GG.toUrlFriendly(that.titleEditor.text()));
                if (that.urlFriendlyTitle.html() !== original) {
                    Compozr.dirty(true);
                }
            });

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function () {
            this.cleanupDocEditorLock++;

            this.destroyPlaceHolder(this.titleEditor, false);
            this.destroyPlaceHolder(this.urlFriendlyTitle, false);
            this.destroyPlaceHolder(this.descriptionMeta, true);
            this.destroyPlaceHolder(this.keywordsMeta, true);
            this.destroyPlaceHolder(this.viewCount, true);

            this.imagesPanel.hide();
            $Compozr.off("inputfocus" + DEFAULT_EVENT_DOMAIN + " inputblur" + DEFAULT_EVENT_DOMAIN);
            $("body").css("padding-bottom", "-=" + this.imagesPanel.outerHeight());

            this.extraInfo.hide();
            this.title.html(this.titleEditor.text());
            this.titleEditor = $();

            this.cleanupDocEditorLock--;
        },

        initPlaceHolder: function (field, text, required, addLabel) {
            var that = this;
            if (field.length && field.length > 1) {
                $.each(field, function (index, value) {
                    that.initPlaceHolder($(value), text, required, addLabel);
                });
            } else {
                if (addLabel) {
                    field.before($("<label></label>").hide().html(text));
                }

                var placeHolderText = "[" + text + "]";
                _testField(field, placeHolderText);

                if (!field.css("min-height") || parseInt(field.css("min-height"), 10) === 0) {
                    field.css("min-height", field.height() + "px");
                }

                field.on("focus" + PLACE_HOLDER_EVENT_DOMAIN, function () {
                    var $this = $(this);
                    if ($this.hasClass(PLACE_HOLDER_CSS_CLASS)) {
                        $this.removeClass(PLACE_HOLDER_CSS_CLASS).html("");
                        if (addLabel) {
                            field.prev().show();
                        }
                    }
                }).on("blur" + PLACE_HOLDER_EVENT_DOMAIN, function () {
                    _testField($(this), placeHolderText);
                });
            }

            function _testField(field, placeHolderText) {
                var original = $.trim(field.html()),
                    tag = $("<div></div>").html(original);
                if (tag.find(".rangySelectionBoundary").is("*")) {
                    return;
                }
                tag.cleanHtml("filterTags", { tags: ["img"] });

                if ($.trim(tag.html()) === "") {
                    field.addClass(PLACE_HOLDER_CSS_CLASS + (required ? " required" : "")).html(placeHolderText);
                    if (addLabel) {
                        field.prev().hide();
                    }
                } else {
                    field.html(original);
                    if (addLabel) {
                        field.prev().show();
                    }
                }
            }
        },

        destroyPlaceHolder: function (field, removeLabel) {
            var that = this;
            if (field.length && field.length > 1) {
                $.each(field, function (index, value) {
                    that.destroyPlaceHolder($(value), removeLabel);
                });
            } else {
                field.off(PLACE_HOLDER_EVENT_DOMAIN);
                field.css("min-height", "");
                // Nullable fields need this processing
                if (field.hasClass(PLACE_HOLDER_CSS_CLASS)) {
                    field.html("").removeClass(PLACE_HOLDER_CSS_CLASS);
                }
                if (removeLabel) {
                    field.prev().remove();
                }
            }
        },

        setField: function (field, value) {
            field.triggerHandler("focus");
            field.html(value);
            field.triggerHandler("blur");
        },

        loadDocModel: function () {
            return {
                TagsEdit: this.tags.val(),
                FiltersEdit: this.filters.val(),
                SeriesEdit: this.series.val(),
                Title: this.loadField(this.titleEditor.is("*") ? this.titleEditor : this.title),
                UrlFriendlyTitle: this.loadField(this.urlFriendlyTitle),
                DescriptionMetaEdit: this.loadField(this.descriptionMeta),
                KeywordsMetaEdit: this.loadField(this.keywordsMeta),
                ViewCount: this.loadField(this.viewCount)
            };
        },

        loadField: function (field, allowHtml) {
            return field.hasClass(PLACE_HOLDER_CSS_CLASS) ? "" : $.trim(allowHtml === true ? field.html() : field.text());
        },

        updateRelatedDocs: function (id, docUrl) {
            var that = this,
                series = this.series.val();

            if (series === "") {
                this.hiddenOnEditMode = this.hiddenOnEditMode.not(this.relatedDocs);
                this.relatedDocs.removeData("jqXHR")
                                .remove();
                this.relatedDocs = $();
            } else {
                var list;
                if (!this.relatedDocs.is("*")) {
                    this.relatedDocs = $("<aside><aside>").hide()
                                                          .addClass("related-docs")
                                                          .attr("role", "complementary")
                                                          .append($("<h2></h2>").append(this.resources.relatedDocs))
                                                          .append(list = $("<ul></ul>"));
                    this.doc.after(this.relatedDocs);
                    this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.relatedDocs);
                } else {
                    list = $("ul", this.relatedDocs);
                }

                this.relatedDocs.data("jqXHR", Compozr.getJSON(this.options.searchRelatedDocsUrl, {
                    data: { id: id, term: series },
                    onSuccess: function (data, textStatus, jqXHR) {
                        if (jqXHR !== that.relatedDocs.data("jqXHR")) {
                            return;
                        }

                        var models = data.models;
                        if (models.length === 0) {
                            that.relatedDocs.remove();
                            that.relatedDocs = $();
                        } else {
                            list.html("");
                            $.each(models, function (index, value) {
                                var item = $("<li></li>");
                                if (!value.Enabled) {
                                    item.addClass(DISABLED_DOC_CSS_CLASS);
                                }
                                list.append(item.append($("<a></a>").attr("href", docUrl + "/" + value.UrlFriendlyTitle)
                                                                    .html(value.Title)));
                            });

                            that.relatedDocs.show();
                        }
                    },
                    onComplete: function (jqXHR, textStatus) {
                        if (jqXHR === that.relatedDocs.data("jqXHR")) {
                            that.relatedDocs.removeData("jqXHR");
                        }
                    }
                }));
            }
        }
    });

})();
