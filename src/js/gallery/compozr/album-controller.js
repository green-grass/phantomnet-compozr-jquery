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
