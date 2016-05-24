(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.Category = GG.Class.extend({
        options: {
            newDocUrl: null
        },
        model: {
            Id: null
        },

        init: function (options, viewModel) {
            this.options = $.extend(this.options, options);
            this.model = $.extend(this.model, {
                Id: viewModel.Id
            });

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
        },
        
        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc, { categoryId: this.model.Id });
        },

        initMenu: function () {
            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();
