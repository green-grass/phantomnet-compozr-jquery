/*!
 * Html Image Editor Toolbar for Compozr
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - Phantom Net Namespace and Inheritance
 * - Remote Folder
 * - Compozr
 * - Toolbar Base
 */

(function () {

    "use strict";

    var DEFAULT_EVENT_DOMAIN = ".compozr-toolbar",
        DISABLED_CSS_CLASS = "disabled",
        TOOLBAR_ITEM_ATTRIBUTE = "data-compozr-toolbar-item",

        HINT_CSS_CLASS = "note";

    Compozr.HtmlImageToolbar = Compozr.ToolbarBase.extend({
        resources: {
            imageCaptionMessage: null
        },

        init: function (container, resources) {
            this._super(container, resources);
            if (!this.container.is("*")) {
                return;
            }

            var remoteFolder = $("*", this.container).filter(function () {
                return $(this).data("remoteFolder");
            }).data("remoteFolder");

            var that = this;
            if (remoteFolder !== null) {
                $.each(remoteFolder.items(), function (index, value) {
                    that.initItem($("img", value));
                });
                $(remoteFolder).on("filelistitemadd", function (event, data) {
                    that.initItem($("img", data));
                    that.refresh();
                });
            }
        },

        refresh: function () {
            this._super();

            var that = this;
            Compozr.queueTask("finishRefresh",
                function () {
                    if (!Modernizr.touch) {
                        if (!$("img", that.container).hasClass(DISABLED_CSS_CLASS)) {
                            $("." + HINT_CSS_CLASS, that.container).show();
                        } else {
                            $("." + HINT_CSS_CLASS, that.container).hide();
                        }
                    }
                },
                function () {
                    return that.refreshLock === 0;
                }
            );
        },

        initItem: function (item) {
            var that = this;

            item.attr(TOOLBAR_ITEM_ATTRIBUTE, "image")
                .data("queryCommandEnabled", function (field, command) {
                    return that.isFieldSupported(field);
                })
                .data("getCommandValue", function () {
                    var name = item.closest("li").data("fullName"),
                        caption = window.prompt(that.resources.imageCaptionMessage, "");
                    return {
                        name: name,
                        caption: caption === null ? null : caption.trim()
                    };
                })
                .data("commandFunction", function (field, command, value) {
                    if (value.caption !== null) {
                        var html = "[image name=\"" + value.name + "\" alt=\"" + value.caption + "\" caption=\"\" description=\"\"][label]" + value.caption + "[/label]";
                        GG.pasteHtmlAtCaret(html);
                        Compozr.dirty(true);
                    }
                });

            this.attachEvents(item);
        }
    });

})();
