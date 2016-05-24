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
