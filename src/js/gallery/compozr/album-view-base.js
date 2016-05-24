(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery = $.extend(GG.Gallery, {
        DEFAULT_EVENT_DOMAIN: ".gallery",
        COVER_IMAGE_UPLOAD_BUTTON_CSS_CLASS: "btn btn-lg btn-primary",
        COVER_IMAGE_UPLOAD_BUTTON_ICON_CSS_CLASS: "glyphicon glyphicon-picture"
    });

    GG.Gallery.AlbumViewOptions = GG.PageCompozr.PageViewOptions
        .extend(GG.PageCompozr.PageImages.PageViewOptions)
        .extend({
            coverImageListUrl: null,
            uploadCoverImageUrl: null,
            renameCoverImageUrl: null,
            deleteCoverImageUrl: null
        });

    GG.Gallery.AlbumViewBase = GG.PageCompozr.PageView
        .extend(GG.PageCompozr.PageImages.PageView)
        .extend(GG.PageCompozr.MultiPage.PageView)
        .extend({
            options: new GG.Gallery.AlbumViewOptions(),
            resources: new GG.Gallery.Resources(),

            priority: $(),
            themeColor: $(),
            name: $(),
            nameEditor: $(),
            urlFriendlyName: $(),
            description: $(),
            coverImage: $(),
            images: $(),
            navigation: $(),

            init: function (container, options, resources) {
                this._super(container, options, resources);

                this.page = $(".album", this.container);
                this.name = $(".album-name", this.page);
                this.description = $(".description", this.page);
                this.navigation = $(".navigation", this.page);

                this.hiddenOnEditMode = this.hiddenOnEditMode.add($(".social-network", this.container))
                                                             .add(this.navigation);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                var that = this,
                    list = $("ul", this.extraInfo),
                    themeColorPicker = $("<div></div>");
                list.append($("<li></li>").addClass(GG.PageCompozr.EXPANDED_COLUMN_CSS_CLASS).append(this.urlFriendlyName = $("<div></div>")));
                this.urlFriendlyName.after($("<span></span>").html(this.resources.urlFriendlyNameDescription));
                list.append($("<li></li>").addClass(GG.PageCompozr.COLUMN_CSS_CLASS).append(this.priority = $("<div></div>")));
                list.append($("<li></li>").addClass(GG.PageCompozr.ON_TWO_COLUMN_BREAK_CSS_CLASS).addClass(GG.PageCompozr.ON_THREE_COLUMN_BREAK_CSS_CLASS));
                list.append($("<li></li>").addClass(GG.PageCompozr.COLUMN_CSS_CLASS).append(this.themeColor = $("<div></div>")));
                this.themeColor.after(themeColorPicker);
                list.append($("<li></li>").addClass(GG.PageCompozr.EXPANDED_COLUMN_CSS_CLASS).append(this.coverImage = $("<div></div>")));

                themeColorPicker.colorPicker({
                    formatItem: function (item, color) {
                        item.css("background", color);
                    }
                });

                var options = {
                    listUrl: this.options.coverImageListUrl,
                    uploadUrl: this.options.uploadCoverImageUrl,
                    renameUrl: this.options.renameCoverImageUrl,
                    deleteUrl: this.options.deleteCoverImageUrl,
                    multiple: false,
                    formatUploadButton: function () {
                        return $("<div></div>").addClass(GG.Gallery.COVER_IMAGE_UPLOAD_BUTTON_CSS_CLASS)
                                               .append($("<span></span>").addClass(GG.Gallery.COVER_IMAGE_UPLOAD_BUTTON_ICON_CSS_CLASS))
                                               .append(" " + that.resources.uploadCoverImage);
                    }
                };
                var remoteFolder = new GG.Components.RemoteFolder(this.coverImage, options);

                this.assignElementsLock--;
            },

            preparePageEditor: function (turnOffContentHtml) {
                this.prepareDocEditorLock++;
                this._super(turnOffContentHtml);

                var that = this;

                this.nameEditor = $("<div></div>").html(this.name.first().text());
                this.name.html("").filter(":visible").append(this.nameEditor);

                this.initPlaceHolder(this.priority, this.resources.priority, true, true);
                this.initPlaceHolder(this.themeColor, this.resources.themeColor, false, true);
                this.initPlaceHolder(this.nameEditor, this.resources.name, true, false);
                this.initPlaceHolder(this.urlFriendlyName, this.resources.urlFriendlyName, true, false);
                this.initPlaceHolder(this.description, this.resources.description, false, false);

                this.description.css("min-height", "200px");

                this.themeColor.next().on("select.gg.colorPicker" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function (e, data) {
                    if (that.themeColor.html() !== data) {
                        that.setField(that.themeColor, data);
                        Compozr.dirty(true);
                    }
                    $Compozr.triggerHandler("inputchange", that.themeColor);
                });

                this.nameEditor.on("keyup" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function () {
                    var original = that.urlFriendlyName.html();
                    that.urlFriendlyName.removeClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS);
                    that.urlFriendlyName.html(GG.toUrlFriendly(that.nameEditor.text()));
                    if (that.urlFriendlyName.html() !== original) {
                        Compozr.dirty(true);
                    }
                });
                $(window).on("resize" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function () {
                    if (!that.nameEditor.is(":visible")) {
                        that.name.filter(":visible").append(that.nameEditor);
                    }
                });

                this.prepareDocEditorLock--;
            },

            cleanupPageEditor: function (turnOnContentHtml) {
                this.cleanupDocEditorLock++;
                this._super(turnOnContentHtml);

                this.themeColor.next().off(GG.Gallery.DEFAULT_EVENT_DOMAIN);
                $(window).off(GG.Gallery.DEFAULT_EVENT_DOMAIN);

                this.destroyPlaceHolder(this.priority, true);
                this.destroyPlaceHolder(this.themeColor, true);
                this.destroyPlaceHolder(this.nameEditor, false);
                this.destroyPlaceHolder(this.urlFriendlyName, false);
                this.destroyPlaceHolder(this.description, false);

                this.name.html(this.nameEditor.text());
                this.nameEditor = $();

                this.cleanupDocEditorLock--;
            },

            loadPageModel: function () {
                var ret = this._super();
                return $.extend(ret, {
                    Priority: this.loadField(this.priority),
                    ThemeColorHtml: this.loadField(this.themeColor),
                    "Localizations[0].Name": this.loadField(this.nameEditor.is("*") ? this.nameEditor : this.name.first()),
                    "Localizations[0].UrlFriendlyName": this.loadField(this.urlFriendlyName),
                    "Localizations[0].Description": this.loadField(this.description, true)
                });
            },

            updateImages: function () {
                var that = this;
                this.images.hide()
                           .removeAttr("data-ride")
                           .data("jqXHR", Compozr.getJSON(this.options.imageListUrl, {
                               onSuccess: function (data, textStatus, jqXHR) {
                                   if (jqXHR !== that.images.data("jqXHR")) {
                                       return;
                                   }

                                   that.populateImages(data.items);
                               },
                               onComplete: function (jqXHR, textStatus) {
                                   if (jqXHR === that.images.data("jqXHR")) {
                                       that.images.removeData("jqXHR");
                                   }
                               }
                           }));
            },

            populateImages: function (items) {
            }
        });

})();
