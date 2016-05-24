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
