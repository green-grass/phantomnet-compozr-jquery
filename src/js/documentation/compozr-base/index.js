(function () {

    "use strict";

    GG.namespace("GG.Documentation.Base");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Documentation.Base.Index = GG.Class.extend({
        options: {
            newDocUrl: null
        },

        init: function (options) {
            this.options = $.extend(this.options, options);

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewDoc();
            });
        },
        
        onNewDoc: function () {
            Compozr.postNew(this.options.newDocUrl, Compozr.menu.NewDoc);
        },

        initMenu: function () {
            Compozr.menu.NewDoc.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();
