/*!
 * jQuery plugin
 * Clean Html
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 */

(function ($, window, document, undefined) {

    "use strict";

    var PLUGIN_NAME = "cleanHtml";

    var methods = {

        format: function (/*options*/) {
        },

        removeTags: function (options) {
            return _processTags(this, true, options);
        },

        filterTags: function (options) {
            return _processTags(this, false, options);
        },

        removeAttrs: function (options) {
            return _processAttrs(this, true, options);
        },

        filterAttrs: function (options) {
            return _processAttrs(this, false, options);
        }
    };

    $.fn[PLUGIN_NAME] = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.format.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery." + PLUGIN_NAME);
        }
    };

    function _processTags(elements, remove, options) {
        options = $.extend({
            childrenOnly: true,
            tags: []
        }, options);

        $.each(elements.children(), function (index, value) {
            _processTags($(value), remove,
            {
                childrenOnly: false,
                tags: options.tags
            });
        });

        if (options.childrenOnly) { return elements; }

        var ret = [];
        $.each(elements, function (/*index, value*/) {
            if ((remove && $.inArray(this.tagName.toLowerCase(), options.tags) > -1) ||
                (!remove && $.inArray(this.tagName.toLowerCase(), options.tags) === -1)) {
                var $this = $(this),
                    html = $this.html(),
                    $html;
                $this.html("")
                     .after(html)
                     .remove();

                try { $html = $(html); }
                catch (e) { $html = $(""); }
                if (!$html.is("*")) {
                    $html = $this;
                    $html.html(html);
                }
                ret.push($html);
            } else {
                ret.push(this);
            }
        });
        return $.apply($, ret);
    }

    function _processAttrs(elements, remove, options) {
        options = $.extend({
            childrenOnly: true,
            attrs: []
        }, options);

        $.each(elements.children(), function (index, value) {
            _processAttrs($(value), remove,
            {
                childrenOnly: false,
                attrs: options.attrs
            });
        });

        if (options.childrenOnly) { return elements; }

        $.each(elements, function (/*index, value*/) {
            var $this = $(this),
                attributes = [];
            $.each(this.attributes, function (/*index, value*/) {
                if (this.name && ((remove && $.inArray(this.name, options.attrs) > -1) ||
                    (!remove && $.inArray(this.name, options.attrs) === -1))) {
                    attributes.push(this.name);
                }
            });
            $.each(attributes, function (index, value) {
                $this.removeAttr(value);
            });
        });
        return elements;
    }

})(jQuery, window, document);

/*!
 * jQuery plugin
 * Color Picker
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 */

(function ($, window, document, undefined) {

    "use strict";

    var PLUGIN_NAME = "colorPicker",
        PLUGIN_NAMESPACE = "gg." + PLUGIN_NAME,
        DEFAULT_EVENT_DOMAIN = "." + PLUGIN_NAMESPACE,
        PLUGIN_CSS_CLASS = "color-picker",

        _original = null;

    // PUBLIC CLASS DEFINITION
    // =======================

    var ColorPicker = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn[PLUGIN_NAME].defaults, options);
        this.init();
    };

    ColorPicker.prototype.init = function () {
        this.$element.addClass(PLUGIN_CSS_CLASS);
        _original = this.$element.html();

        var that = this,
            list = $("<ul></ul>");
        this.$element.append(list);
        $.each(this.options.colors, function (index, value) {
            var item = $("<li></li>").data(PLUGIN_NAMESPACE + ".color", value);
            that.options.formatItem(item, value);
            list.append(item);
            item.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.$element.trigger("select." + PLUGIN_NAMESPACE, $(this).data(PLUGIN_NAMESPACE + ".color"));
            });
        });
    };

    ColorPicker.prototype.destroy = function () {
        this.$element.html(_original)
                     .removeClass(PLUGIN_CSS_CLASS);
        _original = null;
    };

    // PLUGIN DEFINITION
    // =================

    var old = $.fn[PLUGIN_NAME];

    $.fn[PLUGIN_NAME] = function (option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data(PLUGIN_NAMESPACE),
                options = typeof option === "object" && option;

            if (!data && option === "destroy") { return; }
            if (!data) { $this.data(PLUGIN_NAMESPACE, (data = new ColorPicker(this, options))); }
            if (typeof option === "string") { data[option](); }
        });
    };

    $.fn[PLUGIN_NAME].defaults = {
        colors: [
            "#ffffff", "#000000", "#eeece1", "#1f497d", "#4f81bd", "#c0504d", "#9bbb59", "#8064a2", "#4bacc6", "#f79646", "#ffff00",
            "#f2f2f2", "#7f7f7f", "#ddd9c3", "#c6d9f0", "#dbe5f1", "#f2dcdb", "#ebf1dd", "#e5e0ec", "#dbeef3", "#fdeada", "#fff2ca",
            "#d8d8d8", "#595959", "#c4bd97", "#8db3e2", "#b8cce4", "#e5b9b7", "#d7e3bc", "#ccc1d9", "#b7dde8", "#fbd5b5", "#ffe694",
            "#bfbfbf", "#3f3f3f", "#938953", "#548dd4", "#95b3d7", "#d99694", "#c3d69b", "#b2a2c7", "#b7dde8", "#fac08f", "#f2c314",
            "#a5a5a5", "#262626", "#494429", "#17365d", "#366092", "#953734", "#76923c", "#5f497a", "#92cddc", "#e36c09", "#c09100",
            "#7f7f7f", "#0c0c0c", "#1d1b10", "#0f243e", "#244061", "#632423", "#4f6128", "#3f3151", "#31859b", "#974806", "#7f6000"
        ],
        formatItem: function (item, color) {
            item.css("background", color);
        }
    };

    // NO CONFLICT
    // ===========

    $.fn[PLUGIN_NAME].noConflict = function () {
        $.fn[PLUGIN_NAME] = old;
        return this;
    };

})(jQuery, window, document);

/*!
 * Phantom Net Namespace and Inheritance
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Inspired by Simple JavaScript Inheritance By John Resig http://ejohn.org/
 * Inspired by base2 and Prototype
 */

(function (window, document, undefined) {

    "use strict";

    if (window.GG !== undefined) {
        return;
    }

    ////////////////////////////////////////////////////////////////
    // namespace
    window.GG = {};
    var GG = window.GG;

    GG.namespace = function () {
        var a = arguments, o = null, i, j, d;
        for (i = 0; i < a.length; i++) {
            d = a[i].split(".");
            o = window;
            for (j = 0; j < d.length; j++) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
        return o;
    };
 
    ////////////////////////////////////////////////////////////////
    // Class
    var _initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = function () { };
    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        _initializing = true;
        var prototype = new this();
        _initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" &&
                typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function NewClass() {
            // All construction is actually done in the init method
            if (!_initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        // Populate our constructed prototype object
        NewClass.prototype = prototype;

        // Enforce the constructor to be what we expect
        NewClass.prototype.constructor = NewClass;

        // And make this class extendable
        NewClass.extend = Class.extend;

        return NewClass;
    };

    GG.Class = Class;

})(window, document);

/*!
 * Phantom Net Utilities
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - jQuery.UI
 */

(function ($, window, document, undefined) {

    "use strict";

    if (window.GG === undefined) {
        window.GG = function () { };
    }
    var GG = window.GG;

    if (GG.Globalization !== undefined) {
        return;
    }

    ////////////////////////////////////////////////////////////////
    // Globalization
    var currentCulture = '';
    var Globalization = GG.Class.extend({

        getCurrentCulture: function () {
            return currentCulture;
        },

        setCurrentCulture: function (culture) {
            currentCulture = culture;
            switch (culture) {
                case 'vi':
                    $.validator.addMethod('date', function (value, element) {
                        return true;
                    });
                    $.validator.addMethod('number', function (value, element) {
                        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:.\d{3})+)?(?:\,\d+)?$/.test(value);
                    });
                    break;
                default:
                    if (currentCulture == '') {
                        return;
                    }

                    // Reset to default
                    $.validator.addMethod('date', function (value, element) {
                        return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
                    });
                    $.validator.addMethod('number', function (value, element) {
                        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
                    });
                    break;
            }
        }

    });

    GG.Globalization = new Globalization();

    ////////////////////////////////////////////////////////////////
    // showErrorMessages
    GG.showErrorMessages = function (messages) {
        alert(messages);
    };

    ////////////////////////////////////////////////////////////////
    // toAscii
    var _unicode = "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴđĐ",
        _ascii = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYdD";
    GG.toAscii = function (source) {
        for (var i = 0; i < _unicode.length; i++) {
            var regexp = new RegExp(_unicode.substr(i, 1), "g");
            source = source.replace(regexp, _ascii.substr(i, 1));
        }
        return source;
    };

    ////////////////////////////////////////////////////////////////
    // outerHtml
    GG.outerHtml = function (elements) {
        return $("<div></div>").append($(elements).clone()).html();
    };

    ////////////////////////////////////////////////////////////////
    // textWithLineBreaks
    GG.textWithLineBreaks = function (html) {
        var breakToken = '_______break_______',
            lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken)
                                  .replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + "$1" + breakToken)
                                  .replace(/<div\.*?>(.*?)<\/div>/gi, breakToken + "$1" + breakToken)
                                  .replace(/<li\.*?>(.*?)<\/li>/gi, breakToken + "$1" + breakToken);
        var ret = $("<div></div>").html(lineBreakedHtml).text().replace(/\n/g, "").replace(new RegExp(breakToken, "g"), "\n");
        while (ret.indexOf("\n\n") > -1) {
            ret = ret.replace("\n\n", "\n");
        }
        return ret;
    };

    ////////////////////////////////////////////////////////////////
    // escapeHtmlWithLineBreaks
    GG.escapeHtmlWithLineBreaks = function (html) {
        return html.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/\n/g, "<br />");
    };

    ////////////////////////////////////////////////////////////////
    // toUrlFriendly
    GG.toUrlFriendly = function (source) {
        source = GG.toAscii(source).trim().toLowerCase();
        source = source.replace(/ /g, "-");
        source = source.replace(/&nbsp;/g, "-");
        source = source.replace(/[^0-9a-z-]/g, "");
        while (source.indexOf("--") > -1) {
            source = source.replace(/--/g, "-");
        }
        return source;
    };

    ////////////////////////////////////////////////////////////////
    // pasteHtmlAtCaret
    GG.pasteHtmlAtCaret = function (html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // non-standard and not supported in all browsers (IE9, for one)
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type !== "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    };

    ////////////////////////////////////////////////////////////////
    // tableToExcel
    GG.tableToExcel = function (table, name) {
        /// <signature>
        /// <param name='table' type='jQuery' />
        /// <param name='name' type='String' />
        /// <returns type='String'/>
        /// </signature>
        /*
         * Source :http://www.codeproject.com/Tips/755203/Export-HTML-table-to-Excel-With-CSS
         * by Er. Puneet Goel
         */

        var uri = "data:application/vnd.ms-excel;base64,",
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';

        var ctx = {
            worksheet: name || "Worksheet",
            table: table.html()
        };
        return uri + base64(format(template, ctx));

        function base64(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        }

        function format(s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            });
        }
    };

    ////////////////////////////////////////////////////////////////
    // getJSON
    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    GG.getJSON = function (url, options) {
        options = $.extend({
            data: {},
            onSuccess: function (/*data, textStatus, jqXHR*/) { },
            onUnsuccess: function (/*data, textStatus, jqXHR*/) { },
            onError: function (/*jqXHR, textStatus, errorThrown*/) { },
            onComplete: function (/*jqXHR, textStatus*/) { },
            onUnauthenticated: function (/*jqXHR, textStatus*/) {
                window.location = window.location;
            }
        }, options);

        return $.getJSON(url, options.data)
            .success(function (data, textStatus, jqXHR) {
                if (data.success === true) {
                    options.onSuccess(data, textStatus, jqXHR);
                } else {
                    if (data.unauthenticated === true) {
                        options.onUnauthenticated(jqXHR, textStatus);
                    } else {
                        options.onUnsuccess(data, textStatus, jqXHR);
                    }
                }
            })
            .error(function (jqXHR, textStatus, errorThrown) {
                if (options.onError(jqXHR, textStatus, errorThrown) !== false) {
                    GG.showErrorMessages([errorThrown, jqXHR.responseText]);
                }
            })
            .complete(function (jqXHR, textStatus) {
                options.onComplete(jqXHR, textStatus);
            })
        ;
    };

    ////////////////////////////////////////////////////////////////
    // postJSON
    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    GG.postJSON = function (url, options) {
        options = $.extend({
            data: {},
            onSuccess: function (/*data, textStatus, jqXHR*/) { },
            onUnsuccess: function (/*data, textStatus, jqXHR*/) { },
            onError: function (/*jqXHR, textStatus, errorThrown*/) { },
            onComplete: function (/*jqXHR, textStatus*/) { },
            onUnauthenticated: function (/*jqXHR, textStatus*/) {
                window.location = window.location;
            }
        }, options);
        return $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(options.data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data, textStatus, jqXHR) {
                // TODO:: Migrate to new format
                if (data.success === true || data.Succeeded === true) {
                    options.onSuccess(data, textStatus, jqXHR);
                } else if (data.unauthenticated === true || data.Unauthenticated === true) {
                    options.onUnauthenticated(jqXHR, textStatus);
                } else {
                    options.onUnsuccess(data, textStatus, jqXHR);
                }
                options.onComplete(jqXHR, textStatus);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseText === "") {
                    options.onUnauthenticated(jqXHR, textStatus);
                } else if (options.onError(jqXHR, textStatus, errorThrown) !== false) {
                    GG.showErrorMessages([errorThrown, jqXHR.responseText]);
                }
                options.onComplete(jqXHR, textStatus);
            }
        });
    };

    ////////////////////////////////////////////////////////////////
    // initDatepickers
    GG.initDatepickers = function (elements, options) {
        if (Modernizr.inputtypes.date) {
            if (!Modernizr.touch) {
                elements.attr('type', 'text');
                _initDatepickers(elements, options);
            }
        }
        else {
            _initDatepickers(elements, options);
        }

        function _initDatepickers(datepickers, options) {
            $.each(datepickers, function (index, value) {
                if (!options.yearRange) {
                    var yearRange = $(value).attr('data-gg-datepicker-year-range');
                    options.yearRange = yearRange ? yearRange : 'c-10:c+10';
                }
                $(value).datepicker(options);
            });
        }
    };

})(jQuery, window, document);

$(function () {
    $('[data-gg-focus]').focus();

    GG.initDatepickers($('[data-gg-datepicker]'),
        {
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true
        });
});

/*!
 * Remote Folder
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - Phantom Net Namespace and Inheritance
 */

(function () {

    "use strict";

    GG.namespace("GG.Components");

    var DEFAULT_EVENT_DOMAIN = ".remote-folder",

        FLOAT_LEFT_CSS_CLASS = "pull-left",
        FLOAT_RIGHT_CSS_CLASS = "pull-right",
        STRIPED_PROGRESS_CSS_CLASS = "progress-striped",
        ACTIVE_PROGRESS_CSS_CLASS = "active",
        UNSTYLED_LIST_CSS_CLASS = "list-unstyled",

        PANEL_CSS_CLASS = "panel",
        PANEL_HEADING_CSS_CLASS = "panel-heading",
        PANEL_TITLE_CSS_CLASS = "panel-title clearfix",
        PANEL_BODY_CSS_CLASS = "panel-body",
        NORMAL_PANEL_CSS_CLASS = "panel-info",
        SUCCESS_PANEL_CSS_CLASS = "panel-success",
        ERROR_PANEL_CSS_CLASS = "panel-danger",
        DISABLED_PANEL_CSS_CLASS = "panel-warning",

        IMAGE_CSS_CLASS = "img-responsive img-rounded",

        PROGRESS_CSS_CLASS = "progress",
        PROGRESS_BAR_CSS_CLASS = "progress-bar",
        NORMAL_PROGRESS_BAR_CSS_CLASS = "progress-bar-info",
        SUCCESS_PROGRESS_BAR_CSS_CLASS = "progress-bar-success",
        ERROR_PROGRESS_BAR_CSS_CLASS = "progress-bar-danger",
        DISABLED_PROGRESS_BAR_CSS_CLASS = "progress-bar-warning",

        COMPONENT_CSS_CLASS = "remote-folder",
        ITEM_CSS_CLASS = "item",
        FILE_NAME_CSS_CLASS = "file-name",
        FILE_SIZE_CSS_CLASS = "file-size",
        UPLOAD_BUTTON_CSS_CLASS = "btn btn-link btn-lg",
        UPLOAD_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-paperclip",
        UPLOAD_QUEUE_ITEM_BUTTON_CSS_CLASS = "btn btn-link btn-xs pull-right",
        RETRY_BUTTON_CSS_CLASS = "retry " + UPLOAD_QUEUE_ITEM_BUTTON_CSS_CLASS,
        RETRY_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-refresh",
        CANCEL_BUTTON_CSS_CLASS = "cancel " + UPLOAD_QUEUE_ITEM_BUTTON_CSS_CLASS,
        CANCEL_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-remove",
        EDIT_BUTTON_CSS_CLASS = "edit " + CANCEL_BUTTON_CSS_CLASS,
        EDIT_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-pencil",
        DELETE_BUTTON_CSS_CLASS = "delete " + CANCEL_BUTTON_CSS_CLASS,
        DELETE_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-trash",

        MULTIPLE_ATTRIBUTE = "multiple",
        CONTENTEDITABLE_ATTRIBUTE = "contenteditable";

    // CLASSES

    var UploadHandlerBase = GG.Class.extend({
        options: {
            onAdd: function (item) { },
            onUpload: function (item) { },
            onProgress: function (item, loaded, total) { },
            onComplete: function (item) { },
            onCancel: function (item) { },
            onSuccess: function (item) { },
            onError: function (item) { }
        },

        init: function (options) {
            this.options = $.extend({}, this.options, options);
        },

        add: function (input, createItem) {
            if (input.is("input")) {
                input.after(input.clone(true));
                input.remove();
            }
        },

        upload: function (item, url) {
            this.options.onUpload(item);
        },

        cancel: function (item) { },

        _handleResponse: function (item, response) {
            item.removeData("uploader");
            this.options.onComplete(item);
            if (response.success === true) {
                this.options.onSuccess(item);
            } else {
                this.options.onError(item);
            }
        }
    });

    var FormUploadHandler = UploadHandlerBase.extend({
        add: function (input, createItem) {
            var fileName = input.val(),
                item = createItem();
            item.data("file", input)
                .data("fileName", fileName)
                .data("fileSize", NaN);
            this.options.onAdd(item);
            this._super(input, createItem);
            return [item];
        },

        upload: function (item, url) {
            var that = this,
                id = new Date().valueOf(),
                iframe = this._createIframe(id, item),
                form = this._createForm(id, item.data("file"), url);

            item.data("uploader", iframe);

            iframe.load(function (e) {
                that._handleIframeLoad(e);
            });
            form.submit();
            form.remove();
            this._super(item);
        },

        cancel: function (item) {
            var uploader = item.data("uploader");
            if (uploader) {
                // To cancel request set src to something else
                // We use src="javascript:false;" because it doesn't trigger ie6 prompt on https
                uploader.attr("src", "javascript:false;");
                uploader.remove();
                item.removeData("uploader");
            }
            this.options.onComplete(item);
            this.options.onCancel(item);
        },

        _createIframe: function (id, item) {
            var ret = $("<iframe></iframe>").attr("src", "javascript:false;")
                                            .attr("id", id)
                                            .attr("name", id)
                                            .data("item", item)
                                            .hide();
            $(document.documentElement).append(ret);
            return ret;
        },

        _createForm: function (id, input, url) {
            var ret = $("<form></form>").attr("method", "post")
                                        .attr("enctype", "multipart/form-data")
                                        .attr("action", url)
                                        .attr("target", id)
                                        .append(input)
                                        .hide();
            input.attr("name", "file"); // !Important input must have a name for the file to be sent
            $(document.documentElement).append(ret);
            return ret;
        },

        _handleIframeLoad: function (e) {
            var iframe = e.target,
                $iframe = $(iframe),
                item = $iframe.data("item"),
                doc, response;

            // when we remove iframe from dom the request stops, but in IE load event fires
            if (!iframe.parentNode) {
                return;
            }

            try {
                // fixing Opera 10.53
                if (iframe.contentDocument &&
                    iframe.contentDocument.body &&
                    iframe.contentDocument.body.innerHTML === "false") {
                    // In Opera event is fired second time when body.innerHTML changed from false
                    // to server response approx. after 1 sec when we upload file with iframe
                    return;
                }
            } catch (e) { // Server error
                response = {};
            }

            if (!response) {
                // iframe.contentWindow.document - for IE<7
                doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
                try {
                    response = $.parseJSON(doc.body.innerHTML);
                } catch (e) {
                    response = {};
                }
            }

            $iframe.remove();

            this._handleResponse(item, response);
        }
    });

    var XhrUploadHandler = UploadHandlerBase.extend({
        add: function (input, createItem) {
            var that = this,
                ret = [];
            $.each(input[0].files, function (index, value) {
                var fileName = value.name || value.fileName,
                    fileSize = value.size || value.fileSize,
                    item = createItem();
                item.data("file", value)
                    .data("fileName", fileName)
                    .data("fileSize", fileSize);
                ret[index] = item;
                that.options.onAdd(item);
            });
            this._super(input, createItem);
            return ret;
        },

        upload: function (item, url, disableMultipart) {
            var that = this,
                file = item.data("file"),
                fileName = file.name || file.fileName;
            if (isMultiPartSupport() && !disableMultipart) {
                var fileId = item.data("fileId") || Date.now().valueOf() + "-" + fileName,
                    nextPartIndex = item.data("nextPartIndex") || 0;
                item.data("fileId", fileId)
                sendPart(fileId, nextPartIndex);
            } else {
                var xhr = new XMLHttpRequest(),
                    formData = new FormData();

                item.data("uploader", xhr);

                formData.append("file", file);

                xhr.upload.addEventListener("progress", function (e) {
                    var loaded = e.lengthComputable ? e.loaded : NaN,
                        total = e.lengthComputable ? e.total : NaN;
                    that.options.onProgress(item, loaded, total);
                }, false);

                xhr.addEventListener("load", function (e) {
                    var response;
                    try {
                        response = $.parseJSON(e.target.responseText);
                    } catch (e) {
                        response = {};
                    }
                    that._handleResponse(item, response);
                }, false);

                xhr.addEventListener("abort", function (e) {
                    item.removeData("uploader");
                    that.options.onComplete(item);
                    that.options.onCancel(item);
                }, false);

                xhr.addEventListener("error", function (e) {
                    item.removeData("uploader");
                    that.options.onComplete(item);
                    that.options.onError(item);
                }, false);

                xhr.open("POST", url, true);
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("X-File-Name", encodeURIComponent(fileName));
                xhr.send(formData);
            }
            this._super(item);

            function isMultiPartSupport() {
                return (
                       (typeof (File) !== "undefined")
                       &&
                       (typeof (Blob) !== "undefined")
                       &&
                       (typeof (FileList) !== "undefined")
                       &&
                       (!!Blob.prototype.webkitSlice || !!Blob.prototype.mozSlice || !!Blob.prototype.slice || false)
                       );
            }

            function sendPart(fileId, index) {
                var partSize = 1048576, // 1 MB
                    xhr = new XMLHttpRequest(),
                    sliceFunc = (file.slice ? "slice" : (file.mozSlice ? "mozSlice" : (file.webkitSlice ? "webkitSlice" : "slice"))),
                    part = file[sliceFunc](index * partSize, (index + 1) * partSize);

                item.data("uploader", xhr);

                xhr.upload.addEventListener("progress", function (e) {
                    var loaded = e.lengthComputable ? e.loaded : NaN,
                        total = e.lengthComputable ? file.size : NaN;
                    loaded += index * partSize;
                    that.options.onProgress(item, loaded, total);
                }, false);

                xhr.addEventListener("load", function (e) {
                    var response;
                    try {
                        response = $.parseJSON(e.target.responseText);
                    } catch (e) {
                        response = {};
                    }

                    index++;
                    if (partSize * index < file.size) {
                        if (response.success === true) {
                            item.data("nextPartIndex", index);
                            sendPart(fileId, index);
                        } else {
                            that._handleResponse(item, response);
                        }
                    } else {
                        that._handleResponse(item, response);
                    }
                }, false);

                xhr.addEventListener("abort", function (e) {
                    item.removeData("uploader");
                    that.options.onComplete(item);
                    that.options.onCancel(item);
                }, false);

                xhr.addEventListener("error", function (e) {
                    item.removeData("uploader");
                    that.options.onComplete(item);
                    that.options.onError(item);
                }, false);

                xhr.open("POST", url, true);
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("X-File-ID", encodeURIComponent(fileId));
                xhr.setRequestHeader("X-File-Name", encodeURIComponent(fileName));
                xhr.setRequestHeader("X-Part-Index", encodeURIComponent(index));
                xhr.setRequestHeader("X-Part-Count", encodeURIComponent(Math.ceil(file.size / partSize)));
                xhr.setRequestHeader("X-Part-Size", encodeURIComponent(part.size));
                xhr.send(part);
            }
        },

        cancel: function (item) {
            var uploader = item.data("uploader");
            if (uploader) {
                uploader.abort();
            } else {
                this.options.onComplete(item);
                this.options.onCancel(item);
            }
        }
    });

    GG.Components.RemoteFolder = GG.Class.extend({
        container: $(),
        options: {
            listUrl: null,
            uploadUrl: null,
            renameUrl: null,
            deleteUrl: null,

            animationDuration: "fast",

            multiple: true,
            resume: false,

            dragAndDrop: true,
            dragAndDropTarget: window,

            autoRetryUpload: true,
            autoRetryUploadTimeout: 60000,
            autoClearUpload: true,
            autoClearUploadTimeout: 3000,
            autoClearFileListTimeout: 500,

            showSpeed: false,
            newToTop: true,

            urlFriendlyFileName: true,
            predefinedFileNames: [],

            uploadQueue: null,
            fileList: null,

            formatUploadButton: formatUploadButton,
            formatUploadQueueItem: formatUploadQueueItem,
            formatFileListItem: formatFileListItem,

            populateFileList: populateFileList,

            switchItemState: switchItemState,
            getItemState: getItemState
        },

        original: null,
        uploadQueue: $(),
        uploadHandler: new UploadHandlerBase(),
        fileList: $(),
        updateFileListJqXHR: null,

        init: function (container, options) {
            this.options = $.extend({}, this.options, options);
            this.container = $(container).addClass(COMPONENT_CSS_CLASS);
            this.original = this.container.html();

            var that = this;
            createUploadSection();
            if (this.options.fileList === null) {
                this.container.append(this.fileList = $("<ul></ul>").addClass(UNSTYLED_LIST_CSS_CLASS));
            } else {
                this.fileList = this.options.fileList;
            }
            updateFileList();

            function createUploadSection() {
                if (that.options.uploadQueue === null) {
                    that.container.append(that.uploadQueue = $("<ul></ul>").addClass(UNSTYLED_LIST_CSS_CLASS));
                } else {
                    that.uploadQueue = that.options.uploadQueue;
                }

                var options = {
                    onAdd: function (item) { onHandlerAdd(item); },
                    onUpload: function (item) { onHandlerUpload(item); },
                    onProgress: function (item, loaded, total) { onHandlerProgress(item, loaded, total); },
                    onComplete: function (item) { onHandlerComplete(item); },
                    onCancel: function (item) { onHandlerCancel(item); },
                    onSuccess: function (item) { onHandlerSuccess(item); },
                    onError: function (item) { onHandlerError(item); }
                };
                that.uploadHandler = isXhrSupported() ? new XhrUploadHandler(options) : new FormUploadHandler(options);

                createUploadButton().on("change" + DEFAULT_EVENT_DOMAIN, function () {
                    that.uploadHandler.add($(this), function () {
                        return that.options.formatUploadQueueItem();
                    });
                    processUploadQueue();
                });

                if (that.options.dragAndDrop === true) {
                    enableDragAndDrop();
                }

                function isXhrSupported() {
                    return isFileApiSupported() && isXhrProgressSupported();

                    function isFileApiSupported() {
                        var fi = document.createElement("input");
                        fi.type = "file";
                        return "files" in fi;
                    }

                    function isXhrProgressSupported() {
                        var xhr = new XMLHttpRequest();
                        return !!(xhr && ("upload" in xhr) && ("onprogress" in xhr.upload));
                    }
                }

                function createUploadButton() {
                    var input = $("<input type=\"file\" />"),
                        button = that.options.formatUploadButton();
                    that.container.prepend(button.append(input));

                    if (that.options.multiple) {
                        input.attr(MULTIPLE_ATTRIBUTE, MULTIPLE_ATTRIBUTE);
                    }

                    // Make button suitable container for input
                    button.css({
                        position: "relative",
                        overflow: "hidden",
                        direction: "ltr" // Make sure browse button is in the right side in Internet Explorer
                    });

                    input.css({
                        position: "absolute",
                        right: "0", // In Opera only "Browse" button is clickable and it is located at the right side of the input
                        bottom: "0",
                        fontSize: "118px", // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
                        margin: "0",
                        padding: "0",
                        cursor: "pointer",
                        opacity: "0",
                        filter: "alpha(opacity=0)"
                    });
                    // IE and Opera, unfortunately have 2 tab stops on file input
                    // which is unacceptable in our case, disable keyboard access
                    if (window.attachEvent) {
                        // It is IE or Opera
                        input.attr("tabIndex", "-1");
                    }

                    return input;
                }

                function onHandlerAdd(item) {
                    var name = GG.Components.RemoteFolder.formatFileName(item.data("fileName"), true),
                        size = GG.Components.RemoteFolder.formatFileSize(item.data("fileSize")),
                        nameLabel = $("." + FILE_NAME_CSS_CLASS, item).html(name),
                        sizeLabel = $("." + FILE_SIZE_CSS_CLASS, item).html(size === "" ? "" : "0 KB / " + size),
                        retryButton = $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item),
                        cancelButton = $("button." + CANCEL_BUTTON_CSS_CLASS.split(" ")[0], item),
                        deleteButton = $("button." + DELETE_BUTTON_CSS_CLASS.split(" ")[0], item),
                        progress = $("." + PROGRESS_CSS_CLASS, item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item);

                    item.data("status", "added");

                    retryButton.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                        switch (item.data("status")) {
                            case "added":
                                return;
                            case "uploading":
                                item.data("status", "retrying");
                                that.uploadHandler.cancel(item);
                                break;
                            case "retrying":
                                return;
                            case "completed":
                                item.data("status", "retrying");
                                cancelButton.show();
                                deleteButton.hide();
                                that.options.switchItemState(item, "Normal");
                                progressBar.removeClass(ERROR_PROGRESS_BAR_CSS_CLASS)
                                           .addClass(NORMAL_PROGRESS_BAR_CSS_CLASS);
                                break;
                            default:
                                return;
                        }
                        sizeLabel.html(size === "" ? "" : "0 KB / " + size);
                        retryButton.css("visibility", "hidden");
                        progressBar.width("0%");
                        progress.addClass(STRIPED_PROGRESS_CSS_CLASS).addClass(ACTIVE_PROGRESS_CSS_CLASS);
                        processUploadQueue();
                    });

                    cancelButton.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                        that.uploadHandler.cancel(item);
                    });

                    deleteButton.one("click" + DEFAULT_EVENT_DOMAIN, function () {
                        $("button:visible", item).css("visibility", "hidden");
                        item.fadeOut(that.options.animationDuration, function () {
                            item.remove();
                            $(that).triggerHandler("queueitemremove", item);
                        });
                    });

                    if (isNaN(item.data("fileSize"))) {
                        progressBar.width("100%");
                    }

                    that.uploadQueue.append(item);
                    $(that).triggerHandler("queueitemadd", item);
                }

                function onHandlerUpload(item) {
                    item.data("status", "uploading");
                    if (that.options.autoRetryUpload) {
                        item.data("progressTimeout", window.setTimeout(function () {
                            $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item).click();
                        }, that.options.autoRetryUploadTimeout));
                    }
                    if (that.options.showSpeed) {
                        item.data("speedInterval", window.setInterval(function () {
                            var previousLoaded = item.data("previousLoaded") || 0,
                                lastLoaded = item.data("lastLoaded") || 0;
                            item.data("speed", GG.Components.RemoteFolder.formatFileSize((lastLoaded - previousLoaded) / 2) + "/s | ");
                            item.data("previousLoaded", lastLoaded);
                        }, 2000));
                    }
                }

                function onHandlerProgress(item, loaded, total) {
                    if (that.options.autoRetryUpload) {
                        window.clearTimeout(item.data("progressTimeout"));
                    }

                    var speed = item.data("speed") || "",
                        size = speed + ((isNaN(loaded) || isNaN(total)) ? "" : GG.Components.RemoteFolder.formatFileSize(loaded) + " / " + GG.Components.RemoteFolder.formatFileSize(total)),
                        sizeLabel = $("." + FILE_SIZE_CSS_CLASS, item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item);

                    item.data("lastLoaded", loaded);
                    sizeLabel.html(size);
                    if (!isNaN(loaded) && !isNaN(total)) {
                        progressBar.width(loaded * 100 / total + "%");
                    }
                    if (that.options.autoRetryUpload) {
                        item.data("progressTimeout", window.setTimeout(function () {
                            $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item).click();
                        }, that.options.autoRetryUploadTimeout));
                    }
                }

                function onHandlerComplete(item) {
                    if (that.options.autoRetryUpload) {
                        window.clearTimeout(item.data("progressTimeout"));
                    }
                    if (that.options.showSpeed) {
                        window.clearInterval(item.data("speedInterval"));
                    }
                    if (item.data("status") === "retrying") {
                        return;
                    }

                    var size = GG.Components.RemoteFolder.formatFileSize(item.data("fileSize")),
                        progress = $("." + PROGRESS_CSS_CLASS, item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item),
                        sizeLabel = $("." + FILE_SIZE_CSS_CLASS, item);

                    item.data("status", "completed");
                    processUploadQueue();
                    progress.removeClass(STRIPED_PROGRESS_CSS_CLASS).removeClass(ACTIVE_PROGRESS_CSS_CLASS);
                    progressBar.width("100%");
                    sizeLabel.html(size);
                }

                function onHandlerCancel(item) {
                    if (item.data("status") !== "completed") {
                        return;
                    }

                    var retryButton = $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item),
                        cancelButton = $("button." + CANCEL_BUTTON_CSS_CLASS.split(" ")[0], item),
                        deleteButton = $("button." + DELETE_BUTTON_CSS_CLASS.split(" ")[0], item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item);

                    retryButton.css("visibility", "hidden");
                    autoRemoveUpload(item);
                    that.options.switchItemState(item, "Disabled");
                    cancelButton.hide();
                    deleteButton.show();
                    progressBar.removeClass(NORMAL_PROGRESS_BAR_CSS_CLASS).addClass(DISABLED_PROGRESS_BAR_CSS_CLASS);
                }

                function onHandlerSuccess(item) {
                    var retryButton = $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item),
                        cancelButton = $("button." + CANCEL_BUTTON_CSS_CLASS.split(" ")[0], item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item);

                    autoRemoveUpload(item);
                    that.options.switchItemState(item, "Success");
                    retryButton.css("visibility", "hidden");
                    cancelButton.css("visibility", "hidden");
                    progressBar.removeClass(NORMAL_PROGRESS_BAR_CSS_CLASS).addClass(SUCCESS_PROGRESS_BAR_CSS_CLASS);
                    updateFileList();
                }

                function onHandlerError(item) {
                    var cancelButton = $("button." + CANCEL_BUTTON_CSS_CLASS.split(" ")[0], item),
                        deleteButton = $("button." + DELETE_BUTTON_CSS_CLASS.split(" ")[0], item),
                        progressBar = $("." + PROGRESS_BAR_CSS_CLASS, item);

                    that.options.switchItemState(item, "Error");
                    cancelButton.hide();
                    deleteButton.show();
                    progressBar.removeClass(NORMAL_PROGRESS_BAR_CSS_CLASS).addClass(ERROR_PROGRESS_BAR_CSS_CLASS);
                }

                function processUploadQueue() {
                    var maxUploadCount = 5,
                        count = maxUploadCount,
                        items = that.uploadQueue.children("." + ITEM_CSS_CLASS),
                        itemsToUpload = [],
                        uploadingCount = 0;

                    $.each(items, function (index, value) {
                        var item = $(value);
                        switch (item.data("status")) {
                            case "added":
                                if (count > 0) {
                                    itemsToUpload.push(item);
                                    count--;
                                }
                                break;
                            case "uploading":
                                uploadingCount++;
                                break;
                            case "retrying":
                                if (count > 0) {
                                    itemsToUpload.push(item);
                                    count--;
                                }
                                break;
                            case "completed":
                                break;
                            default:
                                break;
                        }
                    });
                    for (var i = 0; i < Math.min(itemsToUpload.length, maxUploadCount - uploadingCount) ; i++) {
                        var item = itemsToUpload[i];
                        that.uploadHandler.upload(item, that.options.uploadUrl, !that.options.resume);
                        $("button." + RETRY_BUTTON_CSS_CLASS.split(" ")[0], item).css("visibility", "");
                    }
                }

                function autoRemoveUpload(item) {
                    if (that.options.autoClearUpload) {
                        window.setTimeout(function () {
                            item.fadeOut(that.options.animationDuration, function () {
                                item.remove();
                                $(that).triggerHandler("queueitemremove", item);
                            });
                        }, that.options.autoClearUploadTimeout);
                    }
                }

                function enableDragAndDrop() {
                    if (!isXhrSupported()) {
                        return;
                    }

                    $(that.options.dragAndDropTarget)
                        .on("dragover dragenter", function (e) {
                            e.preventDefault();
                        })
                        .on("dragleave", function (e) {
                            e.preventDefault();
                        })
                        .on("drop", function (e) {
                            e.preventDefault();

                            if (e.originalEvent.dataTransfer === null) {
                                // Unsupported
                                return;
                            }

                            var files = e.originalEvent.dataTransfer.files,
                                input = $({ files: files });
                            that.uploadHandler.add(input, function () {
                                return that.options.formatUploadQueueItem();
                            });
                            processUploadQueue();
                        });
                }
            }

            function updateFileList() {
                that.updateFileListJqXHR = $.getJSON(that.options.listUrl, function (data, textStatus, jqXHR) {
                    if (jqXHR !== that.updateFileListJqXHR) {
                        return;
                    }
                    that.updateFileListJqXHR = null;

                    if (data.success) {
                        that.options.populateFileList(that, data.items);
                    } else {
                        onGetError();
                    }
                })
                .error(function () { onGetError(); });

                function onGetError() {
                }
            }
        },

        destroy: function () {
            var that = this,
                uploadItemList = this.uploadQueue.children("." + ITEM_CSS_CLASS),
                fileItemList = this.fileList.children("." + ITEM_CSS_CLASS);

            $.each(uploadItemList, function (index, value) {
                that.uploadHandler.cancel($(value));
            });

            this.updateFileListJqXHR = null;

            $.each(fileItemList, function (index, value) {
                $(value).removeData("deleteJqXHR");
            });

            this.container.html(this.original);
            this.original = null;
        },

        items: function () {
            return this.fileList.children("." + ITEM_CSS_CLASS);
        }
    });

    $.extend(GG.Components.RemoteFolder, {
        formatFileName: function (path, truncate) {
            var ret = GG.Components.RemoteFolder.getFilename(path);
            if (truncate) {
                ret = GG.Components.RemoteFolder.truncateString(ret, 50, 15);
            }
            return ret;
        },

        getFilename: function (path) {
            return path.replace(/.*(\/|\\)/, '');
        },

        truncateString: function (str, maxSize, taleSize) {
            if (str.length > maxSize) {
                str = str.slice(0, maxSize - taleSize - 1) + "..." + str.slice(0 - taleSize);
            }
            return str;
        },

        formatFileSize: function (fileSize) {
            if (isNaN(fileSize)) { return ""; }

            var i = -1;
            do {
                fileSize = fileSize / 1024;
                i++;
            } while (fileSize > 999);

            return Math.max(fileSize, 0.1).toFixed(0) + " " + ["KB", "MB", "GB", "TB", "PB", "EB"][i];
        }
    });

    function formatUploadButton() {
        return $("<div></div>").addClass(UPLOAD_BUTTON_CSS_CLASS)
                               .append("<span class=\"" + UPLOAD_BUTTON_ICON_CSS_CLASS + "\"></span>");
    }

    function formatUploadQueueItem() {
        var ret, retryButton, cancelButton, deleteButton, progress,
            panelHeading = $("<div></div>").addClass(PANEL_HEADING_CSS_CLASS),
            panelTitle = $("<div></div>").addClass(PANEL_TITLE_CSS_CLASS),
            panelBody = $("<div></div>").addClass(PANEL_BODY_CSS_CLASS),
            panel = $("<div></div>").addClass(PANEL_CSS_CLASS).addClass(NORMAL_PANEL_CSS_CLASS),
            nameLabel = $("<span></span>").addClass(FILE_NAME_CSS_CLASS).addClass(FLOAT_LEFT_CSS_CLASS),
            sizeLabel = $("<span></span>").addClass(FILE_SIZE_CSS_CLASS).addClass(FLOAT_RIGHT_CSS_CLASS);

        retryButton = $("<button></button>").addClass(RETRY_BUTTON_CSS_CLASS)
                                             .append("<span class=\"" + RETRY_BUTTON_ICON_CSS_CLASS + "\"></span>");
        cancelButton = $("<button></button>").addClass(CANCEL_BUTTON_CSS_CLASS)
                                             .append("<span class=\"" + CANCEL_BUTTON_ICON_CSS_CLASS + "\"></span>");
        deleteButton = $("<button></button>").addClass(DELETE_BUTTON_CSS_CLASS)
                                             .append("<span class=\"" + DELETE_BUTTON_ICON_CSS_CLASS + "\"></span>");
        progress = $("<div></div>").addClass(PROGRESS_CSS_CLASS).addClass(STRIPED_PROGRESS_CSS_CLASS).addClass(ACTIVE_PROGRESS_CSS_CLASS)
                                   .append($("<div></div>").addClass(PROGRESS_BAR_CSS_CLASS).addClass(NORMAL_PROGRESS_BAR_CSS_CLASS));
        ret = $("<li></li>").addClass(ITEM_CSS_CLASS)
                            .append(panel.append(panelHeading.append(panelTitle.append(deleteButton.hide())
                                                                               .append(cancelButton)
                                                                               .append(retryButton)
                                                                               .append(sizeLabel)
                                                                               .append(nameLabel)))
                                         .append(panelBody.append(progress)));
        return ret;
    }

    function formatFileListItem(file) {
        var ret, editButton, deleteButton, progress,
            panelHeading = $("<div></div>").addClass(PANEL_HEADING_CSS_CLASS),
            panelTitle = $("<div></div>").addClass(PANEL_TITLE_CSS_CLASS),
            panelBody = $("<div></div>").addClass(PANEL_BODY_CSS_CLASS),
            panel = $("<div></div>").addClass(PANEL_CSS_CLASS).addClass(NORMAL_PANEL_CSS_CLASS),
            nameLabel = $("<span></span>").addClass(FILE_NAME_CSS_CLASS).addClass(FLOAT_LEFT_CSS_CLASS),
            sizeLabel = $("<span></span>").addClass(FILE_SIZE_CSS_CLASS).addClass(FLOAT_RIGHT_CSS_CLASS),
            image = $("<img />").addClass(IMAGE_CSS_CLASS)
                                .attr("src", file.url)
                                .css("display", file.url ? "" : "none");

        editButton = $("<button></button>").addClass(EDIT_BUTTON_CSS_CLASS)
                                           .append("<span class=\"" + EDIT_BUTTON_ICON_CSS_CLASS + "\"></span>");
        deleteButton = $("<button></button>").addClass(DELETE_BUTTON_CSS_CLASS)
                                             .append("<span class=\"" + DELETE_BUTTON_ICON_CSS_CLASS + "\"></span>");
        progress = $("<div></div>").hide()
                                   .addClass(PROGRESS_CSS_CLASS).addClass(STRIPED_PROGRESS_CSS_CLASS).addClass(ACTIVE_PROGRESS_CSS_CLASS).addClass(FLOAT_RIGHT_CSS_CLASS)
                                   .append($("<div></div>").addClass(PROGRESS_BAR_CSS_CLASS).addClass(ERROR_PROGRESS_BAR_CSS_CLASS)
                                                           .width("100%"));
        ret = $("<li></li>").addClass(ITEM_CSS_CLASS)
                            .append(panel.append(panelHeading.append(panelTitle.append(progress)
                                                                               .append(deleteButton)
                                                                               .append(editButton)
                                                                               .append(sizeLabel)
                                                                               .append(nameLabel)))
                                         .append(panelBody.append(image)));
        return ret;
    }

    function switchItemState(item, state) {
        var panel = $("." + PANEL_CSS_CLASS, item).removeClass(NORMAL_PANEL_CSS_CLASS)
                                                  .removeClass(SUCCESS_PANEL_CSS_CLASS)
                                                  .removeClass(ERROR_PANEL_CSS_CLASS)
                                                  .removeClass(DISABLED_PANEL_CSS_CLASS);
        switch (state) {
            case "Normal":
                panel.addClass(NORMAL_PANEL_CSS_CLASS);
                break;
            case "Success":
                panel.addClass(SUCCESS_PANEL_CSS_CLASS);
                break;
            case "Error":
                panel.addClass(ERROR_PANEL_CSS_CLASS);
                break;
            case "Disabled":
                panel.addClass(DISABLED_PANEL_CSS_CLASS);
                break;
            default:
                break;
        }
    }

    function getItemState(item) {
        var panel = $("." + PANEL_CSS_CLASS, item)
        return panel.hasClass(NORMAL_PANEL_CSS_CLASS) ? "Normal" :
            panel.hasClass(SUCCESS_PANEL_CSS_CLASS) ? "Success" :
            panel.hasClass(ERROR_PANEL_CSS_CLASS) ? "Error" :
            panel.hasClass(DISABLED_PANEL_CSS_CLASS) ? "Disabled" : null;

    }

    function populateFileList(target, items) {
        /// <signature>
        ///   <param name="target" type="GG.Components.RemoteFolder" />
        ///   <param name="items" type="Array" />
        /// </signature>

        var oldItems = target.fileList.children("." + ITEM_CSS_CLASS);

        $.each(oldItems, function (index, value) {
            var item = $(value),
                file = item.data("file"),
                onList = false;

            if (file && file.fileName) {
                $.each(items, function (index, value) {
                    if (value.fileName === file.fileName) {
                        item.data("file", value);
                        onList = true;
                        return false;
                    }
                });
            }

            if (!onList) {
                item.fadeOut(target.options.animationDuration, function () {
                    item.remove();
                    $(target).triggerHandler("filelistitemremove", item);
                });
            }
        });

        $.each(items, function (index, value) {
            var fileName = value.fileName,
                onList = false;

            $.each(oldItems, function (index, value) {
                var item = $(value),
                    file = item.data("file");

                if (file && file.fileName === fileName) {
                    onList = true;
                    return false;
                }
            });

            if (!onList) {
                addToFileList(value);
            }
        });

        $(target).triggerHandler("filelistupdate", [items]);

        function addToFileList(file) {
            var name = GG.Components.RemoteFolder.formatFileName(file.fileName, true),
                fullName = GG.Components.RemoteFolder.formatFileName(file.fileName, false),
                size = GG.Components.RemoteFolder.formatFileSize(file.fileSize),
                item = target.options.formatFileListItem(file).data("file", file).data("fullName", fullName),
                nameLabel = $("." + FILE_NAME_CSS_CLASS, item).html(name),
                sizeLabel = $("." + FILE_SIZE_CSS_CLASS, item).html(size),
                editButton = $("button." + EDIT_BUTTON_CSS_CLASS.split(" ")[0], item),
                deleteButton = $("button." + DELETE_BUTTON_CSS_CLASS.split(" ")[0], item),
                progress = $("." + PROGRESS_CSS_CLASS, item);

            if (target.options.predefinedFileNames.length > 0) {
                var content = $("<ul></ul>").addClass(UNSTYLED_LIST_CSS_CLASS);
                $.each(target.options.predefinedFileNames, function (index, value) {
                    content.append($("<li></li>").append($("<a></a>").html(value)
                                                                     .on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                                                                         if (e.which === 1) {
                                                                             e.preventDefault();
                                                                             var fullName = item.data("fullName"),
                                                                                 extension = fullName.substring(fullName.lastIndexOf("."));
                                                                             nameLabel.html($(e.target).html() + extension);
                                                                             postRename();
                                                                         }
                                                                     })));
                });
                editButton.popover({
                    html: true,
                    placement: "top",
                    container: target.container,
                    enabled: true,
                    content: content
                });
            }

            nameLabel.on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                if (!$("[" + CONTENTEDITABLE_ATTRIBUTE + "]", e.currentTarget).is("*")) {
                    e.preventDefault();
                    if (target.options.predefinedFileNames.length > 0) {
                        editButton.popover("show");
                    }
                    beginEdit();
                }
            });

            editButton.on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                e.preventDefault();
                beginEdit();
            });

            deleteButton.on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                e.preventDefault();
                deleteFile();
            });

            if (target.options.newToTop && oldItems.length > 0) {
                target.fileList.prepend(item);
            } else {
                target.fileList.append(item);
            }
            $(target).triggerHandler("filelistitemadd", item);

            function deleteFile() {
                target.options.switchItemState(item, "Normal");
                deleteButton.hide();
                progress.show();
                item.data("deleteJqXHR",
                    $.post(target.options.deleteUrl, { "fileName": file.fileName }, function (data, textStatus, jqXHR) {
                        if (jqXHR !== item.data("deleteJqXHR")) {
                            return;
                        }
                        item.removeData("deleteJqXHR");

                        if (data.success) {
                            onFileDeleteSuccess(jqXHR.item);
                        } else {
                            onFileDeleteError(jqXHR.item);
                        }
                    }, "json")
                    .error(function (jqXHR) { onFileDeleteError(jqXHR.item); })
                );
                item.data("deleteJqXHR").item = item;

                function onFileDeleteSuccess(item) {
                    target.options.switchItemState(item, "Disabled");
                    progress.css("visibility", "hidden");
                    window.setTimeout(function () {
                        item.fadeOut(target.options.animationDuration, function () {
                            item.remove();
                            $(target).triggerHandler("filelistitemremove", item);
                        });
                    }, target.options.autoClearFileListTimeout);
                }

                function onFileDeleteError(item) {
                    target.options.switchItemState(item, "Error");
                    deleteButton.show();
                    progress.hide();
                }
            }

            function beginEdit() {
                var fullName = item.data("fullName"),
                    fullNameWithoutExtension = fullName.substring(0, fullName.lastIndexOf(".")),
                    extension = fullName.substring(fullName.lastIndexOf(".")),
                    nameEditor = $("<div></div>");
                target.options.switchItemState(item, "Normal");
                nameEditor.html(fullNameWithoutExtension);
                nameLabel.html("")
                         .append(nameEditor.attr(CONTENTEDITABLE_ATTRIBUTE, true)
                                           .on("blur" + DEFAULT_EVENT_DOMAIN, function (e) {
                                               cancelEdit($(e.target));
                                           })
                                           .on("keydown" + DEFAULT_EVENT_DOMAIN, function (e) {
                                               switch (e.which) {
                                                   case 27:
                                                       e.preventDefault();
                                                       $(e.target).blur();
                                                       break;
                                                   case 13:
                                                       e.preventDefault();
                                                       comitEdit($(e.target));
                                                       break;

                                               }
                                           })
                                )
                         .after($("<span></span>").addClass(FLOAT_LEFT_CSS_CLASS).html(extension));
                if (target.options.urlFriendlyFileName) {
                    nameEditor.on("paste" + DEFAULT_EVENT_DOMAIN, function (e) {
                        window.setTimeout(function () {
                            nameEditor.html(GG.toUrlFriendly(nameEditor.html()));
                        }, 10);
                    });
                }
                nameEditor.focus();
                if (!Modernizr.touch && document.queryCommandEnabled("selectAll")) {
                    document.execCommand("selectAll", false, null);
                }
                $(target).triggerHandler("beginEdit", item);
            }

            function comitEdit(editor) {
                editor.off(DEFAULT_EVENT_DOMAIN)
                      .blur()
                      .removeAttr(CONTENTEDITABLE_ATTRIBUTE)
                      .html(target.options.urlFriendlyFileName ? GG.toUrlFriendly(editor.html()) : editor.html())
                      .parent().html(editor.text().trim() + editor.parent().next().html())
                               .next().remove();
                postRename();
                $(target).triggerHandler("comitEdit", item);
            }

            function cancelEdit(editor) {
                var name = GG.Components.RemoteFolder.formatFileName(file.fileName, true);
                editor.off(DEFAULT_EVENT_DOMAIN)
                      .blur()
                      .removeAttr(CONTENTEDITABLE_ATTRIBUTE)
                      .parent().html(name)
                               .next().remove();
                window.setTimeout(function () {
                    if (target.options.predefinedFileNames.length > 0 && !$(":focus").closest("span").is(nameLabel)) {
                        editButton.popover("hide");
                    }
                }, 100);
                $(target).triggerHandler("cancelEdit", item);
            }

            function postRename() {
                if (target.options.predefinedFileNames.length > 0) {
                    editButton.popover("hide");
                }
                target.options.switchItemState(item, "Disabled");
                item.data("renameJqXHR",
                    $.post(target.options.renameUrl, { "fileName": file.fileName, "newName": nameLabel.text().trim() }, function (data, textStatus, jqXHR) {
                        if (jqXHR !== item.data("renameJqXHR")) {
                            return;
                        }
                        item.removeData("renameJqXHR");

                        if (data.success) {
                            onFileRenameSuccess(jqXHR.item, data.newFileName);
                        } else {
                            onFileRenameError(jqXHR.item, data.fileNotFound);
                        }
                    }, "json")
                    .error(function (jqXHR) { onFileRenameError(jqXHR.item); })
                );
                item.data("renameJqXHR").item = item;

                function onFileRenameSuccess(item, newFileName) {
                    var name = GG.Components.RemoteFolder.formatFileName(newFileName, true),
                        fullName = GG.Components.RemoteFolder.formatFileName(newFileName, false);
                    target.options.switchItemState(item, "Normal");
                    file.fileName = newFileName;
                    item.data("fullName", fullName);
                    nameLabel.html(name);
                    $(target).triggerHandler("renamesuccess", item);
                }

                function onFileRenameError(item, fileNotFound) {
                    target.options.switchItemState(item, "Error");
                    if (fileNotFound === true) {
                        deleteButton.css("visibility", "hidden");
                        window.setTimeout(function () {
                            item.fadeOut(target.options.animationDuration, function () {
                                item.remove();
                                $(target).triggerHandler("filelistitemremove", item);
                            });
                        }, target.options.autoClearFileListTimeout);
                    } else {
                        var name = GG.Components.RemoteFolder.formatFileName(file.fileName, true);
                        nameLabel.html(name);
                    }
                }
            }
        }
    }

})();

/*!
 * Select2 Vietnamese translation
 * Original author: Green Grass (http://nguyenngocminh.info)
 */

(function ($) {
    "use strict";

    $.fn.select2.locales['vi'] = {
        formatNoMatches: function () { return "Không tìm thấy mục nào"; },
        formatInputTooShort: function (input, min) { var n = min - input.length; return "Vui lòng nhập thêm " + n + " ký tự"; },
        formatInputTooLong: function (input, max) { var n = input.length - max; return "Vui lòng xóa bớt " + n + " ký tự"; },
        formatSelectionTooBig: function (limit) { return "Chỉ có thể chọn được " + limit + " mục"; },
        formatLoadMore: function (pageNumber) { return "Đang tải thêm kết quả..."; },
        formatSearching: function () { return "Đang tìm..."; }
    };

    $.extend($.fn.select2.defaults, $.fn.select2.locales['vi']);
})(jQuery);

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

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr");

    GG.PageCompozr.Resources = GG.Class.extend({
        edit: null,
        backToPreview: null
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr");

    GG.PageCompozr = $.extend(GG.PageCompozr, {
        DEFAULT_EVENT_DOMAIN : ".page-compozr",
        PLACE_HOLDER_EVENT_DOMAIN: ".page-compozr-place-holder",
        EXTRA_INFO_CSS_CLASS: "page-compozr-extra-info",
        PLACE_HOLDER_CSS_CLASS: "place-holder",
        CLEARFIX_CSS_CLASS: "clearfix",
        ON_TWO_COLUMN_BREAK_CSS_CLASS: "clearfix visible-sm",
        ON_THREE_COLUMN_BREAK_CSS_CLASS: "clearfix visible-md visible-lg",
        COLUMN_CSS_CLASS: "col-sm-6 col-md-4",
        EXPANDED_COLUMN_CSS_CLASS: "col-sm-6 col-md-8",
        FULL_COLUMN_CSS_CLASS: "col-sm-12"
    });

    GG.PageCompozr.PageViewOptions = GG.Class.extend({
    });

    GG.PageCompozr.PageView = GG.Class.extend({
        container: $(),
        options: new GG.PageCompozr.PageViewOptions(),
        resources: new GG.PageCompozr.Resources(),

        page: $(),
        extraInfo: $(),

        hiddenOnEditMode: $(),

        assignElementsLock: 0,
        preparePageEditorLock: 0,
        cleanupPageEditorLock: 0,

        init: function (container, options, resources) {
            this.container = $(container);
            this.options = $.extend({}, this.options, options);
            this.resources = $.extend({}, this.resources, resources);
        },

        assignElements: function () {
            this.assignElementsLock++;

            var list;
            this.page.append(this.extraInfo = $("<div></div>").hide()
                                                              .addClass(GG.PageCompozr.EXTRA_INFO_CSS_CLASS)
                                                              .append(list = $("<ul></ul>").addClass(GG.PageCompozr.CLEARFIX_CSS_CLASS)));

            this.assignElementsLock--;
        },

        preparePageEditor: function (turnOffContentHtml) {
            this.preparePageEditorLock++;
            this.extraInfo.show();
            this.preparePageEditorLock--;
        },

        cleanupPageEditor: function (turnOnContentHtml) {
            this.cleanupPageEditorLock++;
            this.extraInfo.hide();
            this.cleanupPageEditorLock--;
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
                    field.css("min-height", field.css("line-height"));
                }

                field.on("focus" + GG.PageCompozr.PLACE_HOLDER_EVENT_DOMAIN, function () {
                    var $this = $(this);
                    if ($this.hasClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS)) {
                        $this.removeClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS).html("");
                        if (addLabel) {
                            field.prev().show();
                        }
                    }
                }).on("blur" + GG.PageCompozr.PLACE_HOLDER_EVENT_DOMAIN, function () {
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
                    field.addClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS + (required ? " required" : "")).html(placeHolderText);
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
                field.off(GG.PageCompozr.PLACE_HOLDER_EVENT_DOMAIN);
                field.css("min-height", "");
                // Nullable fields need this processing
                if (field.hasClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS)) {
                    field.html("").removeClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS);
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

        loadPageModel: function () {
            return {};
        },

        loadField: function (field, allowHtml) {
            return field.hasClass(GG.PageCompozr.PLACE_HOLDER_CSS_CLASS) ? "" : $.trim(allowHtml === true ? field.html() : field.text());
        }
    });

})();

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

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.PageImages");

    GG.PageCompozr.PageImages.Resources = {
        pageImages: null
    };

})();

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

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.PageImages");

    GG.PageCompozr.PageImages.PageController = {
        view: GG.PageCompozr.PageImages.PageView, // must be overriden
        resources: GG.PageCompozr.PageImages.Resources, // must be overriden

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            if (this.model.Id !== undefined && this.model.Id !== null) {
                this.view.options.imageListUrl += "/" + this.model.Id;
                this.view.options.uploadImageUrl += "/" + this.model.Id;
                this.view.options.renameImageUrl += "/" + this.model.Id;
                this.view.options.deleteImageUrl += "/" + this.model.Id;
            }
        }
    };

})();

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.MultiPage");

    GG.PageCompozr.MultiPage.Resources = {
        show: null,
        hide: null,
        enablePageMessage: null
    };

})();

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.MultiPage");

    GG.PageCompozr.MultiPage = $.extend(GG.PageCompozr.MultiPage, {
        DEFAULT_EVENT_DOMAIN: ".page-compozr-multi-page"
    });

    GG.PageCompozr.MultiPage.PageView = {
        resources: GG.PageCompozr.MultiPage.Resources, // must be overriden
    };

})();

(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.MultiPage");

    GG.PageCompozr.MultiPage = $.extend(GG.PageCompozr.MultiPage, {
        ENABLED_CSS_CLASS: "glyphicon-star",
        DISABLED_CSS_CLASS: "glyphicon-star-empty"
    });

    GG.PageCompozr.MultiPage.PageModel = {
        Id: null,
        Enabled: null
    };

    GG.PageCompozr.MultiPage.PageControllerOptions = {
        newPageUrl: null,
        savePageUrl: null,
        togglePageUrl: null,
        deletePageUrl: null,
        pageUrl: null,

        previewAfterSave: true
    };

    GG.PageCompozr.MultiPage.PageController = {
        view: GG.PageCompozr.MultiPage.PageView, // must be overriden
        options: GG.PageCompozr.MultiPage.PageControllerOptions, // must be overriden
        model: GG.PageCompozr.MultiPage.PageModel, // must be overriden
        resources: GG.PageCompozr.MultiPage.Resources, // must be overriden

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            this.options.savePageUrl += "/" + this.model.Id;
            this.options.togglePageUrl += "/" + this.model.Id;
            this.options.deletePageUrl += "/" + this.model.Id;

            var that = this;

            initGlobalEvents();

            $Compozr.on("newDoc" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                that.onNewPage();
            });
            $Compozr.on("saveDoc" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                that.onSavePage();
            });
            $Compozr.on("revertDoc" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                that.onRevertPage();
            });
            $Compozr.on("deleteDoc" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                that.onDeletePage();
            });

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.shortcutLock) { return; }
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 78:
                            case 110:
                                // Ctrl + N
                                if (!that.isEditMode()) {
                                    e.preventDefault();
                                    $(":focus").blur();
                                    Compozr.menu.NewPage.click();
                                }
                                break;
                        }
                    }
                });
            }
        },

        onNewPage: function () {
            Compozr.postNew(this.options.newPageUrl, Compozr.menu.NewPage);
        },

        onBeforeSavePage: function (model) {
        },

        onSavePage: function () {
            var model = this.view.loadPageModel();
            model = $.extend(model,
            {
                Id: this.model.Id,
                Enabled: this.model.Enabled
            });

            this.onBeforeSavePage(model);

            var that = this;
            Compozr.postSave(that.options.savePageUrl, Compozr.menu.Save.add(Compozr.menu.Revert), model, function () {
                if (!that.model.Enabled && window.confirm(that.resources.enablePageMessage)) {
                    Compozr.menu.TogglePage.click();
                }

                if (that.isEditMode()) {
                    if (that.options.previewAfterSave) {
                        Compozr.menu.EditPage.click();
                    } else {
                        Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
                    }
                }
                Compozr.menuWithAlias.Save.prev().add(Compozr.menuWithAlias.Revert.prev()).hide();
                if (!that.isEditMode()) {
                    Compozr.menuWithAlias.NewPage.show();
                }

                $Compozr.triggerHandler("save", model);

                that.model = $.extend(that.model, model);
            });
        },

        onRevertPage: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
                Compozr.menuWithAlias.NewPage.show();
            }

            var that = this;
            Compozr.queueTask("restoreData",
                function () { // action
                    that.restoreData();
                },
                function () { // condition
                    return that.view.cleanupPageEditorLock === 0;
                }
            );
        },

        onDeletePage: function () {
            Compozr.postDelete(this.options.deletePageUrl, Compozr.menu.DeletePage);
        },

        initMenu: function () {
            this._super();
            var that = this;
            Compozr.menu.TogglePage.on("click" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                that.togglePage();
            });
            Compozr.menu.DeletePage.on("click" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                Compozr.deleteDoc();
            });
            Compozr.menu.NewPage.on("click" + GG.PageCompozr.MultiPage.DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        },

        switchToEditMode: function () {
            this._super();
            Compozr.menuWithAlias.NewPage.hide();
            Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
        },

        switchToPreviewMode: function () {
            this._super();
            if (!Compozr.dirty()) {
                Compozr.menuWithAlias.NewPage.show();
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
            }
        },

        togglePage: function () {
            var that = this;
            Compozr.menu.TogglePage.data("jqXHR", Compozr.postJSON(this.options.togglePageUrl, {
                data: { enabled: !this.model.Enabled },
                onSuccess: function (data, textStatus, jqXHR) {
                    if (jqXHR !== Compozr.menu.TogglePage.data("jqXHR")) {
                        return;
                    }

                    that.model.Enabled = !that.model.Enabled;
                    Compozr.menuWithAlias.TogglePage.children("a").attr("title", that.model.Enabled ? that.resources.hide : that.resources.show)
                                                                  .children("span").removeClass(GG.PageCompozr.MultiPage.ENABLED_CSS_CLASS)
                                                                                   .removeClass(GG.PageCompozr.MultiPage.DISABLED_CSS_CLASS)
                                                                                   .addClass(that.model.Enabled ? GG.PageCompozr.MultiPage.ENABLED_CSS_CLASS : GG.PageCompozr.MultiPage.DISABLED_CSS_CLASS);
                },
                onComplete: function (jqXHR, textStatus) {
                    if (jqXHR === Compozr.menu.TogglePage.data("jqXHR")) {
                        Compozr.menu.TogglePage.removeData("jqXHR");
                    }
                }
            }));
        }
    };

})();

(function () {

    "use strict";

    GG.namespace("GG.DocCompozr");

    GG.DocCompozr.Resources = GG.Class.extend({
        tags: null,
        filters: null,
        series: null,
        title: null,
        urlFriendlyTitle: null,
        descriptionMeta: null,
        keywordsMeta: null,
        viewCount: null,

        edit: null,
        backToPreview: null,
        show: null,
        hide: null,

        enableDocMessage: null,
        docImages: null,
        insertImageHint: null,
        imageCaptionMessage: null,
        urlFriendlyTitleDescription: null,
        relatedDocs: null,

        pasteToolbarItemDescription: null
    });

})();

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

(function () {

    "use strict";

    GG.namespace("GG.Blog");

    GG.Blog.Resources = GG.DocCompozr.Resources.extend({
        category: null,
        publishDate: null,
        author: null,
        sourceUrl: null,
        shortContent: null,
        content: null,

        categoryDescription: null,
        unnamedCategory: null,

        readingArticleWithoutCategory: null,
        readingArticleWithCategory: null
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.Categories = GG.Class.extend({
        container: $(),
        resources: new GG.Blog.Resources(),

        form: $(),
        categories: $(),
        categoryTemplate: $(),

        init: function (container, resources) {
            this.container = $(container);
            this.resources = $.extend(this.resources, resources);

            this.form = $("form", this.container);

            var that = this;

            initGlobalEvents();

            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
                that.assignElements();
                that.backupData();
                that.prepareEditor(that.categories);
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
            });
            $Compozr.on("saveDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onSaveDoc();
            });
            $Compozr.on("revertDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onRevertDoc();
            });

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 78:
                            case 110:
                                // Ctrl + N
                                e.preventDefault();
                                Compozr.menu.NewCategory.click();
                                break;
                        }
                    }
                });
            }
        },

        onSaveDoc: function () {
            if (this.form.valid()) {
                Compozr.dirty(false);
                $.each(this.categories, function (index, value) {
                    var category = $(value),
                        inputs = $("[name^='Categories[']", category);
                    $.each(inputs, function (inputIndex, inputValue) {
                        var input = $(inputValue),
                            name = input.attr("name");
                        input.attr("name", "Categories[" + index + name.substr(name.lastIndexOf("].")));
                    });
                });
                this.form.submit();
            }
        },

        onRevertDoc: function () {
            this.restoreData();
            this.assignElements();
            this.prepareEditor(this.categories);
        },

        backupData: function () {
            this.form.data("original", this.form.html());
        },

        restoreData: function () {
            this.form.html(this.form.data("original"));
        },

        newCategory: function () {
            var newCategory = $(this.categoryTemplate.html()),
                id = $("input[name$='.Id']", newCategory);
            id.val(parseInt(id.val(), 10) - 1);
            this.categoryTemplate.html(GG.outerHtml(newCategory));
            this.categories = this.categories.add(newCategory);
            this.form.append(newCategory);
            this.prepareEditor(newCategory);
            Compozr.attachEditorEvents(newCategory);
            Compozr.dirty(true);
            $("input[name$='.Name']", newCategory).focus();
        },

        deleteCategory: function (category) {
            var id = $("input[name$='.Id']", category).val();
            $("input[name$='.ParentId'][value=" + id + "]", this.categories).val("");
            this.categories = this.categories.not(category);
            category.remove();
            this.initParentDropdown(this.categories);
            Compozr.dirty(true);
        },

        initMenu: function () {
            var that = this;

            Compozr.menu.NewCategory.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.newCategory();
            });
        },

        initParentDropdown: function (categories) {
            var that = this,
                parentId = $("input[name$='.ParentId']", categories);

            parentId.select2("destroy")
                    .removeAttr("style")
                    .select2({
                        width: "100%",
                        placeholder: " ",
                        allowClear: true,
                        query: function (query) {
                            var currentId = $("input[name$='.Id']", $(this.element).closest("fieldset")).val();
                            query.callback({ results: that.getModels(currentId) });
                        },
                        initSelection: function (element, callback) {
                            var id = $(element).val();
                            if (id !== "") {
                                var value = that.findModel(id);
                                callback(value);
                            }
                        }
                    }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                        Compozr.fixSizeViewport();
                    }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                        Compozr.restoreViewport();
                    });
        },

        refreshParentDropdown: function (categories) {
            var parentIds = $("input[name$='.ParentId']", categories);
            $.each(parentIds, function (index, value) {
                $(value).data("select2").initSelection();
            });
        },

        prepareEditor: function (categories) {
            var that = this;

            Compozr.includeAllInputs(categories);

            this.initParentDropdown(categories);

            $("input", categories).off(DEFAULT_EVENT_DOMAIN);

            $("input[name$='.Name']", categories).on("keyup" + DEFAULT_EVENT_DOMAIN, function () {
                var $this = $(this),
                    name = $this.val(),
                    heading = $("h1", $this.closest("section")),
                    urlFriendlyName = $("input[name$='.UrlFriendlyName']", $this.closest("fieldset")),
                    originalUrlFriendlyName = urlFriendlyName.val();
                heading.text(name === "" ? that.resources.unnamedCategory : name);
                urlFriendlyName.val(GG.toUrlFriendly(name));
                if (urlFriendlyName.val() !== originalUrlFriendlyName) {
                    Compozr.dirty(true);
                }
            });

            $("input[name$='.Name']", categories).add($("input[name$='.UrlFriendlyName']", categories))
                .on("change" + DEFAULT_EVENT_DOMAIN, function () {
                    that.refreshParentDropdown(that.categories);
                });

            $("button", categories).on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.deleteCategory($(this).closest("section"));
            });
        },

        assignElements: function () {
            this.categoryTemplate = $("template", Compozr.container);
            this.categories = $("section", this.form);
        },

        getModels: function (currentId) {
            var that = this,
                ret = [];
            $.each(this.categories, function (index, value) {
                var id = $("input[name$='.Id']", value).val(),
                    name = $("input[name$='.Name']", value).val(),
                    urlFriendlyName = $("input[name$='.UrlFriendlyName']", value).val();
                if (!currentId || id !== currentId) {
                    var text;
                    if (name !== "" && urlFriendlyName !== "") {
                        text = name + " (" + urlFriendlyName + ")";
                    } else if (name !== "") {
                        text = name;
                    } else if (urlFriendlyName !== "") {
                        text = urlFriendlyName;
                    } else {
                        text = "[" + that.resources.unnamedCategory + "]";
                    }

                    ret.push({
                        id: id,
                        name: name,
                        urlFriendlyName: urlFriendlyName,
                        text: text
                    });
                }
            });
            return ret;
        },

        findModel: function (id) {
            var models = this.getModels(),
                ret = null;
            $.each(models, function (index, value) {
                if (value.id === id) {
                    ret = value;
                    return false;
                }
            });
            return ret;
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.Index = GG.Class.extend({
        options: {
            newDocUrl: null
        },

        init: function (options) {
            this.options = $.extend(this.options, options);

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
        },
        
        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc);
        },

        initMenu: function () {
            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.Category = GG.Class.extend({
        options: {
            newDocUrl: null
        },
        model: {
            Id: null
        },

        init: function (options, viewModel) {
            this.options = $.extend(this.options, options);
            this.model = $.extend(this.model, {
                Id: viewModel.Id
            });

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
        },
        
        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc, { categoryId: this.model.Id });
        },

        initMenu: function () {
            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var EXTRA_INFO_CSS_CLASS = "extra-info",
        CLEARFIX_CSS_CLASS = "clearfix",
        PUBLISH_DATE_COLUMN_CSS_CLASS = "col-sm-4 col-md-3 col-lg-2",
        CATEGORY_ID_COLUMN_CSS_CLASS = "col-sm-8 col-md-3",
        COLUMN_BREAK_CSS_CLASS = "clearfix visible-sm",
        AUTHOR_COLUMN_CSS_CLASS = "col-sm-4 col-md-3",
        SOURCE_URL_COLUMN_CSS_CLASS = "col-sm-8 col-md-3 col-lg-4",
        ACTIVE_CATEGORY_CSS_CLASS = "active",
        DATE_TIME_INPUT_TEMPLATE = "<div class=\"input-group date\"><input type=\"text\" class=\"form-control\" /><span class=\"input-group-addon\"><span class=\"glyphicon glyphicon-calendar\"></span></span></div>";

    GG.Blog.ArticleViewOptions = GG.DocCompozr.DocViewOptions.extend({
        categoryUrl: null,
        findBloggerUrl: null,
        bloggerUrl: null
    });

    GG.Blog.ArticleView = GG.DocCompozr.DocView.extend({
        options: new GG.Blog.ArticleViewOptions(),
        resources: new GG.Blog.Resources(),

        categoryId: $(),
        publishDate: $(),
        author: $(),
        sourceUrl: $(),
        shortContent: $(),
        content: $(),

        headerDisplay: $(),
        breadcrumbs: $(),
        categories: $(),

        init: function (container, options, resources) {
            this._super(container, options, resources);
            this.shortContent = $(".short-content", this.doc);
            this.content = $(".content", this.doc);
            this.headerDisplay = $("header small", this.doc);
            this.breadcrumbs = $(".breadcrumbs", this.container);
            this.categories = $(".categories", this.container);
            this.hiddenOnEditMode = this.hiddenOnEditMode.add($(".social-network", this.container))
                                                         .add(this.breadcrumbs)
                                                         .add(this.categories);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var extraInfo, list;
            this.headerDisplay.after(extraInfo = $("<div></div>").hide()
                                                                 .addClass(EXTRA_INFO_CSS_CLASS)
                                                                 .append(list = $("<ul></ul>").addClass(CLEARFIX_CSS_CLASS)));
            list.append($("<li></li>").addClass(PUBLISH_DATE_COLUMN_CSS_CLASS).append(this.publishDate = $(DATE_TIME_INPUT_TEMPLATE).find("input").attr("placeholder", this.resources.publishDate).end()));
            list.append($("<li></li>").addClass(CATEGORY_ID_COLUMN_CSS_CLASS).append(this.categoryId = $("<input type=\"hidden\" />")));
            this.categoryId.after($("<span></span>").html(this.resources.categoryDescription));
            list.append($("<li></li>").addClass(COLUMN_BREAK_CSS_CLASS));
            list.append($("<li></li>").addClass(AUTHOR_COLUMN_CSS_CLASS).append(this.author = $("<div></div>")));
            list.append($("<li></li>").addClass(SOURCE_URL_COLUMN_CSS_CLASS).append(this.sourceUrl = $("<div></div>")));
            this.extraInfo = this.extraInfo.add(extraInfo);

            this.assignElementsLock--;
        },

        prepareDocEditor: function (turnOffContentHtml) {
            this.prepareDocEditorLock++;
            this._super();

            this.initPlaceHolder(this.author, this.resources.author, false, true);
            this.initPlaceHolder(this.sourceUrl, this.resources.sourceUrl, false, true);
            this.initPlaceHolder(this.shortContent, this.resources.shortContent, true, false);
            this.initPlaceHolder(this.content, this.resources.content, false, false);
            this.shortContent.add(this.content).css("min-height", "200px");
            this.shortContent.html(turnOffContentHtml(this.shortContent.html()));
            this.content.html(turnOffContentHtml(this.content.html()));

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function (turnOnContentHtml) {
            this.cleanupDocEditorLock++;
            this._super();

            this.destroyPlaceHolder(this.author, true);
            this.destroyPlaceHolder(this.sourceUrl, true);
            this.destroyPlaceHolder(this.shortContent, false);
            this.destroyPlaceHolder(this.content, false);
            this.shortContent.html(turnOnContentHtml(this.shortContent.html()));
            this.content.html(turnOnContentHtml(this.content.html()));

            this.cleanupDocEditorLock--;
        },

        loadDocModel: function () {
            var ret = this._super();
            return $.extend(ret, {
                CategoryId: this.categoryId.val(),
                PublishDate: this.publishDate.find("input").val(),
                Author: this.loadField(this.author),
                SourceUrl: this.loadField(this.sourceUrl),
                ShortContent: this.loadField(this.shortContent, true),
                Content: this.loadField(this.content, true)
            });
        },

        updateHeaderDisplay: function () {
            var that = this,
                category = this.categoryId.select2("data"),
                publishDateValue = this.publishDate.find("input").val(),
                displayPulishDate = publishDateValue.substring(0, publishDateValue.indexOf(" ")),
                author = this.loadField(this.author),
                sourceUrl = this.loadField(this.sourceUrl),
                bloggerPenName = null,
                bloggerUrlFriendlyPenName = null,
                bloggerAvatarThumbnailImage = null;

            if (author !== "" && sourceUrl === "") {
                this.headerDisplay.data("jqXHR", Compozr.getJSON(this.options.findBloggerUrl, {
                    data: { penName: author },
                    onSuccess: function (data, textStatus, jqXHR) {
                        if (jqXHR !== that.headerDisplay.data("jqXHR")) {
                            return;
                        }

                        bloggerPenName = data.model.PenName;
                        bloggerUrlFriendlyPenName = data.model.UrlFriendlyPenName;
                        bloggerAvatarThumbnailImage = data.model.AvatarThumbnailImage;
                    },
                    onComplete: function (jqXHR, textStatus) {
                        if (jqXHR === that.headerDisplay.data("jqXHR")) {
                            that.headerDisplay.removeData("jqXHR");
                        }
                    }
                }));
            } else {
                this.headerDisplay.removeData("jqXHR");
            }

            Compozr.cancelTask("updateHeaderDisplay");
            Compozr.queueTask("updateHeaderDisplay",
                function () { // action
                    var container = $("<div></div>");

                    // Author, SourceUrl
                    if (author !== "") {
                        if (sourceUrl === "") {
                            if (bloggerPenName === null) {
                                container.append($("<span></span>").html(author));
                            } else {
                                var link = that.options.bloggerUrl + "/" + bloggerUrlFriendlyPenName;
                                if (bloggerAvatarThumbnailImage !== null) {
                                    container.append($("<a></a>").addClass("avatar thumb")
                                                                 .attr("href", link)
                                                                 .attr("title", bloggerPenName)
                                                                 .append($("<img />").attr("src", bloggerAvatarThumbnailImage)
                                                                                     .attr("alt", bloggerPenName)));
                                }
                                container.append($("<a></a>").attr("href", link)
                                                             .html(bloggerPenName));
                            }
                        } else {
                            container.append($("<a></a>").attr("href", sourceUrl)
                                                         .attr("target", "_blank")
                                                         .attr("rel", "nofollow")
                                                         .html(author));
                        }
                        container.append(", ");
                    }

                    // Avatar
                    that.title.prev().remove();
                    var avatar = $("a.avatar", container);
                    if (avatar.is("*")) {
                        that.title.before(avatar.clone());
                    }

                    // PublishDate
                    container.append($("<time />").attr("datetime", publishDateValue)
                                                  .attr("pubdate", "")
                                                  .html(displayPulishDate));

                    // Category
                    if (category !== null && category.enabled) {
                        container.append(" | ");
                        container.append($("<a></a>").attr("href", that.options.categoryUrl + "/" + category.urlFriendlyName)
                                                     .html(category.name));
                    }

                    that.headerDisplay.html(container.html());
                },
                function () { // condition
                    return !that.headerDisplay.data("jqXHR");
                }
            );
        },

        updateBreadcrumbsCategories: function () {
            var container = $("<div></div>"),
                categoryLink = $("a[href^='" + this.options.categoryUrl + "']", this.headerDisplay),
                hasCategory = categoryLink.is("*"),
                template = hasCategory ? this.resources.readingArticleWithCategory : this.resources.readingArticleWithoutCategory;
            categoryLink = hasCategory ? categoryLink : null;

            // Breadcrumbs
            container.append(this.breadcrumbs.children().first()); // aside heading
            template = template.replace("{0}", GG.outerHtml($("a", this.breadcrumbs).first().html((this.titleEditor.is("*") ? this.titleEditor : this.title).html())));
            if (hasCategory) {
                template = template.replace("{1}", GG.outerHtml(categoryLink));
            }
            container.append(template);
            this.breadcrumbs.html(container.html());

            // Categories
            $("li", this.categories).removeClass(ACTIVE_CATEGORY_CSS_CLASS);
            if (hasCategory) {
                $("a[href='" + categoryLink.attr("href") + "']", this.categories).closest("li").addClass(ACTIVE_CATEGORY_CSS_CLASS);
            }
        }
    });

})();

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

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Base");

    GG.Documentation.Base.Resources = GG.DocCompozr.Resources.extend({
        parentPaper: null,
        order: null,
        shortTitle: null,

        parentPaperDescription: null
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Base");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Documentation.Base.Index = GG.Class.extend({
        options: {
            newDocUrl: null
        },

        init: function (options) {
            this.options = $.extend(this.options, options);

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
        },
        
        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc);
        },

        initMenu: function () {
            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Base");

    var ON_TWO_COLUMN_BREAK_CSS_CLASS = "clearfix visible-sm",
        ON_THREE_COLUMN_BREAK_CSS_CLASS = "clearfix visible-md visible-lg",
        COLUMN_CSS_CLASS = "col-sm-6 col-md-4",
        EXPANDED_COLUMN_CSS_CLASS = "col-sm-6 col-md-8",
        FULL_COLUMN_CSS_CLASS = "col-sm-12";

    GG.Documentation.Base.PaperView = GG.DocCompozr.DocView.extend({
        resources: new GG.Documentation.Base.Resources(),

        parentId: $(),
        order: $(),
        shortTitle: $(),

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            this.urlFriendlyTitle.closest("li").before($("<li></li>").addClass(FULL_COLUMN_CSS_CLASS).css("margin-bottom", "0").append(this.parentId = $("<input type=\"hidden\" />")));
            this.parentId.after($("<span></span>").html(this.resources.parentPaperDescription));
            this.descriptionMeta.closest("li").before($("<li></li>").addClass(EXPANDED_COLUMN_CSS_CLASS).append(this.shortTitle = $("<div></div>")))
                                              .before($("<li></li>").addClass(ON_THREE_COLUMN_BREAK_CSS_CLASS))
                                              .before($("<li></li>").addClass(COLUMN_CSS_CLASS).append(this.order = $("<div></div>")))
                                              .before($("<li></li>").addClass(ON_TWO_COLUMN_BREAK_CSS_CLASS));

            this.assignElementsLock--;
        },

        prepareDocEditor: function () {
            this.prepareDocEditorLock++;
            this._super();

            this.initPlaceHolder(this.order, this.resources.order, false, true);
            this.initPlaceHolder(this.shortTitle, this.resources.shortTitle, false, true);

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function () {
            this.cleanupDocEditorLock++;
            this._super();

            this.destroyPlaceHolder(this.order, true);
            this.destroyPlaceHolder(this.shortTitle, true);

            this.cleanupDocEditorLock--;
        },

        loadDocModel: function () {
            var ret = this._super();
            return $.extend(ret, {
                ParentId: this.parentId.val(),
                Order: this.loadField(this.order),
                ShortTitle: this.loadField(this.shortTitle)
            });
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Base");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Documentation.Base.PaperModel = GG.DocCompozr.DocModel.extend({
        ParentId: null,
        Order: null,
        ShortTitle: null
    });

    GG.Documentation.Base.PaperControllerOptions = GG.DocCompozr.DocControllerOptions.extend({
        findPaperUrl: null,
        searchPapersUrl: null,

        autoRefreshOnParentChange: true
    });

    GG.Documentation.Base.PaperController = GG.DocCompozr.DocController.extend({
        view: new GG.Documentation.Base.PaperView(),
        options: new GG.Documentation.Base.PaperControllerOptions(),
        model: new GG.Documentation.Base.PaperModel(),
        resources: new GG.Documentation.Base.Resources(),

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            if (this.options.autoRefreshOnParentChange) {
                var that = this;
                $Compozr.on("save" + DEFAULT_EVENT_DOMAIN, function (event, data) {
                    if (data.ParentId !== that.model.ParentId && data.UrlFriendlyTitle === that.model.UrlFriendlyTitle) {
                        Compozr.cancelTask("redirectByParentId");
                        Compozr.queueTask("redirectByParentId",
                            function () { // action
                                Compozr.dirty(false);
                                window.location = window.location;
                            },
                            function () { // condition
                                return !Compozr.menu.ToggleDoc.data("jqXHR");
                            }
                        );
                    }
                });
            }
        },

        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc, { parentId: this.model.Id });
        },

        restoreData: function () {
            this._super();

            this.view.parentId.val(this.model.ParentId);
            this.view.order.html(this.model.Order);
            this.view.shortTitle.html(this.model.ShortTitle);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var that = this;
            Compozr.queueTask("finishAssignElements",
                function () {
                    that.view.parentId.val(that.model.ParentId);
                    that.view.order.html(that.model.Order);
                    that.view.shortTitle.html(that.model.ShortTitle);

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
                editables = this.view.order.add(this.view.shortTitle);
            editables.attr(Compozr.CONTENTEDITABLE, "true")
                     .attr(Compozr.SINGLE_LINE, "")
                     .attr(Compozr.NO_HTML, "")
                     .attr(Compozr.SELECT_ON_FOCUS, "");

            Compozr.includeAllInputs(this.view.parentId);
            this.view.parentId.select2({
                width: "100%",
                minimumInputLength: 3,
                placeholder: this.resources.parentPaper,
                allowClear: true,
                query: function (query) {
                    Compozr.getJSON(that.options.searchPapersUrl, {
                        data: { term: query.term, currentId: that.model.Id },
                        onSuccess: function (data/*, textStatus, jqXHR*/) {
                            $.each(data.models, function (index, value) {
                                data.models[index] = {
                                    id: value.Id,
                                    text: value.Title + " (" + value.UrlFriendlyTitle + ")"
                                };
                            });
                            query.callback({ results: data.models });
                        },
                    });
                },
                initSelection: function (element, callback) {
                    var id = $(element).val();
                    if (id !== "") {
                        Compozr.getJSON(that.options.findPaperUrl, {
                            data: { id: id },
                            onSuccess: function (data/*, textStatus, jqXHR*/) {
                                callback({
                                    id: data.model.Id,
                                    text: data.model.Title + " (" + data.model.UrlFriendlyTitle + ")"
                                });
                            }
                        });
                    }
                }
            }).on("change" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.dirty(true);
            }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.fixSizeViewport();
            }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.restoreViewport();
            });

            this.enableElementsEditabilityLock--;
        },

        disableElementsEditability: function () {
            this.disableElementsEditabilityLock++;
            this._super();

            var editables = this.view.order.add(this.view.shortTitle);
            editables.removeAttr(Compozr.CONTENTEDITABLE);
            this.view.parentId.select2("destroy")
                              .removeAttr("style");

            this.disableElementsEditabilityLock--;
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Whole");

    GG.Documentation.Whole.Resources = GG.Documentation.Base.Resources.extend({
        content: null
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Whole");

    GG.Documentation.Whole.Index = GG.Documentation.Base.Index.extend({});

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Whole");

    GG.Documentation.Whole.PaperView = GG.Documentation.Base.PaperView.extend({
        resources: new GG.Documentation.Whole.Resources(),

        content: $(),

        init: function (container, options, resources) {
            this._super(container, options, resources);
            this.content = $(".content", this.doc);
        },

        prepareDocEditor: function (turnOffContentHtml) {
            this.prepareDocEditorLock++;
            this._super();

            this.initPlaceHolder(this.content, this.resources.content, true, false);
            this.content.css("min-height", "200px")
                        .html(turnOffContentHtml(this.content.html()));

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function (turnOnContentHtml) {
            this.cleanupDocEditorLock++;
            this._super();

            this.destroyPlaceHolder(this.content, false);
            this.content.html(turnOnContentHtml(this.content.html()));

            this.cleanupDocEditorLock--;
        },

        loadDocModel: function () {
            var ret = this._super();
            return $.extend(ret, {
                Content: this.loadField(this.content, true)
            });
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Whole");

    GG.Documentation.Whole.PaperModel = GG.Documentation.Base.PaperModel.extend({
        Content: null
    });

    GG.Documentation.Whole.PaperController = GG.Documentation.Base.PaperController.extend({
        view: new GG.Documentation.Whole.PaperView(),
        model: new GG.Documentation.Whole.PaperModel(),

        onBeforeSaveDoc: function (doc) {
            doc.Content = $.trim(this.isEditMode() ? doc.Content : this.turnOffContentHtml(doc.Content));
        },

        backupData: function () {
            this._super();
            this.model = $.extend(this.model, {
                Content: this.view.content.html()
            });
        },

        restoreData: function () {
            this._super();
            this.view.content.html(this.model.Content);
        },

        enableElementsEditability: function () {
            this.enableElementsEditabilityLock++;
            this._super();

            this.view.content.attr(Compozr.CONTENTEDITABLE, "true");
            if (this.options.editMode) {
                this.view.content.attr(Compozr.SELECT_ON_FIRST_FOCUS, "");
            }

            this.enableElementsEditabilityLock--;
        },

        disableElementsEditability: function () {
            this.disableElementsEditabilityLock++;
            this._super();

            this.view.content.removeAttr(Compozr.CONTENTEDITABLE);

            this.disableElementsEditabilityLock--;
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    GG.Documentation.Split.Resources = GG.Documentation.Base.Resources.extend({
        content: null,

        editOrCompact: null,
        editOrFull: null,
        backToPreviewOrCompact: null,
        backToPreviewOrFull: null,

        autoSplit: null,
        autoSplitWarning: null,
        mergeWithAbove: null,
        mergeWithBelow: null,
        autoNumber: null,
        autoNumberWarning: null,
        autoCleanupNumber: null,
        autoCleanupNumberWarning: null,
        insertSectionAbove: null,
        insertSectionBelow: null,
        deleteSection: null,

        assignElementsProgress: null,
        setSectionsProgress: null,
        prepareDocEditorProgress: null,
        cleanupDocEditorProgress: null,
        enableElementsEditabilityProgress: null,
        disableElementsEditabilityProgress: null,
        autoSplitSectionProgress: null
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    GG.Documentation.Split.Index = GG.Documentation.Base.Index.extend({});

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        HAS_NUMBERS_CSS_CLASS = "has-numbers",
        EDITOR_CSS_CLASS = "editor",
        COMPACT_CSS_CLASS = "compact",

        NUMBER_CSS_CLASS = "number",
        CONTENT_CSS_CLASS = "content",
        TAGS_CSS_CLASS = "tags",
        CLEARFIX_CSS_CLASS = "clearfix",
        TOOLBOX_CSS_CLASS = "toolbox",
        TOOLBOX_BUTTON_GROUP_CSS_CLASS = "btn-group",
        TOOLBOX_BUTTON_CSS_CLASS = "btn btn-link btn-xs",

        AUTO_SPLIT_BUTTON_ICON_CSS_CLASS = "auto-split glyphicon glyphicon-th-list",
        MERGE_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-th-large",
        MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS = "merge-with-above glyphicon glyphicon-hand-up",
        MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS = "merge-with-below glyphicon glyphicon-hand-down",
        AUTO_NUMBER_BUTTON_ICON_CSS_CLASS = "auto-number fa fa-list-ol",
        AUTO_CLEAN_UP_NUMBER_BUTTON_ICON_CSS_CLASS = "auto-clean-up-number fa fa-list-ul",
        INSERT_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-plus-sign",
        INSERT_ABOVE_BUTTON_ICON_CSS_CLASS = "insert-above glyphicon glyphicon-hand-up",
        INSERT_BELOW_BUTTON_ICON_CSS_CLASS = "insert-below glyphicon glyphicon-hand-down",
        DELETE_SECTION_BUTTON_ICON_CSS_CLASS = "delete glyphicon glyphicon-trash",

        TOOLBOX_ITEM_ATTRIBUTE = "data-compozr-toolbox-item",

        SHOW_PROGRESS_BREAK_POINT = 10;

    GG.Documentation.Split.PaperView = GG.Documentation.Base.PaperView.extend({
        resources: new GG.Documentation.Split.Resources(),

        sections: $(),
        toolbox: $(),
        directories: $(),

        setSectionsLock: 0,

        init: function (container, options, resources) {
            this._super(container, options, resources);
            this.sections = $(".sections", this.container);
            this.directories = $(".directories", this.container).parent();
        },

        isCompactMode: function () {
            return this.doc.hasClass(COMPACT_CSS_CLASS);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var that = this;
            this.sections.append(this.toolbox = _createToolbox().hide());
            this.assignSectionsElements($(">li", this.sections));

            this.assignElementsLock--;

            function _createToolbox() {
                var button = $("<button></button>").attr("type", "button")
                                                   .attr("tabindex", "-1")
                                                   .addClass(TOOLBOX_BUTTON_CSS_CLASS),
                    autoSplitButton
                        = button.clone().attr("title", that.resources.autoSplit)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoSplitSection")
                                        .append($("<span></span>").addClass(AUTO_SPLIT_BUTTON_ICON_CSS_CLASS)),
                    mergeWithAboveButton
                        = button.clone().attr("title", that.resources.mergeWithAbove)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "mergeSectionWithAbove")
                                        .append($("<span></span>").addClass(MERGE_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS)),
                    mergeWithBelowButton
                        = button.clone().attr("title", that.resources.mergeWithBelow)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "mergeSectionWithBelow")
                                        .append($("<span></span>").addClass(MERGE_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS)),
                    autoNumberButton
                        = button.clone().attr("title", that.resources.autoNumber)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoNumberSections")
                                        .append($("<span></span>").addClass(AUTO_NUMBER_BUTTON_ICON_CSS_CLASS)),
                    autoCleanUpNumberButton
                        = button.clone().attr("title", that.resources.autoCleanupNumber)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoCleanUpNumberSections")
                                        .append($("<span></span>").addClass(AUTO_CLEAN_UP_NUMBER_BUTTON_ICON_CSS_CLASS)),
                    insertAboveButton
                        = button.clone().attr("title", that.resources.insertAbove)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "insertSectionAbove")
                                        .append($("<span></span>").addClass(INSERT_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(INSERT_ABOVE_BUTTON_ICON_CSS_CLASS)),
                    insertBelowButton
                        = button.clone().attr("title", that.resources.insertSectionBelow)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "insertSectionBelow")
                                        .append($("<span></span>").addClass(INSERT_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(INSERT_BELOW_BUTTON_ICON_CSS_CLASS)),
                    deleteButton
                        = button.clone().attr("title", that.resources.deleteSection)
                                        .append($("<span></span>").addClass(DELETE_SECTION_BUTTON_ICON_CSS_CLASS)),
                    toolbox = $("<div></div>").addClass(TOOLBOX_CSS_CLASS)
                                              .append($("<div></div>").addClass(TOOLBOX_BUTTON_GROUP_CSS_CLASS)
                                                                      .append(autoSplitButton)
                                                                      .append(mergeWithAboveButton)
                                                                      .append(mergeWithBelowButton)
                                                                      .append(autoNumberButton)
                                                                      .append(autoCleanUpNumberButton)
                                                                      .append(insertAboveButton)
                                                                      .append(insertBelowButton)
                                                                      .append(deleteButton));

                $("[" + TOOLBOX_ITEM_ATTRIBUTE + "]", toolbox).on("click" + DEFAULT_EVENT_DOMAIN + "-toolbox", function () {
                    $Compozr.triggerHandler($(this).attr(TOOLBOX_ITEM_ATTRIBUTE), $(this).closest("li"));
                });

                deleteButton.on("click" + DEFAULT_EVENT_DOMAIN + "-toolbox", function () {
                    var section = $(this).closest("li");
                    that.sections.append(that.toolbox.hide());
                    section.remove();
                    Compozr.dirty(true);
                });

                return toolbox;
            }
        },

        prepareDocEditor: function (turnOffContentHtml) {
            this.prepareDocEditorLock++;
            this._super();

            if (!this.isCompactMode()) {
                this.directories.hide();
                this.doc.parent().css("width", "100%");
            }
            this.doc.removeClass(HAS_NUMBERS_CSS_CLASS)
                    .addClass(EDITOR_CSS_CLASS);
            $(">li", this.sections).show();
            this.prepareSectionsEditor($(">li", this.sections), turnOffContentHtml, false);

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function (turnOnContentHtml) {
            this.cleanupDocEditorLock++;
            this._super();

            var that = this;
            this.cleanupSectionsEditorAsync($(">li", this.sections), turnOnContentHtml, function () {
                if (!that.isCompactMode()) {
                    that.doc.parent().css("width", "");
                    that.directories.show();
                }
                that.doc.removeClass(EDITOR_CSS_CLASS)
                        .addClass(HAS_NUMBERS_CSS_CLASS);
                that.checkHasNumbers();
                that.doc.removeClass(COMPACT_CSS_CLASS);
                that.cleanupDocEditorLock--;
            }, false);
        },

        prepareDocFullMode: function () {
            this.prepareDocEditorLock++;

            this.directories.hide();
            this.doc
                .removeClass(COMPACT_CSS_CLASS)
                .parent().css("width", "100%");
            this.prepareSectionsEditor($(">li", this.sections), null, true);

            this.prepareDocEditorLock--;
        },

        cleanupDocFullMode: function () {
            this.cleanupDocEditorLock++;

            var that = this;
            this.cleanupSectionsEditorAsync($(">li", this.sections), null, function () {
                that.doc
                    .addClass(COMPACT_CSS_CLASS)
                    .parent().css("width", "");
                that.directories.show();
                that.cleanupDocEditorLock--;
            }, true);
        },

        loadDocModel: function () {
            var ret = this._super();

            return $.extend(ret, {
                Sections: this.loadSections()
            });
        },

        createNewSection: function () {
            return $("<li></li>").append($("<div></div>").addClass(NUMBER_CSS_CLASS))
                                 .append($("<div></div>").addClass(CONTENT_CSS_CLASS));
        },

        assignSectionsElements: function (sections) {
            this.assignElementsLock++;
            var that = this;
            this.assignSectionsElementsAsync(sections, function () {
                that.assignElementsLock--;
            });
        },

        prepareSectionsEditor: function (sections, turnOffContentHtml, fromCompactMode) {
            this.prepareDocEditorLock++;
            var that = this;
            this.prepareSectionsEditorAsync(sections, turnOffContentHtml, function () {
                that.refreshToolbox();
                that.prepareDocEditorLock--;
            }, fromCompactMode);
        },

        checkHasNumbers: function () {
            var that = this,
                hasNumber = false;
            $.each($(">li", this.sections), function (index, value) {
                var $value = $(value),
                    number = $("." + NUMBER_CSS_CLASS, $value),
                    content = $("." + CONTENT_CSS_CLASS, $value);
                if (number.is(":empty") && content.is(":empty")) {
                    $value.hide();
                } else if (!number.is(":empty")) {
                    hasNumber = true;
                }
            });
            if (hasNumber) {
                this.doc.addClass(HAS_NUMBERS_CSS_CLASS);
            } else {
                this.doc.removeClass(HAS_NUMBERS_CSS_CLASS);
            }
        },

        refreshToolbox: function () {
            var mergeWithAboveButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=mergeSectionWithAbove]", this.sections),
                mergeWithBelowButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=mergeSectionWithBelow]", this.sections),
                autoNumberButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=autoNumberSections]", this.sections);
            mergeWithAboveButtons.add(mergeWithBelowButtons)
                                 .add(autoNumberButtons)
                                 .removeAttr("disabled");
            $(">li:first", this.sections).find(mergeWithAboveButtons).attr("disabled", "disabled");
            $(">li:last", this.sections).find(mergeWithBelowButtons).attr("disabled", "disabled")
                                        .find(autoNumberButtons).attr("disabled", "disabled");
        },

        setSections: function (sectionsData) {
            this.setSectionsLock++;
            var that = this;
            this.setSectionsAsync($(">li", this.sections), sectionsData.slice(0), function () {
                that.setSectionsLock--;
            });
        },

        loadSections: function () {
            var that = this,
                ret = [];
            $.each($(">li", this.sections), function (index, value) {
                ret.push(that.loadSection($(value)));
            });
            return ret;
        },

        loadSection: function (section) {
            return {
                Number: this.loadField($("." + NUMBER_CSS_CLASS, section)),
                Content: this.loadField($("." + CONTENT_CSS_CLASS, section), true),
                TagsEdit: $("." + TAGS_CSS_CLASS, section).children("input").val(),
            };
        },

        assignSectionsElementsAsync: function (sections, done) {
            var that = this,
                tags = $("<div></div>").addClass(TAGS_CSS_CLASS)
                                       .append($("<input type=\"hidden\" />"))
                                       .hide(),
                clearfix = $("<div></div>").addClass(CLEARFIX_CSS_CLASS)
                                           .css("clear", "both")
                                           .hide(),
                content = $("." + CONTENT_CSS_CLASS, sections);
            if (content.length > 1) {
                content = content.slice(0, SHOW_PROGRESS_BREAK_POINT);
                window.setTimeout(function () {
                    $.each(content, function (index, value) {
                        var $value = $(value);
                        that.assignSectionElements($value, clearfix.clone(), tags.clone());
                        sections = sections.not($value.closest("li"));
                    });
                    that.assignSectionsElementsAsync(sections, done);
                }, 10);
            } else {
                if (content.length === 1) {
                    this.assignSectionElements(content, clearfix, tags);
                }
                done();
            }
        },

        assignSectionElements: function (content, clearfix, tags) {
            Compozr.increaseProgress(1, this.resources.assignElementsProgress);
            content.after(clearfix).after(tags);
        },

        prepareSectionsEditorAsync: function (sections, turnOffContentHtml, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections),
                number = $("." + NUMBER_CSS_CLASS, currentSections),
                content = $("." + CONTENT_CSS_CLASS, currentSections),
                tags = $("." + TAGS_CSS_CLASS, currentSections),
                clearfix = $("." + CLEARFIX_CSS_CLASS, currentSections);

            if (!fromCompactMode) {
                number.css("min-height", "0");
                this.initPlaceHolder(number, "#", false, false);
                content.css("min-height", "50px");
                this.initPlaceHolder(content, this.resources.content, true, false);
                clearfix.show();

                if (turnOffContentHtml) {
                    $(content).each(function (index, value) {
                        var $value = $(value);
                        $value.html(turnOffContentHtml($value.html()));
                    });
                }

                // Show toolbox on focus
                number.add(content).on("focus" + DEFAULT_EVENT_DOMAIN, function (e) {
                    $(this).closest("li").find(clearfix).append(that.toolbox.show());
                    that.refreshToolbox();
                });

                if (!Modernizr.touch) {
                    number.add(content).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                        switch (e.which) {
                            case 77:
                            case 109:
                                if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) { // Ctrl + Shift + M
                                    e.preventDefault();
                                    _findButton(MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS).click();
                                } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) { // Ctrl + M
                                    e.preventDefault();
                                    _findButton(MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS).click();
                                }
                                break;
                            case 13:
                                if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) { // Ctrl + Shift + Enter
                                    e.preventDefault();
                                    _findButton(INSERT_ABOVE_BUTTON_ICON_CSS_CLASS).click();
                                } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) { // Ctrl + Enter
                                    e.preventDefault();
                                    _findButton(INSERT_BELOW_BUTTON_ICON_CSS_CLASS).click();
                                }
                                break;
                        }

                        var thisSection = $(this).closest("li");
                        function _findButton(cssClass) {
                            return $("." + cssClass.split(" ")[0], thisSection).closest("button");
                        }
                    });

                    number.on("keydown" + DEFAULT_EVENT_DOMAIN, function (e) {
                        var section = $();
                        switch (e.which) {
                            case 38:
                                // Up
                                section = $(this).closest("li").prev();
                                break;
                            case 40:
                                // Down
                            case 13:
                                // Enter
                                section = $(this).closest("li").next();
                                break;
                        }
                        if (section.is("*")) {
                            $("." + NUMBER_CSS_CLASS, section).focus();
                        }
                    });
                }
            }

            if (!this.isCompactMode()) {
                tags.show();
            }

            Compozr.increaseProgress(currentSections.length, this.resources.prepareDocEditorProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.prepareSectionsEditorAsync(nextSections, turnOffContentHtml, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        cleanupSectionsEditorAsync: function (sections, turnOnContentHtml, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections),
                number = $("." + NUMBER_CSS_CLASS, currentSections),
                content = $("." + CONTENT_CSS_CLASS, currentSections),
                tags = $("." + TAGS_CSS_CLASS, currentSections),
                clearfix = $("." + CLEARFIX_CSS_CLASS, currentSections);

            if (!this.isCompactMode()) {
                tags.hide();
            }

            if (!fromCompactMode) {
                number.add(content).off(DEFAULT_EVENT_DOMAIN);
                clearfix.hide();
                this.destroyPlaceHolder(number, false);
                this.destroyPlaceHolder(content, false);
                content.each(function (index, value) {
                    $(value).html(turnOnContentHtml($(value).html()));
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.cleanupDocEditorProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.cleanupSectionsEditorAsync(nextSections, turnOnContentHtml, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        setSectionsAsync: function (sections, sectionsData, done) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);
            $.each(currentSections, function (index, value) {
                that.setSection($(value), sectionsData[0]);
                sectionsData.shift();
            });

            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.setSectionsAsync(nextSections, sectionsData, done);
                }, 10);
            } else {
                done();
            }
        },

        setSection: function (section, sectionData) {
            Compozr.increaseProgress(1, this.resources.setSectionsProgress);
            $("." + TAGS_CSS_CLASS, section).children("input").val(sectionData.Tags);
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        COMPACT_CSS_CLASS = "compact",
        NUMBER_CSS_CLASS = "number",
        CONTENT_CSS_CLASS = "content",
        TAGS_CSS_CLASS = "tags",
        CLEARFIX_CSS_CLASS = "clearfix",
        SHOW_PROGRESS_BREAK_POINT = 10;

    GG.Documentation.Split.PaperModel = GG.Documentation.Base.PaperModel.extend({
        Sections: []
    });

    GG.Documentation.Split.PaperControllerOptions = GG.Documentation.Base.PaperControllerOptions.extend({
        compactModeAsDefault: false,
        findSectionTagsUrl: null,
        searchSectionTagsUrl: null
    });

    GG.Documentation.Split.PaperController = GG.Documentation.Base.PaperController.extend({
        view: new GG.Documentation.Split.PaperView(),
        options: new GG.Documentation.Split.PaperControllerOptions(),
        model: new GG.Documentation.Split.PaperModel(),
        resources: new GG.Documentation.Split.Resources(),

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            var that = this;

            $Compozr.on("autoSplitSection" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoSplitSection($(data));
            });

            $Compozr.on("mergeSectionWithAbove" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.mergeSectionWithAbove($(data));
            });

            $Compozr.on("mergeSectionWithBelow" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.mergeSectionWithBelow($(data));
            });

            $Compozr.on("autoNumberSections" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoNumberSections($(data));
            });

            $Compozr.on("autoCleanUpNumberSections" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoCleanUpNumberSections($(data));
            });

            $Compozr.on("insertSectionAbove" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.insertSectionAbove($(data));
            });

            $Compozr.on("insertSectionBelow" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.insertSectionBelow($(data));
            });

            initGlobalEvents();

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.shortcutLock) { return; }
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 69:
                            case 101:
                                // Ctrl + Shift + E
                                e.preventDefault();
                                $(":focus").blur();
                                var event = $.Event("click", { shiftKey: true });
                                Compozr.menu.EditDoc.trigger(event);
                                break;
                            case 78:
                            case 110:
                                // Ctrl + Shift + N
                                if (that.isEditMode()) {
                                    e.preventDefault();
                                    Compozr.menu.NewSection.click();
                                }
                                break;
                        }
                    }
                });
            }
        },

        onBeforeSaveDoc: function (doc) {
            var that = this;
            $.each(doc.Sections, function (index, value) {
                value.Content = $.trim(that.isEditMode() ? value.Content : that.turnOffContentHtml(value.Content));
            });
        },

        onRevertDoc: function () {
            this.view.sections.append(this.view.toolbox.hide());
            var sections = $(">li", this.view.sections);
            if (sections.length > this.model.Sections.length) {
                sections = sections.slice(this.model.Sections.length);
                sections.remove();
            }

            this._super();
        },

        initMenu: function () {
            this._super();

            var that = this;

            Compozr.menu.EditDoc.off("click" + DEFAULT_EVENT_DOMAIN);
            Compozr.menu.EditDoc.on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                if (e.shiftKey) {
                    that.toggleCompactMode();
                } else {
                    that.switchMode();
                }
            });

            Compozr.menuWithAlias.NewSection.hide();
            Compozr.menu.NewSection.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.newSection();
            });
        },

        switchMode: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                this.switchToEditMode(this.options.compactModeAsDefault);
            }
        },

        switchToEditMode: function (compact) {
            compact = compact === true;
            if (compact) {
                this.view.doc.addClass(COMPACT_CSS_CLASS);
            }
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.prepareDocEditorProgress);
            }
            this._super();

            var that = this;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.queueTask("endProgress",
                    function () { // action
                        Compozr.endProgress();
                    },
                    function () { // condition
                        return that.enableElementsEditabilityLock === 0;
                    }
                );
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", compact ? this.resources.backToPreviewOrFull : this.resources.backToPreviewOrCompact);
            Compozr.menuWithAlias.NewSection.show();
        },

        switchToPreviewMode: function () {
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.disableElementsEditabilityProgress);
            }
            this._super();

            var that = this;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.queueTask("endProgress",
                    function () { // action
                        Compozr.endProgress();
                    },
                    function () { // condition
                        return that.view.cleanupDocEditorLock === 0;
                    }
                );
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.options.compactModeAsDefault ? this.resources.editOrFull : this.resources.editOrCompact);
            Compozr.menuWithAlias.NewSection.hide();
        },

        toggleCompactMode: function () {
            if (this.isEditMode()) {
                if (this.view.isCompactMode()) {
                    this.switchToFullMode();
                } else {
                    this.switchToCompactMode();
                }
            } else {
                this.switchToEditMode(!this.options.compactModeAsDefault);
            }
        },

        switchToFullMode: function () {
            if (!this.isEditMode()) {
                return;
            }

            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.enableElementsEditabilityProgress);
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.backToPreviewOrCompact);

            this.view.prepareDocFullMode();

            Compozr.queueTask("enableElementsEditability",
                function () { // action
                    that.enableElementsEditability();
                },
                function () { // condition
                    return that.view.prepareDocEditorLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToFullMode",
                function () { // action
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                },
                function () { // condition
                    return that.enableElementsEditabilityLock === 0;
                }
            );
        },

        switchToCompactMode: function () {
            if (!this.isEditMode()) {
                return;
            }

            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.disableElementsEditabilityProgress);
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.backToPreviewOrFull);

            this.disableElementsEditability(true);

            Compozr.queueTask("cleanupDocFullMode",
                function () { // action
                    that.view.cleanupDocFullMode();
                },
                function () { // condition
                    return that.disableElementsEditabilityLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToCompactMode",
                function () { // action
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                },
                function () { // condition
                    return that.view.cleanupDocEditorLock === 0;
                }
            );

        },

        backupData: function () {
            this._super();

            var that = this,
                sections = $(">li", this.view.sections);
            $.each(sections, function (index, value) {
                that.model.Sections[index] = $.extend(that.model.Sections[index], {
                    Number: $("." + NUMBER_CSS_CLASS, value).html(),
                    Content: $("." + CONTENT_CSS_CLASS, value).html()
                });
            });
        },

        restoreData: function () {
            this._super();

            var that = this,
                sections = $(">li", this.view.sections),
                emptySection = this.view.createNewSection();
            this.view.assignSectionsElements(emptySection);
            while (sections.length < this.model.Sections.length) {
                var newSection = emptySection.clone();
                sections.append(newSection);
                sections = sections.add(newSection);
            }
            $.each(sections, function (index, value) {
                $("." + NUMBER_CSS_CLASS, value).html(that.model.Sections[index].Number);
                $("." + CONTENT_CSS_CLASS, value).html(that.model.Sections[index].Content);
                that.view.setSection(value, that.model.Sections[index]);
                $(value).show();
            });
            this.view.checkHasNumbers();
        },

        newSection: function () {
            var newItem = this.view.createNewSection(),
                lastItem = this.view.sections.children().last();
            this.view.sections.append(newItem);
            if (lastItem.is("*")) {
                $("." + NUMBER_CSS_CLASS, newItem).html(this.increaseSectionNumber(lastItem));
            }
            this.finishInsertSection(newItem);
        },

        autoSplitSection: function (currentItem) {
            if (!window.confirm(this.resources.autoSplitWarning)) {
                return;
            }

            var that = this,
                paragraphs = GG.textWithLineBreaks(this.view.loadField($("." + CONTENT_CSS_CLASS, currentItem), true)).split("\n");
            this.shortcutLock = true;
            Compozr.fadeOut();
            if (paragraphs.length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, paragraphs.length * 3, this.resources.autoSplitSectionProgress);
            }
            this.autoSplitSectionAsync(paragraphs.slice(0), currentItem, currentItem, false, function (found) {
                if (found) {
                    that.view.sections.append(that.view.toolbox.hide());
                    currentItem.remove();
                    Compozr.dirty(true);
                }
                if (paragraphs.length > SHOW_PROGRESS_BREAK_POINT) {
                    Compozr.endProgress();
                }
                Compozr.fadeIn();
                that.shortcutLock = false;
            });
        },

        autoSplitSectionAsync: function (paragraphs, currentItem, previousItem, found, done) {
            var that = this,
                currentParagraphs = paragraphs.splice(0, SHOW_PROGRESS_BREAK_POINT);
            $.each(currentParagraphs, function (index, value) {
                if (value.trim() !== "") {
                    found = true;
                    var newItem = that.view.createNewSection();
                    previousItem.after(newItem);
                    $("." + NUMBER_CSS_CLASS, newItem).html(newItem.is(currentItem.next()) ? that.view.loadField($("." + NUMBER_CSS_CLASS, currentItem)) : that.increaseSectionNumber(previousItem));
                    $("." + CONTENT_CSS_CLASS, newItem).html(value.trim());
                    that.view.assignSectionsElements(newItem);
                    that.view.prepareSectionsEditor(newItem);
                    that.enableSectionsEditabilityAsync(newItem, function () { }, false);
                    Compozr.attachEditorEvents(newItem);
                    previousItem = newItem;
                    Compozr.increaseProgress(0, that.resources.autoSplitSectionProgress);
                } else {
                    Compozr.increaseProgress(3, that.resources.autoSplitSectionProgress);
                }
            });
            if (paragraphs.length > 0) {
                window.setTimeout(function () {
                    that.autoSplitSectionAsync(paragraphs, currentItem, previousItem, found, done);
                }, 10);
            } else {
                done(found);
            }
        },

        mergeSectionWithAbove: function (currentItem) {
            var previousItem = currentItem.prev();
            if (previousItem.is("*")) {
                this.mergeSections(previousItem, currentItem);
            }
        },

        mergeSectionWithBelow: function (currentItem) {
            var nextItem = currentItem.next();
            if (nextItem.is("*")) {
                this.mergeSections(currentItem, nextItem);
            }
        },

        mergeSections: function (item1, item2) {
            var content1 = this.view.loadField($("." + CONTENT_CSS_CLASS, item1), true),
                content2 = this.view.loadField($("." + CONTENT_CSS_CLASS, item2), true),
                tags1 = $("." + TAGS_CSS_CLASS, item1).children("input"),
                tags2 = $("." + TAGS_CSS_CLASS, item2).children("input");
            this.view.setField($("." + CONTENT_CSS_CLASS, item1), content1 + "<br />" + content2);
            this.mergeMultiSelectFields(tags1, tags2);
            item2.remove();
            $("." + CONTENT_CSS_CLASS, item1).focus();
            Compozr.dirty(true);
        },

        mergeMultiSelectFields: function (field1, field2) {
            var value1, value2;
            if (this.view.isCompactMode()) {
                value1 = field1.val().split(",");
                value2 = field2.val().split(",");
                var value = $.merge(value1, value2);
                value = value.filter(function (element, position) {
                    return element !== "" && value.indexOf(element) === position;
                });
                field1.val(value);
            } else {
                value1 = field1.select2("val");
                value2 = field2.select2("val");
                field1.select2("val", $.merge(value1, value2));
            }
        },

        autoNumberSections: function (currentItem) {
            if (!window.confirm(this.resources.autoNumberWarning)) {
                return;
            }

            var nextItem = currentItem.next();
            while (nextItem.is("*")) {
                this.view.setField($("." + NUMBER_CSS_CLASS, nextItem), this.increaseSectionNumber(nextItem.prev()));
                nextItem = nextItem.next();
            }
            Compozr.dirty(true);
        },

        autoCleanUpNumberSections: function (currentItem) {
            if (!window.confirm(this.resources.autoCleanupNumberWarning)) {
                return;
            }

            var found = false,
                nextItem = currentItem;
            while (nextItem.is("*")) {
                var numberField = $("." + NUMBER_CSS_CLASS, nextItem),
                    contentField = $("." + CONTENT_CSS_CLASS, nextItem),
                    number = this.view.loadField(numberField).trim(),
                    contentText = this.view.loadField(contentField),
                    content = this.view.loadField(contentField, true),
                    regexp = new RegExp("^" + number + "([.]|\\s)+");
                if (number !== "" && regexp.test(contentText)) {
                    found = true;
                    regexp = new RegExp("^" + number + "([.]|\\s|&nbsp;)+");
                    content = content.replace(regexp, "").trim();
                    while (content.indexOf("&nbsp;") === 0) {
                        content = content.substr("&nbsp;".length).trim();
                    }
                    this.view.setField(contentField, content);
                }
                nextItem = nextItem.next();
            }
            if (found) {
                Compozr.dirty(true);
            }
        },

        insertSectionAbove: function (currentItem) {
            var newItem = this.view.createNewSection();
            currentItem.before(newItem);
            this.finishInsertSection(newItem);
        },

        insertSectionBelow: function (currentItem) {
            if (currentItem.is(":last")) {
                this.newSection();
            } else {
                var newItem = this.view.createNewSection();
                currentItem.after(newItem);
                this.finishInsertSection(newItem);
            }
        },

        assignElements: function () {
            this.assignElementsLock++;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.assignElementsProgress);
            }
            this._super();

            var that = this;
            Compozr.queueTask("setSections",
                function () {
                    that.view.setSections(that.model.Sections);
                },
                function () {
                    return that.view.assignElementsLock === 0;
                }
            );
            Compozr.queueTask("finishAssignElements",
                function () {
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    that.assignElementsLock--;
                },
                function () {
                    return that.view.setSectionsLock === 0;
                }
            );
        },

        enableElementsEditability: function (fromCompactMode) {
            this.enableElementsEditabilityLock++;
            if (!fromCompactMode) {
                this._super();
            }

            var that = this;
            this.enableSectionsEditabilityAsync($(">li", this.view.sections), function () {
                that.enableElementsEditabilityLock--;
            }, fromCompactMode);
        },

        disableElementsEditability: function (toCompactMode) {
            this.disableElementsEditabilityLock++;
            if (!toCompactMode) {
                this._super();
            }

            var that = this;
            this.disableSectionsEditabilityAsync($(">li", this.view.sections), function () {
                that.disableElementsEditabilityLock--;
            }, toCompactMode);
        },

        enableSectionsEditabilityAsync: function (sections, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);

            if (!fromCompactMode) {
                var editables = $("." + NUMBER_CSS_CLASS, currentSections).add($("." + CONTENT_CSS_CLASS, currentSections));
                editables.attr(Compozr.CONTENTEDITABLE, "true")
                         .not("." + CONTENT_CSS_CLASS)
                         .attr(Compozr.SINGLE_LINE, "")
                         .attr(Compozr.NO_HTML, "")
                         .attr(Compozr.SELECT_ON_FOCUS, "");
            }

            if (!this.view.isCompactMode()) {
                var tags = $("." + TAGS_CSS_CLASS, currentSections);
                Compozr.includeAllInputs(tags.children("input"));
                tags.children("input").select2({
                    width: "100%",
                    placeholder: "[" + this.resources.tags + "]",
                    multiple: true,
                    query: function (query) {
                        Compozr.getJSON(that.options.searchSectionTagsUrl, {
                            data: { term: query.term },
                            onSuccess: function (data/*, textStatus, jqXHR*/) {
                                $.each(data.models, function (index, value) {
                                    data.models[index] = {
                                        id: value.Key,
                                        text: value.Text
                                    };
                                });
                                query.callback({ results: data.models });
                            },
                        });
                    },
                    initSelection: function (element, callback) {
                        var keys = $(element).val();
                        if (keys !== "") {
                            Compozr.getJSON(that.options.findSectionTagsUrl, {
                                data: { keys: keys },
                                onSuccess: function (data/*, textStatus, jqXHR*/) {
                                    $.each(data.models, function (index, value) {
                                        data.models[index] = {
                                            id: value.Key,
                                            text: value.Text
                                        };
                                    });
                                    callback(data.models);
                                }
                            });
                        }
                    }
                }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.fixSizeViewport();
                    $(this).closest("li").find("." + CLEARFIX_CSS_CLASS).append(that.view.toolbox.show());
                    that.view.refreshToolbox();
                }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.restoreViewport();
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.enableElementsEditabilityProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.enableSectionsEditabilityAsync(nextSections, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        disableSectionsEditabilityAsync: function (sections, done, toCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);

            if (!toCompactMode) {
                var editables = $("." + NUMBER_CSS_CLASS, currentSections).add($("." + CONTENT_CSS_CLASS, currentSections));
                editables.removeAttr(Compozr.CONTENTEDITABLE);
            }

            if (!this.view.isCompactMode()) {
                var tags = $("." + TAGS_CSS_CLASS, currentSections);
                $.each(tags.children("input").off(DEFAULT_EVENT_DOMAIN), function (index, value) {
                    $(value).select2("destroy")
                            .removeAttr("style");
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.disableElementsEditabilityProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.disableSectionsEditabilityAsync(nextSections, done, toCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        finishInsertSection: function (newItem) {
            this.view.assignSectionsElements(newItem);
            this.view.prepareSectionsEditor(newItem);
            this.enableSectionsEditabilityAsync(newItem, function () { }, false);
            Compozr.attachEditorEvents(newItem);
            $("." + CONTENT_CSS_CLASS, newItem).focus();
            Compozr.dirty(true);
        },

        increaseSectionNumber: function (item) {
            var itemNumber = this.view.loadField($("." + NUMBER_CSS_CLASS, item)),
                dotIndex = itemNumber.lastIndexOf(".") + 1,
                lastFactor = parseInt(itemNumber.substr(dotIndex));
            if (isNaN(lastFactor)) {
                return itemNumber;
            } else {
                return itemNumber.substr(0, dotIndex) + (lastFactor + 1);
            }
        }
    });

})();

(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.Resources = GG.PageCompozr.Resources
        .extend(GG.PageCompozr.PageImages.Resources)
        .extend(GG.PageCompozr.MultiPage.Resources)
        .extend({
            themeColor: null,
            priority: null,
            name: null,
            urlFriendlyName: null,
            urlFriendlyNameDescription: null,
            description: null,
            uploadCoverImage: null
        });

})();

(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    var DEFAULT_EVENT_DOMAIN = ".gallery";

    GG.Gallery.Index = GG.Class.extend({
        options: {
            newAlbumUrl: null
        },

        init: function (options) {
            this.options = $.extend(this.options, options);

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewAlbum();
            });
        },
        
        onNewAlbum: function () {
            Compozr.postNew(this.options.newAlbumUrl, Compozr.menu.NewAlbum);
        },

        initMenu: function () {
            Compozr.menu.NewAlbum.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();

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

(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.SlidesAlbumView = GG.Gallery.AlbumViewBase
        .extend({
            imagesIndicatorTemplate: null,
            imagesItemTemplate: null,

            init: function (container, options, resources) {
                this._super(container, options, resources);

                this.images = $("#images", this.page);
                this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.images);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                this.imagesIndicatorTemplate = $("template.images-indicator", Compozr.container).html();
                this.imagesItemTemplate = $("template.images-item", Compozr.container).html();

                this.assignElementsLock--;
            },

            preparePageEditor: function (turnOffContentHtml) {
                this.prepareDocEditorLock++;
                this._super(turnOffContentHtml);

                var that = this;
                $Compozr.on("inputchange" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function (e, data) {
                    if ($(data).is(that.themeColor)) {
                        if (that.themeColor.text() === "") {
                            that.name.css("color", "");
                            $(".carousel-control", that.images).css("color", "");
                        } else {
                            that.name.css("color", that.themeColor.html());
                            $(".carousel-control", that.images).css("color", that.themeColor.html());
                        }
                    }
                });

                this.prepareDocEditorLock--;
            },

            cleanupPageEditor: function (turnOnContentHtml) {
                this.cleanupDocEditorLock++;
                this._super(turnOnContentHtml);

                $Compozr.off("inputchange" + GG.Gallery.DEFAULT_EVENT_DOMAIN);

                this.cleanupDocEditorLock--;
            },

            populateImages: function (items) {
                var that = this,
                    indicators = $(".carousel-indicators", that.images).html(""),
                    inner = $(".carousel-inner", that.images).html("");

                $.each(items, function (index, value) {
                    var indicator = $(that.imagesIndicatorTemplate);
                    indicator.attr("data-slide-to", index);
                    if (index === 0) {
                        indicator.addClass("active");
                    }
                    $("span", indicator).css("background-image", "url(" + value.thumbUrl + ")");
                    indicators.append(indicator)
                              .append(" ");

                    var item = $(that.imagesItemTemplate);
                    $("img", item).attr("src", value.url);
                    if (index === 0) {
                        item.addClass("active");
                    }
                    inner.append(item);
                });

                if (items.length > 0) {
                    that.images.show()
                               .carousel()
                               .data("gg.autoCarouselHeight").init();
                }
            }
        });

})();

(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.PhotostreamAlbumView = GG.Gallery.AlbumViewBase
        .extend({
            imagesItemTemplate: null,

            init: function (container, options, resources) {
                this._super(container, options, resources);

                this.images = $(".images", this.page);
                this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.images);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                this.imagesItemTemplate = $("template.images-item", Compozr.container).html();

                this.assignElementsLock--;
            },

            populateImages: function (items) {
                var that = this;

                $("img[src]", this.images).remove();
                $.each(items, function (index, value) {
                    var item = $(that.imagesItemTemplate),
                        name = value.fileName.substring(0, value.fileName.lastIndexOf("."));
                    item.attr({
                        "src": value.url,
                        "data-name": name,
                        "data-width": value.width,
                        "data-height": value.height
                    });
                    that.images.append(item);
                });

                if (items.length > 0) {
                    that.images.show();
                    $(window).resize();
                    $("img[src]", this.images).on("load", function () {
                        $(window).resize();
                    });
                }
            }
        });

})();

(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    var _htmlEditorToolbar = new Compozr.HtmlEditorToolbar(); // IntelliSense support only actuall toolbar will be created later

    GG.Gallery.AlbumModel = GG.PageCompozr.PageModel
        .extend(GG.PageCompozr.MultiPage.PageModel)
        .extend({
            Priority: null,
            ThemeColor: null,
            Name: null,
            UrlFriendlyName: null
        });

    GG.Gallery.AlbumControllerOptions = GG.PageCompozr.PageModel
        .extend(GG.PageCompozr.MultiPage.PageControllerOptions);

    GG.Gallery.AlbumController = GG.PageCompozr.PageController
        .extend(GG.PageCompozr.PageImages.PageController)
        .extend(GG.PageCompozr.MultiPage.PageController)
        .extend({
            view: new GG.Gallery.AlbumViewBase(),
            options: new GG.Gallery.AlbumControllerOptions(),
            model: new GG.Gallery.AlbumModel(),
            resources: new GG.Gallery.Resources(),

            init: function (view, options, viewModel, resources) {
                this._super(view, options, viewModel, resources);

                this.view.options.coverImageListUrl += "/" + this.model.Id;
                this.view.options.uploadCoverImageUrl += "/" + this.model.Id;
                this.view.options.renameCoverImageUrl += "/" + this.model.Id;
                this.view.options.deleteCoverImageUrl += "/" + this.model.Id;

                var that = this;

                $Compozr.on("init" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function (event, data) {
                    _htmlEditorToolbar = new Compozr.HtmlEditorToolbar(Compozr.container, {
                        pasteDescription: "paste"
                    });
                    _htmlEditorToolbar.hide();
                });

                $Compozr.on("save" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function (event, data) {
                    data.ThemeColor = data.ThmeColorHtml;
                    data.Name = data["Localizations[0].Name"];
                    data.UrlFriendlyName = data["Localizations[0].UrlFriendlyName"];
                    data.Description = data["Localizations[0].Description"];
                    delete data.ThmeColorHtml;
                    delete data["Localizations[0].Name"];
                    delete data["Localizations[0].UrlFriendlyName"];
                    delete data["Localizations[0].Description"];

                    if (data.UrlFriendlyName !== that.model.UrlFriendlyName) {
                        Compozr.cancelTask("redirectByUrlFriendlyName");
                        Compozr.queueTask("redirectByUrlFriendlyName",
                            function () { // action
                                Compozr.dirty(false);
                                window.location = that.options.pageUrl + "/" + data.UrlFriendlyName;
                            },
                            function () { // condition
                                return !Compozr.menu.TogglePage.data("jqXHR");
                            }
                        );
                    }
                });
            },

            switchToEditMode: function(){
                _htmlEditorToolbar.show();
                this._super();
            },

            switchToPreviewMode: function () {
                _htmlEditorToolbar.hide();
                this._super();
                var that = this;
                Compozr.queueTask("finishSwitchToPreviewMode",
                    function () { // action
                        that.view.updateImages();
                    },
                    function () { // condition
                        return that.view.cleanupPageEditorLock === 0;
                    }
                );
            },

            backupInitialData: function () {
                this._super();
                this.model = $.extend(this.model, {
                    Name: this.view.name.html(),
                    Description: this.view.description.html()
                });
            },

            restoreData: function () {
                this._super();
                this.view.priority.html(this.model.Priority);
                this.view.themeColor.html(this.model.ThemeColor);
                this.view.name.html(this.model.Name);
                this.view.urlFriendlyName.html(this.model.UrlFriendlyName);
                this.view.description.html(this.model.Description);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                var that = this;
                Compozr.queueTask("finishAssignElements",
                    function () {
                        that.view.priority.html(that.model.Priority);
                        that.view.themeColor.html(that.model.ThemeColor);
                        that.view.urlFriendlyName.html(that.model.UrlFriendlyName);

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

                var editables = this.view.priority.add(this.view.themeColor)
                                                  .add(this.view.nameEditor)
                                                  .add(this.view.urlFriendlyName)
                                                  .add(this.view.description);
                editables.attr(Compozr.CONTENTEDITABLE, "true")
                         .not(this.view.description)
                         .attr(Compozr.SINGLE_LINE, "")
                         .attr(Compozr.NO_HTML, "")
                         .attr(Compozr.SELECT_ON_FOCUS, "");
                this.view.urlFriendlyName.attr(Compozr.URL_FRIENDLY, "");

                if (this.options.editMode) {
                    this.view.description.attr(Compozr.SELECT_ON_FIRST_FOCUS, "");
                }

                this.enableElementsEditabilityLock--;
            },

            disableElementsEditability: function () {
                this.disableElementsEditabilityLock++;
                this._super();

                var editables = this.view.priority.add(this.view.themeColor)
                                                  .add(this.view.nameEditor)
                                                  .add(this.view.urlFriendlyName)
                                                  .add(this.view.description);
                editables.removeAttr(Compozr.CONTENTEDITABLE);

                this.disableElementsEditabilityLock--;
            }
        });

})();
