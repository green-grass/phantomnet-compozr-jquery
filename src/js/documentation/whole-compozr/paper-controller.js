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
