/*!
 * Html Editor Toolbar for Compozr
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - Phantom Net Namespace and Inheritance
 * - Color picker
 * - Compozr
 * - Toolbar Base
 */

(function () {

    "use strict";

    var DEFAULT_EVENT_DOMAIN = ".compozr-toolbar",
        DISABLED_CSS_CLASS = "disabled",
        FIXED_TOP_CSS_CLASS = "navbar-fixed-top",
        TOOLBAR_ITEM_ATTRIBUTE = "data-compozr-toolbar-item",
        ROOT_ITEM_ATTRIBUTE = "data-compozr-root-item",
        POPOVER_CSS_CLASS = "popover";

    Compozr.HtmlEditorToolbar = Compozr.ToolbarBase.extend({
        resources: {
            pasteDescription: "Paste text from any source here to remove all formatting.",
            createLinkPrompt: "Url:"
        },

        init: function (container, resources) {
            this._super(container, resources);
            if (!this.container.is("*")) {
                return;
            }

            var that = this;
            overrideEvents();
            initGlobalEvents();

            function overrideEvents() {
                var pasteArea = $("<textarea></textarea>"),
                    pasteItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=paste]", that.container),
                    foreColorPicker = $("<div></div>"),
                    foreColorItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=forecolor]", that.container),
                    createLinkItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=createlink]", that.container),
                    youtubeItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=youtube]", that.container),
                    asideItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=aside]", that.container);

                pasteArea
                    .css({
                        "width": "100%",
                        "height": "200px"
                    });

                pasteItem
                    .data("queryCommandEnabled", function (field, command) {
                        return pasteItem.next().hasClass(POPOVER_CSS_CLASS) || that.isFieldSupported(field);
                    })
                    .data("commandFunction", function (field, command, value) {
                        GG.pasteHtmlAtCaret(value);
                        Compozr.dirty(true);
                    })
                    .popover({
                        html: true,
                        placement: "bottom",
                        title: that.resources.pasteDescription,
                        enabled: false,
                        content: pasteArea
                    })
                    .on("shown.bs.popover" + DEFAULT_EVENT_DOMAIN, function () {
                        pasteArea
                            .one("paste" + DEFAULT_EVENT_DOMAIN, function (e) {
                                window.setTimeout(function () {
                                    var value = pasteArea.val();
                                    while (value.indexOf("\r\n") > 0) {
                                        value = value.replace(/\r\n/g, "\n");
                                    }
                                    while (value.indexOf("\n\n") > 0) {
                                        value = value.replace(/\n\n/g, "\n");
                                    }
                                    that.execCommand(that.field, pasteItem, GG.escapeHtmlWithLineBreaks(value));
                                }, 10);
                            })
                            .one("blur" + DEFAULT_EVENT_DOMAIN, function () {
                                pasteItem.popover("hide");
                            })
                            .focus();
                    })
                    .on("hide.bs.popover" + DEFAULT_EVENT_DOMAIN, function () {
                        that.restoreSelection();
                        that.field = null;
                    })
                    .on("hidden.bs.popover" + DEFAULT_EVENT_DOMAIN, function () {
                        pasteArea.val(null);
                    })
                    .off("mousedown" + DEFAULT_EVENT_DOMAIN)
                    .on("mousedown" + DEFAULT_EVENT_DOMAIN, function () {
                        if (pasteArea.is(":focus")) {
                            pasteArea.off("blur" + DEFAULT_EVENT_DOMAIN);
                            return;
                        }
                        that.onItemMouseDown();
                    })
                    .off("mouseup" + DEFAULT_EVENT_DOMAIN)
                    .on("mouseup" + DEFAULT_EVENT_DOMAIN, function () {
                        if (!Modernizr.touch) {
                            $(document).off("mouseup" + DEFAULT_EVENT_DOMAIN);
                        }
                    });

                foreColorPicker
                    .colorPicker({
                        formatItem: function (item, color) {
                            item.css("background", color)
                                .attr(TOOLBAR_ITEM_ATTRIBUTE, "forecolor")
                                .data("getCommandValue", function () {
                                    return color;
                                });
                        }
                    });
                that.attachEvents(foreColorPicker);

                foreColorItem
                    .attr(ROOT_ITEM_ATTRIBUTE, "")
                    .data("commandFunction", function (field, command, value) {
                    })
                    .popover({
                        html: true,
                        placement: "bottom",
                        content: foreColorPicker
                    })
                    .on("shown.bs.popover" + DEFAULT_EVENT_DOMAIN, function () {
                        $Compozr.on("inputfocus" + DEFAULT_EVENT_DOMAIN + "-foreColor", function () {
                            foreColorItem.popover("hide");
                        });
                        $(document).on("click" + DEFAULT_EVENT_DOMAIN + "-foreColor", function () {
                            foreColorItem.popover("hide");
                        });
                    })
                    .on("hidden.bs.popover" + DEFAULT_EVENT_DOMAIN, function () {
                        $Compozr.off("inputfocus" + DEFAULT_EVENT_DOMAIN + "-foreColor");
                        $(document).off("click" + DEFAULT_EVENT_DOMAIN + "-foreColor");
                    });

                createLinkItem.data("getCommandValue", function () {
                    return window.prompt(that.resources.createLinkPrompt, "http://");
                });

                youtubeItem
                    .data("queryCommandEnabled", function (field, command) {
                        return that.isFieldSupported(field);
                    })
                    .data("getCommandValue", function () {
                        return window.prompt("YouTube", "");
                    })
                    .data("commandFunction", function (field, command, value) {
                        value = value.substr(value.lastIndexOf("=") + 1);
                        value = value.substr(value.lastIndexOf("/") + 1);
                        GG.pasteHtmlAtCaret("[youtube]" + value + "[/youtube]");
                        Compozr.dirty(true);
                    });

                asideItem
                    .data("queryCommandEnabled", function (field, command) {
                        return that.isFieldSupported(field);
                    })
                    .data("commandFunction", function (field, command, value) {
                        GG.pasteHtmlAtCaret("[aside]<span class=\"html-editor-toolbar-caret\"></span>");
                        $(".html-editor-toolbar-caret", field).after("[/aside]").remove();
                        Compozr.dirty(true);
                    });
            }

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 66:
                            case 98:
                                // Ctrl + B
                                e.preventDefault();
                                trigger("bold");
                                break;
                            case 73:
                            case 105:
                                // Ctrl + I
                                e.preventDefault();
                                trigger("italic");
                                break;
                            case 85:
                            case 117:
                                // Ctrl + U
                                e.preventDefault();
                                trigger("underline");
                                break;
                        }
                    }
                });

                function trigger(button) {
                    $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=" + button + "]", that.container)
                        .trigger({
                            type: "mousedown",
                            which: 1
                        })
                        .trigger({
                            type: "mouseup",
                            which: 1
                        });
                }
            }
        },

        show: function () {
            $("[" + TOOLBAR_ITEM_ATTRIBUTE + "]", this.container).show();
        },

        hide: function () {
            $("[" + TOOLBAR_ITEM_ATTRIBUTE + "]", this.container).hide();
        },

        refresh: function () {
            this._super();

            var that = this,
                pasteItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=paste]", this.container),
                foreColorItem = $("[" + TOOLBAR_ITEM_ATTRIBUTE + "=forecolor][" + ROOT_ITEM_ATTRIBUTE + "]", this.container);
            Compozr.queueTask("finishRefresh",
                function () {
                    if (pasteItem.hasClass(DISABLED_CSS_CLASS)) {
                        pasteItem.popover("disable");
                    } else {
                        pasteItem.popover("enable");
                    }
                    if (foreColorItem.hasClass(DISABLED_CSS_CLASS)) {
                        foreColorItem.popover("disable");
                    } else {
                        foreColorItem.popover("enable");
                    }
                },
                function () {
                    return that.refreshLock === 0;
                }
            );
        },

        execCommand: function (field, toolbarItem, value) {
            this._super(field, toolbarItem, value);
            var command = toolbarItem.attr(TOOLBAR_ITEM_ATTRIBUTE);
            if (command === "createlink" && value && (value.indexOf("http://") === 0 || value.indexOf("https://") === 0)) {
                field.find("a[href=\"" + value + "\"]").attr("target", "_blank");
            }
        }
    });

})();
