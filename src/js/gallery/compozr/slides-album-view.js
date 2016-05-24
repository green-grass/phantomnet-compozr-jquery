(function () {

    "use strict";

    GG.namespace("GG.Gallery");

    GG.Gallery.SlidesAlbumView = GG.Gallery.AlbumViewBase
        .extend({
            imagesIndicatorTemplate: null,
            imagesItemTemplate: null,

            init: function (container, options, resources) {
                this._super(container, options, resources);

                this.images = $("#images", this.page);
                this.hiddenOnEditMode = this.hiddenOnEditMode.add(this.images);
            },

            assignElements: function () {
                this.assignElementsLock++;
                this._super();

                this.imagesIndicatorTemplate = $("template.images-indicator", Compozr.container).html();
                this.imagesItemTemplate = $("template.images-item", Compozr.container).html();

                this.assignElementsLock--;
            },

            preparePageEditor: function (turnOffContentHtml) {
                this.prepareDocEditorLock++;
                this._super(turnOffContentHtml);

                var that = this;
                $Compozr.on("inputchange" + GG.Gallery.DEFAULT_EVENT_DOMAIN, function (e, data) {
                    if ($(data).is(that.themeColor)) {
                        if (that.themeColor.text() === "") {
                            that.name.css("color", "");
                            $(".carousel-control", that.images).css("color", "");
                        } else {
                            that.name.css("color", that.themeColor.html());
                            $(".carousel-control", that.images).css("color", that.themeColor.html());
                        }
                    }
                });

                this.prepareDocEditorLock--;
            },

            cleanupPageEditor: function (turnOnContentHtml) {
                this.cleanupDocEditorLock++;
                this._super(turnOnContentHtml);

                $Compozr.off("inputchange" + GG.Gallery.DEFAULT_EVENT_DOMAIN);

                this.cleanupDocEditorLock--;
            },

            populateImages: function (items) {
                var that = this,
                    indicators = $(".carousel-indicators", that.images).html(""),
                    inner = $(".carousel-inner", that.images).html("");

                $.each(items, function (index, value) {
                    var indicator = $(that.imagesIndicatorTemplate);
                    indicator.attr("data-slide-to", index);
                    if (index === 0) {
                        indicator.addClass("active");
                    }
                    $("span", indicator).css("background-image", "url(" + value.thumbUrl + ")");
                    indicators.append(indicator)
                              .append(" ");

                    var item = $(that.imagesItemTemplate);
                    $("img", item).attr("src", value.url);
                    if (index === 0) {
                        item.addClass("active");
                    }
                    inner.append(item);
                });

                if (items.length > 0) {
                    that.images.show()
                               .carousel()
                               .data("gg.autoCarouselHeight").init();
                }
            }
        });

})();
