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
