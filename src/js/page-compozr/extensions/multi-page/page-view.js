(function () {

    "use strict";

    GG.namespace("GG.PageCompozr.MultiPage");

    GG.PageCompozr.MultiPage = $.extend(GG.PageCompozr.MultiPage, {
        DEFAULT_EVENT_DOMAIN: ".page-compozr-multi-page"
    });

    GG.PageCompozr.MultiPage.PageView = {
        resources: GG.PageCompozr.MultiPage.Resources, // must be overriden
    };

})();
