/*!
 * Compozr
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - Modernizr
 * - Clean Html
 * - Phantom Net Namespace and Inheritance
 * - Phantom Net Utilities
 */

window.Compozr = (function ($, window, document, undefined) {

    "use strict";

    var DEFAULT_EVENT_DOMAIN = ".compozr",

        WAIT_ICON_CSS_CLASS = "glyphicon glyphicon-time",
        DISABLED_CSS_CLASS = "disabled",

        FIXED_TOP_NAVBAR_CSS_CLASS = "navbar-fixed-top",
        FIXED_BOTTOM_NAVBAR_CSS_CLASS = "navbar-fixed-bottom",

        STATIC_FORM_CONTROL_CSS_CLASS = "form-control-static",

        ERROR_ALERT_CSS_CLASS = "alert alert-danger",
        ERROR_PANEL_CSS_CLASS = "panel panel-danger",
        PANEL_HEADING_CSS_CLASS = "panel-heading",
        PANEL_TITLE_CSS_CLASS = "panel-title",
        PANEL_BODY_CSS_CLASS = "panel-body",
        ERROR_MESSAGES_CSS_CLASS = "compozr-error-messages",

        MENU_ITEM_ATTRIBUTE = "data-compozr-menu-item",
        MENU_ITEM_ALIAS_ATTRIBUTE = "data-compozr-menu-item-alias";

    var Compozr = {
        // Editor attributes
        CONTENTEDITABLE: "contenteditable",
        SINGLE_LINE: "data-compozr-single-line",
        NO_HTML: "data-compozr-no-html",
        URL_FRIENDLY: "data-compozr-url-friendly",
        PROTECTED: "data-compozr-protected",
        SELECT_ON_FOCUS: "data-compozr-select-on-focus",
        SELECT_ON_FIRST_FOCUS: "data-compozr-select-on-first-focus",
        EXCLUDED: "data-compozr-excluded",
        INCLUDED: "data-compozr-included",
        UNCENSORED: "data-compozr-uncensored",

        /// <field type="jQuery" />
        container: null,
        /// <field type="PlainObject" />
        menu: null,
        /// <field type="PlainObject" />
        menuWithAlias: null
    },

        _editorAttributes = [Compozr.CONTENTEDITABLE, Compozr.SINGLE_LINE, Compozr.NO_HTML, Compozr.URL_FRIENDLY,
            Compozr.PROTECTED, Compozr.SELECT_ON_FOCUS,
            Compozr.SELECT_ON_FIRST_FOCUS, Compozr.EXCLUDED, Compozr.INCLUDED, Compozr.UNCENSORED],

        _resources = {
            closeConfirm: null,
            newError: null,
            validationError: null,
            saveError: null,
            revertConfirm: null,
            deleteConfirm: null,
            deleteError: null,
            unhandledError: null
        },

        /// <var type="jQuery" />
        _errorMessages = null,

        _items = [],

        /// <var type="jQuery" />
        _progressModal = null,

        _taskQueue = [],

        /// <var type="Boolean" />
        _dirty;

    Compozr.init = function (container, resources) {
        /// <signature>
        ///   <param name="container" type="jQuery" />
        ///   <param name="resources" type="PlainObject" />
        /// </signature>

        this.container = $(container);
        _errorMessages = $("." + ERROR_MESSAGES_CSS_CLASS, this.container);
        _resources = $.extend(_resources, resources);

        initMenu();
        Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
        Compozr.dirty(false);

        var data = {
            show: true,
            attachEditorEvents: true
        };
        $Compozr.triggerHandler("init", data);

        if (data.show) {
            Compozr.fadeIn();
        }
        if (data.attachEditorEvents) {
            Compozr.attachEditorEvents();
        }

        initGlobalEvents();

        function initMenu() {
            var menuAlias = {};
            Compozr.menu = {};
            Compozr.menuWithAlias = {};

            var items = $("[" + MENU_ITEM_ATTRIBUTE + "]", Compozr.container).filter("[" + MENU_ITEM_ALIAS_ATTRIBUTE + "]");
            $.each(items, function (index, value) {
                var item = $(value),
                    key = item.attr(MENU_ITEM_ATTRIBUTE);
                if (menuAlias[key]) {
                    menuAlias[key] = menuAlias[key].add(item);
                } else {
                    menuAlias[key] = item;
                }
                item.on("click", function () {
                    Compozr.menu[key].click();
                });
            });

            items = $("[" + MENU_ITEM_ATTRIBUTE + "]", Compozr.container).not("[" + MENU_ITEM_ALIAS_ATTRIBUTE + "]");
            $.each(items, function (index, value) {
                var item = $(value),
                    key = item.attr(MENU_ITEM_ATTRIBUTE);
                Compozr.menu[key] = item;
                Compozr.menuWithAlias[key] = item.add(menuAlias[key]);
            });

            $Compozr.on("dirty" + DEFAULT_EVENT_DOMAIN, function (event, data) {
                if (data) {
                    Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).removeClass(DISABLED_CSS_CLASS);
                } else {
                    Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).addClass(DISABLED_CSS_CLASS);
                }
            });

            Compozr.menu.Save.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                if (!$(this).hasClass(DISABLED_CSS_CLASS)) {
                    Compozr.saveDoc();
                }
            });

            Compozr.menu.Revert.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                if (!$(this).hasClass(DISABLED_CSS_CLASS)) {
                    Compozr.revertDoc();
                }
            });
        }

        function initGlobalEvents() {
            $(window).on("beforeunload" + DEFAULT_EVENT_DOMAIN, function () {
                if (Compozr.dirty()) {
                    return _resources.closeConfirm;
                }
            });

            if (Modernizr.touch) { return; }
            $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                // Ctrl + S
                if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.which === 115 || e.which === 83)) {
                    e.preventDefault();
                    $(":focus").blur();
                    Compozr.menu.Save.click();
                }
            });
        }
    };

    // VISIBILITY

    Compozr.show = function () {
        this.container.stop().show();
    };

    Compozr.hide = function () {
        this.container.stop().hide();
    };

    Compozr.fadeIn = function () {
        this.container.stop(true, true).hide().fadeIn("slow");
    };

    Compozr.fadeOut = function () {
        this.container.stop(true, true).show().fadeOut("slow");
    };

    // EDITOR

    Compozr.dirty = function (value) {
        /// <signature>
        ///   <param name="value" type="Boolean" />
        /// </signature>
        /// <signature>
        ///   <returns type="Boolean" />
        /// </signature>

        if (value === true || value === false) {
            _dirty = value;
            $Compozr.triggerHandler("dirty", value);
        } else {
            return _dirty;
        }
    };

    Compozr.includeAllInputs = function (container) {
        /// <signature>
        ///   <param name="container" type="jQuery" />
        /// </signature>

        $("input", container)
            .add("textarea", container)
            .add("select", container)
            .add(container.filter("input"))
            .add(container.filter("textarea"))
            .add(container.filter("select"))
            .attr(Compozr.INCLUDED, "");
    };

    Compozr.attachEditorEvents = function (container) {
        /// <signature>
        ///   <param name="container" type="jQuery" />
        /// </signature>

        var contentEditable = $("[" + Compozr.CONTENTEDITABLE + "]", container).not("[" + Compozr.EXCLUDED + "]"),
            singleLine = contentEditable.filter("[" + Compozr.SINGLE_LINE + "]"),
            noHtml = contentEditable.filter("[" + Compozr.NO_HTML + "]"),
            urlFriendly = contentEditable.filter("[" + Compozr.URL_FRIENDLY + "]"),
            selectOnFocus = contentEditable.filter("[" + Compozr.SELECT_ON_FOCUS + "]"),
            selectOnFirstFocus = contentEditable.filter("[" + Compozr.SELECT_ON_FIRST_FOCUS + "]"),

            input = $("input", container).add("textarea", container).add("select", container).filter("[" + Compozr.INCLUDED + "]"),
            urlFriendlyInput = input.filter("[" + Compozr.URL_FRIENDLY + "]"),
            selectOnFocusInput = input.filter("[" + Compozr.SELECT_ON_FOCUS + "]"),
            selectOnFirstFocusInput = input.filter("[" + Compozr.SELECT_ON_FIRST_FOCUS + "]");

        contentEditable.off(DEFAULT_EVENT_DOMAIN);

        contentEditable.on("focus" + DEFAULT_EVENT_DOMAIN, function () {
            Compozr.fixSizeViewport();

            var $this = $(this);
            // TODO:: Investigate why don't apply select on focus on span
            if (!$this.is("[" + Compozr.CONTENTEDITABLE + "]")/* || $this.is("span")*/) {
                return;
            }

            if ($this.is(selectOnFocus)) {
                // Safari requires a delay
                window.setTimeout(function () {
                    if ($this.is(":focus") && !$this.is(":empty")) {
                        Compozr.selectAll();
                    }
                }, 1);
            }
            if ($this.is(selectOnFirstFocus)) {
                // Safari requires a delay
                window.setTimeout(function () {
                    if ($this.is(":focus") && !$this.is(":empty")) {
                        Compozr.selectAll();
                    }
                }, 1);
                selectOnFirstFocus = selectOnFirstFocus.not($this);
                $this.attr(Compozr.SELECT_ON_FIRST_FOCUS, null);
            }

            $Compozr.triggerHandler("inputfocus", this);
        });

        contentEditable.on("blur" + DEFAULT_EVENT_DOMAIN, function () {
            var $this = $(this),
                that = this;
            if (!$this.is("[" + Compozr.CONTENTEDITABLE + "]") || $this.is("span")) {
                return;
            }

            $Compozr.triggerHandler("inputblur", this);

            Compozr.restoreViewport();
        });

        contentEditable.on("keydown" + DEFAULT_EVENT_DOMAIN, function () {
            var $this = $(this);
            $this.data("prevValue", $this.html());
            $Compozr.triggerHandler("inputkeydown", this);
        });

        contentEditable.on("keyup" + DEFAULT_EVENT_DOMAIN, function () {
            var $this = $(this);
            if ($this.data("prevValue") !== undefined && $this.data("prevValue") !== $this.html()) {
                Compozr.dirty(true);
                $Compozr.triggerHandler("inputchange", this);
            }
            $this.removeData("prevValue");
            $Compozr.triggerHandler("inputkeyup", this);
        });

        contentEditable.on("paste" + DEFAULT_EVENT_DOMAIN, function () {
            var $this = $(this);
            if (!$this.is("[" + Compozr.UNCENSORED + "]")) {
                $this.cleanHtml("removeTags", { tags: ["script", "iframe"] });
            }
            Compozr.dirty(true);
            $Compozr.triggerHandler("inputpaste", this);
        });

        contentEditable.on("click" + DEFAULT_EVENT_DOMAIN, function () {
            $Compozr.triggerHandler("inputclick", this);
        });

        singleLine.on("keydown" + DEFAULT_EVENT_DOMAIN, function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }
        });

        singleLine.on("keyup" + DEFAULT_EVENT_DOMAIN +
            " paste" + DEFAULT_EVENT_DOMAIN +
            " blur" + DEFAULT_EVENT_DOMAIN, function (event) {
                var $this = $(this);
                window.setTimeout(function () {
                    if (event.type === "keyup") {
                        $this.cleanHtml("filterTags", { tags: ["font", "span", "b", "i", "u", "strong", "em", "br"] });
                    } else {
                        $this.cleanHtml("filterTags", { tags: ["font", "span", "b", "i", "u", "strong", "em"] });
                    }
                }, event.type === "paste" ? 10 : 0);
            });

        noHtml.on("keyup" + DEFAULT_EVENT_DOMAIN +
            " paste" + DEFAULT_EVENT_DOMAIN +
            " blur" + DEFAULT_EVENT_DOMAIN, function (event) {
                var $this = $(this);
                if ($this.find(".rangySelectionBoundary").is("*")) {
                    return;
                }
                window.setTimeout(function () {
                    $this.cleanHtml("filterTags", { tags: ["div", "p", "br"] });
                    $this.cleanHtml("filterAttrs"); // remove all attributes
                }, event.type === "paste" ? 10 : 0);
            });

        urlFriendly.on("paste" + DEFAULT_EVENT_DOMAIN +
            " blur" + DEFAULT_EVENT_DOMAIN, function (event) {
                var $this = $(this);
                if ($this.find(".rangySelectionBoundary").is("*")) {
                    return;
                }
                window.setTimeout(function () {
                    $this.html(GG.toUrlFriendly($this.html()));
                }, event.type === "paste" ? 10 : 0);
            });

        input.off(DEFAULT_EVENT_DOMAIN);

        input.on("focus" + DEFAULT_EVENT_DOMAIN + " select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
            Compozr.fixSizeViewport();

            var $this = $(this);

            if ($this.is(selectOnFocusInput)) {
                // Safari requires a delay
                window.setTimeout(function () {
                    Compozr.selectAll();
                }, 1);
            }
            if ($this.is(selectOnFirstFocusInput)) {
                // Safari requires a delay
                window.setTimeout(function () {
                    Compozr.selectAll();
                }, 1);
                selectOnFirstFocusInput = selectOnFirstFocusInput.not($this);
                $this.attr(Compozr.SELECT_ON_FIRST_FOCUS, null);
            }

            $Compozr.triggerHandler("inputfocus", this);
        });

        input.on("blur" + DEFAULT_EVENT_DOMAIN + " select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
            var $this = $(this),
                that = this;

            $Compozr.triggerHandler("inputblur", this);

            Compozr.restoreViewport();
        });

        input.on("keydown" + DEFAULT_EVENT_DOMAIN, function () {
            $Compozr.triggerHandler("inputkeydown", this);
        });

        input.on("keyup" + DEFAULT_EVENT_DOMAIN, function () {
            $Compozr.triggerHandler("inputkeyup", this);
        });

        input.on("paste" + DEFAULT_EVENT_DOMAIN, function () {
            $Compozr.triggerHandler("inputpaste", this);
        });

        input.on("click" + DEFAULT_EVENT_DOMAIN, function () {
            $Compozr.triggerHandler("inputclick", this);
        });

        input.on("change" + DEFAULT_EVENT_DOMAIN, function () {
            Compozr.dirty(true);
            $Compozr.triggerHandler("inputchange", this);
        });

        urlFriendlyInput.on("paste" + DEFAULT_EVENT_DOMAIN +
            " blur" + DEFAULT_EVENT_DOMAIN, function (event) {
                var $this = $(this);
                $this.val(GG.toUrlFriendly($this.val()));
                if (typeof ($this.valid) === "function") {
                    $this.valid();
                }
            });
    };

    Compozr.detachEditorEvents = function (container) {
        /// <signature>
        ///   <param name="container" type="jQuery" />
        /// </signature>

        $("[" + Compozr.CONTENTEDITABLE + "]", container).not("[" + Compozr.EXCLUDED + "]").off(DEFAULT_EVENT_DOMAIN);
        $("input", container).add("textarea", container).add("select", container).filter("[" + Compozr.INCLUDED + "]").off(DEFAULT_EVENT_DOMAIN);
    };

    Compozr.removeEditorAttrs = function (field) {
        /// <signature>
        ///   <param name="field" type="jQuery" />
        ///   <returns type="jQuery" />
        /// </signature>

        field.cleanHtml("removeAttrs", { attrs: _editorAttributes });
        return field;
    };

    Compozr.selectAll = function () {
        if (document.queryCommandEnabled("selectAll")) {
            document.execCommand("selectAll", false, null);
        }
    };

    Compozr.fixSizeViewport = function () {
        if (Modernizr.touch) {
            var viewport = $("meta[name=viewport]");
            viewport.data("original", viewport.attr("content"))
                    .attr("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");

            $("." + FIXED_TOP_NAVBAR_CSS_CLASS).css({
                position: "absolute",
                top: "0px"
            });
            $("." + FIXED_BOTTOM_NAVBAR_CSS_CLASS).css({
                position: "static"
            });
            window.setTimeout(function () {
                $("." + FIXED_BOTTOM_NAVBAR_CSS_CLASS).css({
                    position: "relative",
                    top: $("body").css("padding-bottom")
                });
            }, 10);
        }
    };

    Compozr.restoreViewport = function () {
        if (Modernizr.touch) {
            var viewport = $("meta[name=viewport]");
            viewport.attr("content", viewport.data("original"));

            $("." + FIXED_TOP_NAVBAR_CSS_CLASS).css({
                position: ""
            });
            $("." + FIXED_BOTTOM_NAVBAR_CSS_CLASS).css({
                position: "",
                top: ""
            });
        }
    };

    // ITEMS

    Compozr.addItem = function (item) {
        /// <signature>
        ///   <param name="item" type="Compozr.ItemBase" />
        /// </signature>

        _items.push(item);
        item.backup();
        item.makeEdit();
    };

    Compozr.backupAllItems = function () {
        $.each(_items, function (index, value) {
            value.backup();
        });
    };

    Compozr.restoreAllItems = function () {
        $.each(_items, function (index, value) {
            value.restore();
        });
    };

    Compozr.makeEditAllItems = function () {
        $.each(_items, function (index, value) {
            value.makeEdit();
        });
    };

    Compozr.getAllItemsValues = function () {
        /// <signature>
        ///   <returns type="PlainObject" />
        /// </signature>

        var ret = {};
        $.each(_items, function (index, value) {
            ret[value.element] = value.val();
        });
        return ret;
    };

    // RETRIEVING DATA

    Compozr.retrieveBlockText = function (field) {
        /// <signature>
        ///   <param name="field" type="jQuery" />
        ///   <returns type="String" />
        /// </signature>

        var ret = $.trim(field.html());
        while ($(ret).is("div") && !$(ret).attr("style")) {
            ret = $(ret).html();
        }
        field.html(ret);
        if (field.attr("style")) {
            field.html($("<div></div>").attr("style", field.attr("style"))
                                       .html(ret));
            ret = field.html();
            field.removeAttr("style");
        }
        return ret;
    };

    // PROGRESS
    Compozr.startProgress = function (total, message) {
        /// <signature>
        ///   <param name="total" type="Number" />
        ///   <param name="message" type="String" />
        /// </signature>

        var progress = _formatProgress();
        $(".progress-bar", progress).attr("aria-valuemax", total);
        _progressModal = _formatModal(null, false, message, progress);
        _progressModal.modal({
            backdrop: "static",
            keyboard: false
        });
    };

    Compozr.increaseProgress = function (amount, message) {
        /// <signature>
        ///   <param name="amount" type="Number" />
        ///   <param name="message" type="String" />
        /// </signature>

        if (!_progressModal.is("*")) {
            return;
        }
        var bar = $(".progress-bar", _progressModal),
            current = parseInt(bar.attr("aria-valuenow"));
        Compozr.setProgress(current + amount, message);
    };

    Compozr.setProgress = function (current, message) {
        /// <signature>
        ///   <param name="current" type="Number" />
        ///   <param name="message" type="String" />
        /// </signature>

        if (!_progressModal.is("*")) {
            return;
        }
        var bar = $(".progress-bar", _progressModal),
            total = parseInt(bar.attr("aria-valuemax")),
            percent = Math.floor(current * 100 / total) + "%";
        bar.attr("aria-valuenow", current)
           .width(percent)
           .html(percent);
        if (message) {
            $(".modal-title", _progressModal).html(message);
        }
    };

    Compozr.endProgress = function () {
        _progressModal.on("hidden.bs.modal", function () {
            $(this).remove();
        });
        _progressModal.modal("hide");
        _progressModal = $();
    };

    // TASK QUEUE

    Compozr.queueTask = function (name, action, condition) {
        /// <signature>
        ///   <param name="name" type="String" />
        ///   <param name="action()" type="Function" />
        ///   <param name="condition()" type="Function" />
        /// </signature>

        _taskQueue.push({
            name: name,
            action: action,
            condition: condition
        });

        _execNextTask();
    };

    Compozr.cancelTask = function (name) {
        /// <signature>
        ///   <param name="name" type="String" />
        /// </signature>

        if (_taskQueue.timeoutId) {
            window.clearTimeout(_taskQueue.timeoutId);
            _taskQueue.timeoutId = null;
        }

        for (var i = 0; i < _taskQueue.length; i++) {
            if (_taskQueue[i].name === name) {
                _taskQueue.splice(i, 1);
                i--;
            }
        }

        _execNextTask();
    };

    // DOCUMENTS

    Compozr.newDoc = function () {
        if (!Compozr.dirty() || window.confirm(_resources.closeConfirm)) {
            $Compozr.triggerHandler("newDoc");
        }
    };

    Compozr.saveDoc = function () {
        Compozr.clearErrorMessages();
        $Compozr.triggerHandler("saveDoc");
    };

    Compozr.revertDoc = function () {
        if (window.confirm(_resources.revertConfirm)) {
            Compozr.clearErrorMessages();
            Compozr.dirty(false);
            $Compozr.triggerHandler("revertDoc");
            Compozr.restoreAllItems();
            Compozr.makeEditAllItems();
            Compozr.attachEditorEvents();
        }
    };

    Compozr.deleteDoc = function () {
        if (window.confirm(_resources.deleteConfirm)) {
            $Compozr.triggerHandler("deleteDoc");
        }
    };

    // NETWORKING

    Compozr.postNew = function (newUrl, menuItem, data, onSuccess) {
        /// <signature>
        ///   <param name="newUrl" type="String" />
        ///   <param name="menuItem" type="jQuery" />
        ///   <param name="data" type="PlainObject" />
        ///   <param name="onSuccess(data, textStatus, jqXHR)" type="Function" />
        ///   <returns type="jqXHR" />
        /// </signature>

        if (menuItem) {
            _beginMenuItemWait(menuItem);
        }
        return Compozr.postJSON(newUrl, {
            data: data,
            onSuccess: function (data, textStatus, jqXHR) {
                if (!onSuccess || (onSuccess(data, textStatus, jqXHR) !== false)) {
                    if (data.redirectUrl) {
                        Compozr.dirty(false);
                        window.location = data.redirectUrl;
                    }
                }
            },
            onUnsuccess: function (data/*, textStatus, jqXHR*/) {
                Compozr.showErrorMessages(_resources.newError, data.messages);
                if (menuItem) {
                    _endMenuItemWait(menuItem);
                }
            }
        });
    };

    Compozr.postSave = function (saveUrl, menuItems, data, onSuccess) {
        /// <signature>
        ///   <param name="saveUrl" type="String" />
        ///   <param name="menuItem" type="jQuery" />
        ///   <param name="data" type="PlainObject" />
        ///   <param name="onSuccess(data, textStatus, jqXHR)" type="Function" />
        ///   <returns type="jqXHR" />
        /// </signature>

        if (menuItems) {
            $.each(menuItems, function (index, value) {
                _beginMenuItemWait($(value));
            });
        }
        return Compozr.postJSON(saveUrl, {
            data: data,
            onSuccess: function (data, textStatus, jqXHR) {
                if (!onSuccess || (onSuccess(data, textStatus, jqXHR) !== false)) {
                    Compozr.backupAllItems();
                    Compozr.dirty(false);
                }
            },
            onUnsuccess: function (data/*, textStatus, jqXHR*/) {
                Compozr.dirty(true);
                Compozr.showSaveErrorMessages(data);
            },
            onComplete: function () {
                if (menuItems) {
                    if (menuItems) {
                        $.each(menuItems, function (index, value) {
                            _endMenuItemWait($(value));
                        });
                    }
                }
            }
        });
    };

    Compozr.postDelete = function (deleteUrl, menuItem, onSuccess) {
        /// <signature>
        ///   <param name="deleteUrl" type="String" />
        ///   <param name="menuItem" type="jQuery" />
        ///   <param name="onSuccess(data, textStatus, jqXHR)" type="Function" />
        ///   <returns type="jqXHR" />
        /// </signature>

        if (menuItem) {
            _beginMenuItemWait(menuItem);
        }
        return Compozr.postJSON(deleteUrl, {
            onSuccess: function (data, textStatus, jqXHR) {
                if (!onSuccess || (onSuccess(data, textStatus, jqXHR) !== false)) {
                    // TODO:: Migrate to new format
                    var backUrl = data.backUrl || data.ExtraInfo.backUrl;
                    if (backUrl) {
                        Compozr.dirty(false);
                        window.location = backUrl;
                    }
                }
            },
            onUnsuccess: function (data/*, textStatus, jqXHR*/) {
                Compozr.showErrorMessages(_resources.deleteError, data.messages);
            },
            onComplete: function () {
                if (menuItem) {
                    _endMenuItemWait(menuItem);
                }
            }
        });
    };

    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    Compozr.getJSON = function (url, options) {
        /// <signature>
        ///   <param name="url" type="String" />
        ///   <param name="options" type="PlainObject" />
        ///   <returns type="jqXHR" />
        /// </signature>

        options = $.extend({
            onError: function (jqXHR, textStatus, errorThrown) {
                Compozr.showErrorMessages(_resources.unhandledError, [errorThrown, _processErrorResponseText(jqXHR.responseText)]);
                return false;
            }
        }, options);
        return GG.getJSON(url, options);
    };

    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    Compozr.postJSON = function (url, options) {
        /// <signature>
        ///   <param name="url" type="String" />
        ///   <param name="options" type="PlainObject" />
        ///   <returns type="jqXHR" />
        /// </signature>

        options = $.extend({
            onError: function (jqXHR, textStatus, errorThrown) {
                Compozr.showErrorMessages(_resources.unhandledError, [errorThrown, _processErrorResponseText(jqXHR.responseText)]);
                return false;
            }
        }, options);
        return GG.postJSON(url, options);
    };

    // MESSAGES

    Compozr.showErrorMessages = function (title, messages) {
        /// <signature>
        ///   <param name="title" type="String" />
        ///   <param name="messages" type="Array" />
        /// </signature>

        if (_errorMessages.data("fadeTimeoutId")) {
            window.clearTimeout(_errorMessages.data("fadeTimeoutId"));
            _errorMessages.removeData("fadeTimeoutId");
        }
        _errorMessages.html("");

        if (messages && messages.length > 0) {
            var panelTitle, panelBody, list,
                panel = $("<div></div>").addClass(ERROR_PANEL_CSS_CLASS)
                                        .append($("<div></div>").addClass(PANEL_HEADING_CSS_CLASS)
                                                                .append(panelTitle = $("<h1></h1>").addClass(PANEL_TITLE_CSS_CLASS)))
                                        .append(panelBody = $("<div></div>").addClass(PANEL_BODY_CSS_CLASS)
                                                                           .append(list = $("<ul></ul>")));
            panelTitle.html(title);
            $.each(messages, function (index, value) {
                if ((typeof value) === "object") {
                    if (value.Errors) {
                        $.each(value.Errors, function (errorIndex, errorValue) {
                            list.append($("<li></li>").html(errorValue));
                        });
                    }
                } else {
                    list.append($("<li></li>").html(value));
                }
            });
            _errorMessages.append(panel);
        } else {
            var alert = $("<div></div>").addClass(ERROR_ALERT_CSS_CLASS)
                                        .html(title);
            _errorMessages.append(alert);
        }

        _errorMessages.fadeIn("fast");

        _errorMessages.data("fadeTimeoutId", window.setTimeout(function () {
            _errorMessages.removeData("fadeTimeoutId");
            Compozr.clearErrorMessages();
        }, 10000));
    };

    Compozr.showSaveErrorMessages = function (data) {
        /// <signature>
        ///   <param name="data" type="PlainObject" />
        /// </signature>

        Compozr.showErrorMessages(data.messages.length === 0 ? _resources.saveError : _resources.validationError,
            data.messages);
    };

    Compozr.clearErrorMessages = function () {
        if (_errorMessages.data("fadeTimeoutId")) {
            window.clearTimeout(_errorMessages.data("fadeTimeoutId"));
            _errorMessages.removeData("fadeTimeoutId");
        }

        _errorMessages.fadeOut("fast").html("");
    };

    // HELPERS

    function _execNextTask() {
        if (_taskQueue.timeoutId) {
            window.clearTimeout(_taskQueue.timeoutId);
            _taskQueue.timeoutId = null;
        }

        if (_taskQueue.length === 0) { return; }

        var task = _taskQueue[0];
        if (!task.condition || task.condition()) {
            _taskQueue.shift();
            task.action();
        }

        if (_taskQueue.length > 0) {
            _taskQueue.timeoutId = window.setTimeout(function () {
                _taskQueue.timeoutId = null;
                _execNextTask();
            }, 100);
        }
    }

    function _beginMenuItemWait(menuItem) {
        /// <signature>
        ///   <param name="menuItem" type="jQuery" />
        /// </signature>

        $.each(menuItem, function (index, value) {
            var key = $(value).attr(MENU_ITEM_ATTRIBUTE),
                items = Compozr.menuWithAlias[key];
            $.each(items, function (itemIndex, itemValue) {
                var item = $(itemValue);
                item.before(item.clone().addClass(DISABLED_CSS_CLASS)
                                        .removeAttr(MENU_ITEM_ATTRIBUTE)
                                        .find("span").parent().empty()
                                                              .append($("<span></span>").addClass(WAIT_ICON_CSS_CLASS))
                                                              .end()
                                                     .end());
                if (item.is(":visible")) {
                    item.hide()
                        .prev().show();
                } else {
                    item.prev().hide();
                }
            });
        });
    }

    function _endMenuItemWait(menuItem) {
        /// <signature>
        ///   <param name="menuItem" type="jQuery" />
        /// </signature>

        $.each(menuItem, function (index, value) {
            var key = $(value).attr(MENU_ITEM_ATTRIBUTE),
                items = Compozr.menuWithAlias[key];
            $.each(items, function (itemIndex, itemValue) {
                var item = $(itemValue);
                if (item.prev().is(":visible")) {
                    item.show();
                }
                item.prev().remove();
            });
        });
    }

    function _processErrorResponseText(error) {
        /// <signature>
        ///   <param name="error" type="String" />
        ///   <returns type="String" />
        /// </signature>

        var regexp = /<style>([.\s\S]*)<\/style>/,
                match = error.match(regexp),
                style = match ? match[1] : "",
                styles = style.split("\n"),
                newStyles = "";
        $.each(styles, function (index, value) {
            if ($.trim(value) !== "") {
                value = "." + ERROR_MESSAGES_CSS_CLASS + " " + value;
                newStyles += value + "\n";
            }
        });
        error = error.replace(regexp, "<style>\n" + newStyles + "\n</style>");
        return error;
    }

    function _formatProgress(element) {
        /// <signature>
        ///   <param name="element" type="jQuery" />
        ///   <returns type="jQuery" />
        /// </signature>

        element = element || $("<div></div>");
        element.addClass("progress progress-striped active")
               .append($("<div></div>").addClass("progress-bar")
                                       .css({
                                           "-moz-transition": "none",
                                           "-o-transition": "none",
                                           "-webkit-transition": "none",
                                           "transition": "none"
                                       })
                                       .attr({
                                           "role": "progressbar",
                                           "aria-valuenow": "0",
                                           "aria-valuemin": "0",
                                           "aria-valuemax": "100"
                                       })
                                       .width("0%")
                                       .html("0%"));
        return element;
    }

    function _formatModal(element, allowClose, title, content) {
        /// <signature>
        ///   <param name="element" type="jQuery" />
        ///   <param name="allowClose" type="Boolean" />
        ///   <param name="title" type="String" />
        ///   <param name="content" type="String" />
        ///   <returns type="jQuery" />
        /// </signature>

        element = element || $("<div></div>");
        element.addClass("modal fade")
               .append($("<div></div>").addClass("modal-dialog")
                                       .append($("<div></div>").addClass("modal-content")
                                                               .append($("<div></div>").addClass("modal-header")
                                                                                       .append(allowClose ? $("<button></button>").addClass("close")
                                                                                                                                  .attr("data-dismiss", "modal")
                                                                                                                                  .attr("aria-hidden", "true")
                                                                                                                                  .html("&times;") : null)
                                                                                       .append($("<h4></h4>").addClass("modal-title")
                                                                                                             .html(title)))
                                                               .append($("<div></div>").addClass("modal-body")
                                                                                       .append(content))));
        return element;
    }

    // CLASSES

    Compozr.ItemBase = GG.Class.extend({
        element: $(),

        backup: function () {
            this.element.data("original", this.element.html());
        },

        restore: function () {
            this.element.html(this.element.data("original"));
        },

        makeEdit: function () {
            this.element.attr(Compozr.CONTENTEDITABLE, "true");
        },

        init: function (element) {
            this.element = element.jQuery ? element : $(element);
        },

        val: function () {
            /// <signature>
            ///   <returns type="String" />
            /// </signature>

            var clonedElement = this.element.clone();
            $("[" + Compozr.PROTECTED + "]", clonedElement).each(function (index, value) {
                var $value = $(value);
                $value.html($value.attr(Compozr.PROTECTED));
            });
            return Compozr.removeEditorAttrs(clonedElement).html();
        }
    });

    Compozr.TextBlock = Compozr.ItemBase.extend({
        val: function () {
            /// <signature>
            ///   <returns type="String" />
            /// </signature>

            return Compozr.retrieveBlockText(this.element);
        }
    });

    Compozr.DataForm = Compozr.ItemBase.extend({
        makeEdit: function () {
            this.element.find("h1").attr(Compozr.CONTENTEDITABLE, "true");
            this.element.find("." + STATIC_FORM_CONTROL_CSS_CLASS).not("[" + Compozr.PROTECTED + "]").attr(Compozr.CONTENTEDITABLE, "true");
        }
    });

    return Compozr;

})(jQuery, window, document);

window.$Compozr = $(Compozr);