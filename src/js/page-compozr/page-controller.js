(function () {

    "use strict";

    GG.namespace("GG.PageCompozr");

    GG.PageCompozr = $.extend(GG.PageCompozr, {
        ICON_CSS_CLASS: "glyphicon",
        EDIT_CSS_CLASS: "glyphicon-edit",
        PREVIEW_CSS_CLASS: "glyphicon-check"
    });

    GG.PageCompozr.PageModel = GG.Class.extend({
    });

    GG.PageCompozr.PageControllerOptions = GG.Class.extend({
        contentImagesPath: null,
        editMode: false
    });

    GG.PageCompozr.PageController = GG.Class.extend({
        view: new GG.PageCompozr.PageView(),
        options: new GG.PageCompozr.PageControllerOptions(),
        model: new GG.PageCompozr.PageModel(),
        resources: new GG.PageCompozr.Resources(),

        assignElementsLock: 0,
        enableElementsEditabilityLock: 0,
        disableElementsEditabilityLock: 0,
        shortcutLock: true,

        init: function (view, options, viewModel, resources) {
            this.view = $.extend({}, this.view, view);
            this.view.container.data("gg.page-compozr.page-controller", this);
            this.options = $.extend({}, this.options, options);
            this.model = $.extend({}, this.model, viewModel);
            this.resources = $.extend({}, this.resources, resources);

            var that = this;

            initGlobalEvents();

            $Compozr.on("init" + GG.PageCompozr.DEFAULT_EVENT_DOMAIN, function (e, data) {
                data.show = false;
                data.attachEditorEvents = false;

                that.initMenu();
                that.assignElements();
                Compozr.queueTask("finishInit",
                    function () { // action
                        that.backupInitialData();
                        Compozr.fadeIn();
                        that.shortcutLock = false;
                        if (that.options.editMode) {
                            Compozr.menu.EditPage.click();
                        }
                    },
                    function () { // condition
                        return that.assignElementsLock === 0;
                    }
                );
            });

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + GG.PageCompozr.DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.shortcutLock) { return; }
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 69:
                            case 101:
                                // Ctrl + E
                                e.preventDefault();
                                $(":focus").blur();
                                Compozr.menu.EditPage.click();
                                break;
                        }
                    }
                });
            }
        },

        initMenu: function () {
            var that = this;
            Compozr.menu.EditPage.on("click" + GG.PageCompozr.DEFAULT_EVENT_DOMAIN, function () {
                that.switchMode();
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
            return $("." + GG.PageCompozr.ICON_CSS_CLASS, Compozr.menu.EditPage).hasClass(GG.PageCompozr.PREVIEW_CSS_CLASS);
        },

        switchToEditMode: function () {
            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            $("." + GG.PageCompozr.ICON_CSS_CLASS, Compozr.menuWithAlias.EditPage).removeClass(GG.PageCompozr.EDIT_CSS_CLASS)
                                                                                  .addClass(GG.PageCompozr.PREVIEW_CSS_CLASS);
            $("[title]", Compozr.menuWithAlias.EditPage).attr("title", this.resources.backToPreview);

            this.view.hiddenOnEditMode.hide();
            this.view.preparePageEditor(function (contentHtml) {
                return that.turnOffContentHtml(contentHtml);
            });

            Compozr.queueTask("enableElementsEditability",
                function () { // action
                    that.enableElementsEditability();
                },
                function () { // condition
                    return that.view.preparePageEditorLock === 0;
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
            $("." + GG.PageCompozr.ICON_CSS_CLASS, Compozr.menuWithAlias.EditPage).removeClass(GG.PageCompozr.PREVIEW_CSS_CLASS)
                                                                                  .addClass(GG.PageCompozr.EDIT_CSS_CLASS);
            $("[title]", Compozr.menuWithAlias.EditPage).attr("title", this.resources.edit);

            Compozr.detachEditorEvents();
            this.disableElementsEditability();

            Compozr.queueTask("cleanupPageEditor",
                function () { // action
                    that.view.cleanupPageEditor(function (contentHtml) {
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
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                    $Compozr.triggerHandler("edit", that.isEditMode());
                },
                function () { // condition
                    return that.view.cleanupPageEditorLock === 0;
                }
            );
        },

        backupInitialData: function () {
        },

        restoreData: function () {
        },

        assignElements: function () {
            this.assignElementsLock++;

            var that = this;
            this.view.assignElements();
            Compozr.queueTask("finishAssignElements",
                function () {
                    that.assignElementsLock--;
                },
                function () {
                    return that.view.assignElementsLock === 0;
                }
            );
        },

        enableElementsEditability: function () {
        },

        disableElementsEditability: function () {
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
            var videos = container.find("iframe");
            $.each(videos, function (index, value) {
                var $value = $(value),
                    clipId,
                    replacement;
                if ($value.attr("src") && $value.attr("src").indexOf("http://www.youtube.com") === 0) {
                    clipId = $value.attr("src").substr("http://www.youtube.com/embed/".length, 11);
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
                    src = this.options.contentImagesPath + "/" + name;
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
                replacement = "<iframe width=\"640\" height=\"480\" src=\"http://www.youtube.com/embed/" + match[1] + "?rel=0\" frameborder=\"0\" allowfullscreen></iframe>";
                contentHtml = contentHtml.replace(match[0], replacement);
            }

            // Asides
            contentHtml = contentHtml.replace(/\[aside\]/g, "<div class=\"aside\">");
            contentHtml = contentHtml.replace(/\[\/aside\]/g, "</div>");

            return contentHtml;
        }
    });

})();
