(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.PageImages");

    GG.PageCompozr.PageImages.PageController = {
        view: GG.PageCompozr.PageImages.PageView, // must be overriden
        resources: GG.PageCompozr.PageImages.Resources, // must be overriden

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            if (this.model.Id !== undefined && this.model.Id !== null) {
                this.view.options.imageListUrl += "/" + this.model.Id;
                this.view.options.uploadImageUrl += "/" + this.model.Id;
                this.view.options.renameImageUrl += "/" + this.model.Id;
                this.view.options.deleteImageUrl += "/" + this.model.Id;
            }
        }
    };

})();
