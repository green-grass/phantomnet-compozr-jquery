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
