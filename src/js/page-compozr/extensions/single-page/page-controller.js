(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.SinglePage");

    GG.PageCompozr.SinglePage = $.extend(GG.PageCompozr.SinglePage, {
        DEFAULT_EVENT_DOMAIN: ".page-compozr-single-page"
    });

    GG.PageCompozr.SinglePage.PageControllerOptions = {
        savePageUrl: null,
        previewAfterSave: true
    };

    GG.PageCompozr.SinglePage.PageController = {
        view: new GG.PageCompozr.PageView(), // must be overriden
        options: new (GG.PageCompozr.PageControllerOptions.extend(GG.PageCompozr.SinglePage.PageControllerOptions))(), // must be overriden
        model: new GG.PageCompozr.PageModel(), // must be overriden
        resources: new GG.PageCompozr.Resources(), // must be overriden

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            var that = this;

            $Compozr.on("saveDoc" + GG.PageCompozr.SinglePage.DEFAULT_EVENT_DOMAIN, function () {
                that.onSavePage();
            });
            $Compozr.on("revertDoc" + GG.PageCompozr.SinglePage.DEFAULT_EVENT_DOMAIN, function () {
                that.onRevertPage();
            });
        },

        onBeforeSavePage: function (model) {
        },

        onSavePage: function () {
            var model = this.view.loadPageModel();
            this.onBeforeSavePage(model);

            var that = this;
            Compozr.postSave(that.options.savePageUrl, Compozr.menu.Save.add(Compozr.menu.Revert), model, function () {
                if (that.isEditMode()) {
                    if (that.options.previewAfterSave) {
                        Compozr.menu.EditPage.click();
                    } else {
                        Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
                    }
                }
                Compozr.menuWithAlias.Save.prev().add(Compozr.menuWithAlias.Revert.prev()).hide();

                $Compozr.triggerHandler("save", model);

                that.model = $.extend(that.model, model);
            });
        },

        onRevertPage: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
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

        switchToEditMode: function () {
            this._super();
            Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
        },

        switchToPreviewMode: function () {
            this._super();
            if (!Compozr.dirty()) {
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).hide();
            }
        }
    };

})();
