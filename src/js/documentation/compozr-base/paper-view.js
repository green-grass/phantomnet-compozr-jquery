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
