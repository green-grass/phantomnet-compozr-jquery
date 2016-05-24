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
