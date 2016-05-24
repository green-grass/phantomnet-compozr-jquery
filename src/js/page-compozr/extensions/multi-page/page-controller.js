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
