/*!
 * Toolbar Base for Compozr
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - Rangy
 * - Phantom Net Namespace and Inheritance
 * - Compozr
 */

(function () {

    "use strict";

    var DEFAULT_EVENT_DOMAIN = ".compozr-toolbar",
        DISABLED_CSS_CLASS = "disabled",
        DROPDOWN_CSS_CLASS = "dropdown",
        DROPDOWN_TOGGLE_CSS_CLASS = "dropdown-toggle",
        DROPDOWN_OPEN_CSS_CLASS = "open",
        TOOLBAR_ITEM_ATTRIBUTE = "data-compozr-toolbar-item",
        COMMAND_VALUE_ATTRIBUTE = "data-compozr-command-value";

    Compozr.ToolbarBase = GG.Class.extend({
        container: $(),
        resources: null,

        field: null,
        selection: null,

        refreshLock: 0,

        init: function (container, resources) {
            this.container = $(container);
            if (!this.container.is("*")) {
                return;
            }
            this.resources = $.extend(this.resources, resources);

            var that = this;
            $Compozr.on("inputfocus" + DEFAULT_EVENT_DOMAIN +
                " inputblur" + DEFAULT_EVENT_DOMAIN +
                " inputkeydown" + DEFAULT_EVENT_DOMAIN +
                " inputkeyup" + DEFAULT_EVENT_DOMAIN +
                " inputpaste" + DEFAULT_EVENT_DOMAIN +
                " inputclick" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.refreshLock === 0) {
                        that.refreshLock++;
                        window.setTimeout(function () {
                            that.refreshLock--;
                            that.refresh();
                        }, 500);
                    }
                });

            this.attachEvents(this.container);

            this.refresh();
        },

        attachEvents: function (container) {
            var that = this,
                items = container.is("[" + TOOLBAR_ITEM_ATTRIBUTE + "]") ? container : $("[" + TOOLBAR_ITEM_ATTRIBUTE + "]", container);

            items
                .off("mousedown" + DEFAULT_EVENT_DOMAIN)
                .off("mouseup" + DEFAULT_EVENT_DOMAIN)
                .on("mousedown" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (e.which === 1) {
                        that.onItemMouseDown();
                    }
                })
                .on("mouseup" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (e.which === 1) {
                        that.onItemMouseUp($(this));
                    }
                });
        },

        onItemMouseDown: function () {
            if (!this.isFieldSupported($(":focus"))) {
                return;
            }
            this.field = $(":focus");
            if (!this.field.is("*")) {
                this.field = null;
                this.selection = null;
                return;
            }

            var that = this;

            this.selection = rangy.saveSelection();

            // Not applicable on touch screen, would cause a bug that prevents item from being clicked
            if (!Modernizr.touch) {
                // Mouse up outside toolbar item
                $(document).on("mouseup" + DEFAULT_EVENT_DOMAIN, function (e) {
                    $(this).off("mouseup" + DEFAULT_EVENT_DOMAIN);
                    if (e.which === 1) {
                        that.restoreSelection();
                    }
                });
            }
        },

        onItemMouseUp: function (item) {
            if (!Modernizr.touch) {
                $(document).off("mouseup" + DEFAULT_EVENT_DOMAIN);
            }

            if (item.hasClass(DISABLED_CSS_CLASS)) {
                this.restoreSelection(this.field);
                return;
            }

            var value;
            if (item.attr(COMMAND_VALUE_ATTRIBUTE)) {
                value = item.attr(COMMAND_VALUE_ATTRIBUTE);
            }
            if (item.data("getCommandValue")) {
                value = item.data("getCommandValue").call(item);
            }

            this.execCommand(this.field, item, value);

            this.field = null;
        },

        refresh: function () {
            var that = this,
                field = $(":focus");
            // Safari requires a delay
            this.refreshLock++;
            window.setTimeout(function () {
                $.each($("[" + TOOLBAR_ITEM_ATTRIBUTE + "]", that.container), function (index, value) {
                    var $this = $(value),
                        command = $this.attr(TOOLBAR_ITEM_ATTRIBUTE);

                    var enabled = false;
                    if (that.isFieldSupported(field) &&
                        document.queryCommandSupported(command) && document.queryCommandEnabled(command)) {
                        enabled = true;
                    }
                    if ($this.data("queryCommandEnabled") && $this.data("queryCommandEnabled").call($this, field, command)) {
                        enabled = true;
                    }
                    if (enabled) {
                        $this.removeClass(DISABLED_CSS_CLASS);
                    } else {
                        $this.addClass(DISABLED_CSS_CLASS);
                    }

                    if ($this.hasClass(DROPDOWN_CSS_CLASS)) {
                        var toggler = $("." + DROPDOWN_TOGGLE_CSS_CLASS, $this);
                        if (enabled) {
                            toggler.removeClass(DISABLED_CSS_CLASS);
                        } else {
                            if ($this.hasClass(DROPDOWN_OPEN_CSS_CLASS)) {
                                $this.removeClass(DROPDOWN_OPEN_CSS_CLASS);
                            }
                            toggler.addClass(DISABLED_CSS_CLASS);
                        }
                    }
                });
                that.refreshLock--;
            }, 1);
        },

        execCommand: function (field, toolbarItem, value) {
            this.restoreSelection(field);

            var command = toolbarItem.attr(TOOLBAR_ITEM_ATTRIBUTE);
            if (toolbarItem.data("commandFunction")) {
                toolbarItem.data("commandFunction").call(toolbarItem, field, command, value);
            } else {
                if (document.queryCommandEnabled(command)) {
                    document.execCommand(command, false, value);
                    Compozr.dirty(true);
                }
            }
        },

        restoreSelection: function (field) {
            field = field || this.field;

            if (field === null || !field.is("*")) { return; }

            field.focus();
            if (this.selection) {
                try {
                    rangy.restoreSelection(this.selection);
                    this.selection = null;
                } catch (e) {
                }
            }
        },

        isFieldSupported: function (field) {
            return field.is("[" + Compozr.CONTENTEDITABLE + "]") &&
                !field.is("[" + Compozr.EXCLUDED + "]") &&
                !field.is("[" + Compozr.NO_HTML + "]");
        }
    });

})();
