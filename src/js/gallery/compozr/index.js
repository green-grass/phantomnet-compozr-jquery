(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    var DEFAULT_EVENT_DOMAIN = ".gallery";

    GG.Gallery.Index = GG.Class.extend({
        options: {
            newAlbumUrl: null
        },

        init: function (options) {
            this.options = $.extend(this.options, options);

            var that = this;
            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
            });
            $Compozr.on("newDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onNewAlbum();
            });
        },
        
        onNewAlbum: function () {
            Compozr.postNew(this.options.newAlbumUrl, Compozr.menu.NewAlbum);
        },

        initMenu: function () {
            Compozr.menu.NewAlbum.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                Compozr.newDoc();
            });
        }
    });

})();
