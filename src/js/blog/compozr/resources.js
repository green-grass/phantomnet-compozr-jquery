(function () {

    "use strict";

    GG.namespace("GG.Blog");

    GG.Blog.Resources = GG.DocCompozr.Resources.extend({
        category: null,
        publishDate: null,
        author: null,
        sourceUrl: null,
        shortContent: null,
        content: null,

        categoryDescription: null,
        unnamedCategory: null,

        readingArticleWithoutCategory: null,
        readingArticleWithCategory: null
    });

})();
