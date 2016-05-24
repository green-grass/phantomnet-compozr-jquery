(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.PhotostreamAlbumView = GG.Gallery.AlbumViewBase
        .extend({
            imagesItemTemplate: null,

            init: function (container, options, resources) {
                this._super(container, options, resources);

                this.images = $(".images", this.page);
                this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.images);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                this.imagesItemTemplate = $("template.images-item", Compozr.container).html();

                this.assignElementsLock--;
            },

            populateImages: function (items) {
                var that = this;

                $("img[src]", this.images).remove();
                $.each(items, function (index, value) {
                    var item = $(that.imagesItemTemplate),
                        name = value.fileName.substring(0, value.fileName.lastIndexOf("."));
                    item.attr({
                        "src": value.url,
                        "data-name": name,
                        "data-width": value.width,
                        "data-height": value.height
                    });
                    that.images.append(item);
                });

                if (items.length > 0) {
                    that.images.show();
                    $(window).resize();
                    $("img[src]", this.images).on("load", function () {
                        $(window).resize();
                    });
                }
            }
        });

})();
