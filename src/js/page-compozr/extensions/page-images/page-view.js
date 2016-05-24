(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.PageImages");

    GG.PageCompozr.PageImages = $.extend(GG.PageCompozr.PageImages, {
        DEFAULT_EVENT_DOMAIN: ".page-compozr-page-images",
        FIXED_BOTTOM_CSS_CLASS: "navbar-fixed-bottom",
        IMAGES_PANEL_CSS_CLASS: "page-compozr-images-panel",
        IMAGES_PANEL_TITLE_CSS_CLASS: "text-info",
        IMAGES_PANEL_REMOTE_FOLDER_CONTAINER_CSS_CLASS: "folder-container",
        IMAGES_PANEL_UPLOAD_BUTTON_CSS_CLASS: "btn btn-link btn-lg",
        IMAGES_PANEL_UPLOAD_BUTTON_ICON_CSS_CLASS: "glyphicon glyphicon-plus"
    });

    GG.PageCompozr.PageImages.PageViewOptions = {
        imageListUrl: null,
        uploadImageUrl: null,
        renameImageUrl: null,
        deleteImageUrl: null,
        predefinedImageFileNames: []
    };

    GG.PageCompozr.PageImages.PageView = {
        options: GG.PageCompozr.PageImages.PageViewOptions, // must be overriden
        resources: GG.PageCompozr.PageImages.Resources, // must be overriden

        imagesPanel: $(),

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var imagesPanelFolder;
            $("body").append(this.imagesPanel = $('<section></section>'));
            this.imagesPanel.addClass(GG.PageCompozr.PageImages.FIXED_BOTTOM_CSS_CLASS)
                            .addClass(GG.PageCompozr.PageImages.IMAGES_PANEL_CSS_CLASS)
                            .hide()
                            .append($("<h2></h2>").addClass(GG.PageCompozr.PageImages.IMAGES_PANEL_TITLE_CSS_CLASS).html(this.resources.pageImages))
                            .append($("<div></div>").addClass(GG.PageCompozr.PageImages.IMAGES_PANEL_REMOTE_FOLDER_CONTAINER_CSS_CLASS).append(imagesPanelFolder = $("<div></div>")));
            var options = {
                listUrl: this.options.imageListUrl,
                uploadUrl: this.options.uploadImageUrl,
                renameUrl: this.options.renameImageUrl,
                deleteUrl: this.options.deleteImageUrl,
                predefinedFileNames: this.options.predefinedImageFileNames,
                formatUploadButton: function () {
                    return $("<div></div>").addClass(GG.PageCompozr.PageImages.IMAGES_PANEL_UPLOAD_BUTTON_CSS_CLASS)
                                           .append($("<span></span>").addClass(GG.PageCompozr.PageImages.IMAGES_PANEL_UPLOAD_BUTTON_ICON_CSS_CLASS));
                }
            };
            var remoteFolder = new GG.Components.RemoteFolder(imagesPanelFolder, options);
            imagesPanelFolder.data("remoteFolder", remoteFolder);
            $(remoteFolder)
                .on("beginEdit" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN, function (e, item) {
                    Compozr.fixSizeViewport();
                    $("[" + Compozr.CONTENTEDITABLE + "]", item).attr(Compozr.EXCLUDED, "");
                })
                .on("comitEdit" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN + " cancelEdit" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.restoreViewport();
                });

            this.assignElementsLock--;
        },

        preparePageEditor: function (turnOffContentHtml) {
            this.preparePageEditorLock++;
            this._super(turnOffContentHtml);

            var that = this;
            $("body").css("padding-bottom", "+=" + (this.imagesPanel.outerHeight() + parseInt(this.imagesPanel.css("margin-bottom"))));
            if (Modernizr.touch) {
                $Compozr.on("inputfocus" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN, function () {
                    $("body").css("padding-bottom", "-=" + (that.imagesPanel.outerHeight() + parseInt(that.imagesPanel.css("margin-bottom"))));
                });
                $Compozr.on("inputblur" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN, function () {
                    $("body").css("padding-bottom", "+=" + (that.imagesPanel.outerHeight() + parseInt(that.imagesPanel.css("margin-bottom"))));
                });
            }
            this.imagesPanel.show();

            this.preparePageEditorLock--;
        },

        cleanupPageEditor: function (turnOnContentHtml) {
            this.cleanupPageEditorLock++;
            this._super(turnOnContentHtml);

            this.imagesPanel.hide();
            $Compozr.off("inputfocus" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN + " inputblur" + GG.PageCompozr.PageImages.DEFAULT_EVENT_DOMAIN);
            $("body").css("padding-bottom", "-=" + (this.imagesPanel.outerHeight() + parseInt(this.imagesPanel.css("margin-bottom"))));

            this.cleanupPageEditorLock--;
        }
    };

})();
