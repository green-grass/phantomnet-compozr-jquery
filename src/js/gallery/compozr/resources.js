(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.Resources = GG.PageCompozr.Resources
        .extend(GG.PageCompozr.PageImages.Resources)
        .extend(GG.PageCompozr.MultiPage.Resources)
        .extend({
            themeColor: null,
            priority: null,
            name: null,
            urlFriendlyName: null,
            urlFriendlyNameDescription: null,
            description: null,
            uploadCoverImage: null
        });

})();
