(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var EXTRA_INFO_CSS_CLASS = "extra-info",
        CLEARFIX_CSS_CLASS = "clearfix",
        PUBLISH_DATE_COLUMN_CSS_CLASS = "col-sm-4 col-md-3 col-lg-2",
        CATEGORY_ID_COLUMN_CSS_CLASS = "col-sm-8 col-md-3",
        COLUMN_BREAK_CSS_CLASS = "clearfix visible-sm",
        AUTHOR_COLUMN_CSS_CLASS = "col-sm-4 col-md-3",
        SOURCE_URL_COLUMN_CSS_CLASS = "col-sm-8 col-md-3 col-lg-4",
        ACTIVE_CATEGORY_CSS_CLASS = "active",
        DATE_TIME_INPUT_TEMPLATE = "<div class=\"input-group date\"><input type=\"text\" class=\"form-control\" /><span class=\"input-group-addon\"><span class=\"glyphicon glyphicon-calendar\"></span></span></div>";

    GG.Blog.ArticleViewOptions = GG.DocCompozr.DocViewOptions.extend({
        categoryUrl: null,
        findBloggerUrl: null,
        bloggerUrl: null
    });

    GG.Blog.ArticleView = GG.DocCompozr.DocView.extend({
        options: new GG.Blog.ArticleViewOptions(),
        resources: new GG.Blog.Resources(),

        categoryId: $(),
        publishDate: $(),
        author: $(),
        sourceUrl: $(),
        shortContent: $(),
        content: $(),

        headerDisplay: $(),
        breadcrumbs: $(),
        categories: $(),

        init: function (container, options, resources) {
            this._super(container, options, resources);
            this.shortContent = $(".short-content", this.doc);
            this.content = $(".content", this.doc);
            this.headerDisplay = $("header small", this.doc);
            this.breadcrumbs = $(".breadcrumbs", this.container);
            this.categories = $(".categories", this.container);
            this.hiddenOnEditMode = this.hiddenOnEditMode.add($(".social-network", this.container))
                                                         .add(this.breadcrumbs)
                                                         .add(this.categories);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var extraInfo, list;
            this.headerDisplay.after(extraInfo = $("<div></div>").hide()
                                                                 .addClass(EXTRA_INFO_CSS_CLASS)
                                                                 .append(list = $("<ul></ul>").addClass(CLEARFIX_CSS_CLASS)));
            list.append($("<li></li>").addClass(PUBLISH_DATE_COLUMN_CSS_CLASS).append(this.publishDate = $(DATE_TIME_INPUT_TEMPLATE).find("input").attr("placeholder", this.resources.publishDate).end()));
            list.append($("<li></li>").addClass(CATEGORY_ID_COLUMN_CSS_CLASS).append(this.categoryId = $("<input type=\"hidden\" />")));
            this.categoryId.after($("<span></span>").html(this.resources.categoryDescription));
            list.append($("<li></li>").addClass(COLUMN_BREAK_CSS_CLASS));
            list.append($("<li></li>").addClass(AUTHOR_COLUMN_CSS_CLASS).append(this.author = $("<div></div>")));
            list.append($("<li></li>").addClass(SOURCE_URL_COLUMN_CSS_CLASS).append(this.sourceUrl = $("<div></div>")));
            this.extraInfo = this.extraInfo.add(extraInfo);

            this.assignElementsLock--;
        },

        prepareDocEditor: function (turnOffContentHtml) {
            this.prepareDocEditorLock++;
            this._super();

            this.initPlaceHolder(this.author, this.resources.author, false, true);
            this.initPlaceHolder(this.sourceUrl, this.resources.sourceUrl, false, true);
            this.initPlaceHolder(this.shortContent, this.resources.shortContent, true, false);
            this.initPlaceHolder(this.content, this.resources.content, false, false);
            this.shortContent.add(this.content).css("min-height", "200px");
            this.shortContent.html(turnOffContentHtml(this.shortContent.html()));
            this.content.html(turnOffContentHtml(this.content.html()));

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function (turnOnContentHtml) {
            this.cleanupDocEditorLock++;
            this._super();

            this.destroyPlaceHolder(this.author, true);
            this.destroyPlaceHolder(this.sourceUrl, true);
            this.destroyPlaceHolder(this.shortContent, false);
            this.destroyPlaceHolder(this.content, false);
            this.shortContent.html(turnOnContentHtml(this.shortContent.html()));
            this.content.html(turnOnContentHtml(this.content.html()));

            this.cleanupDocEditorLock--;
        },

        loadDocModel: function () {
            var ret = this._super();
            return $.extend(ret, {
                CategoryId: this.categoryId.val(),
                PublishDate: this.publishDate.find("input").val(),
                Author: this.loadField(this.author),
                SourceUrl: this.loadField(this.sourceUrl),
                ShortContent: this.loadField(this.shortContent, true),
                Content: this.loadField(this.content, true)
            });
        },

        updateHeaderDisplay: function () {
            var that = this,
                category = this.categoryId.select2("data"),
                publishDateValue = this.publishDate.find("input").val(),
                displayPulishDate = publishDateValue.substring(0, publishDateValue.indexOf(" ")),
                author = this.loadField(this.author),
                sourceUrl = this.loadField(this.sourceUrl),
                bloggerPenName = null,
                bloggerUrlFriendlyPenName = null,
                bloggerAvatarThumbnailImage = null;

            if (author !== "" && sourceUrl === "") {
                this.headerDisplay.data("jqXHR", Compozr.getJSON(this.options.findBloggerUrl, {
                    data: { penName: author },
                    onSuccess: function (data, textStatus, jqXHR) {
                        if (jqXHR !== that.headerDisplay.data("jqXHR")) {
                            return;
                        }

                        bloggerPenName = data.model.PenName;
                        bloggerUrlFriendlyPenName = data.model.UrlFriendlyPenName;
                        bloggerAvatarThumbnailImage = data.model.AvatarThumbnailImage;
                    },
                    onComplete: function (jqXHR, textStatus) {
                        if (jqXHR === that.headerDisplay.data("jqXHR")) {
                            that.headerDisplay.removeData("jqXHR");
                        }
                    }
                }));
            } else {
                this.headerDisplay.removeData("jqXHR");
            }

            Compozr.cancelTask("updateHeaderDisplay");
            Compozr.queueTask("updateHeaderDisplay",
                function () { // action
                    var container = $("<div></div>");

                    // Author, SourceUrl
                    if (author !== "") {
                        if (sourceUrl === "") {
                            if (bloggerPenName === null) {
                                container.append($("<span></span>").html(author));
                            } else {
                                var link = that.options.bloggerUrl + "/" + bloggerUrlFriendlyPenName;
                                if (bloggerAvatarThumbnailImage !== null) {
                                    container.append($("<a></a>").addClass("avatar thumb")
                                                                 .attr("href", link)
                                                                 .attr("title", bloggerPenName)
                                                                 .append($("<img />").attr("src", bloggerAvatarThumbnailImage)
                                                                                     .attr("alt", bloggerPenName)));
                                }
                                container.append($("<a></a>").attr("href", link)
                                                             .html(bloggerPenName));
                            }
                        } else {
                            container.append($("<a></a>").attr("href", sourceUrl)
                                                         .attr("target", "_blank")
                                                         .attr("rel", "nofollow")
                                                         .html(author));
                        }
                        container.append(", ");
                    }

                    // Avatar
                    that.title.prev().remove();
                    var avatar = $("a.avatar", container);
                    if (avatar.is("*")) {
                        that.title.before(avatar.clone());
                    }

                    // PublishDate
                    container.append($("<time />").attr("datetime", publishDateValue)
                                                  .attr("pubdate", "")
                                                  .html(displayPulishDate));

                    // Category
                    if (category !== null && category.enabled) {
                        container.append(" | ");
                        container.append($("<a></a>").attr("href", that.options.categoryUrl + "/" + category.urlFriendlyName)
                                                     .html(category.name));
                    }

                    that.headerDisplay.html(container.html());
                },
                function () { // condition
                    return !that.headerDisplay.data("jqXHR");
                }
            );
        },

        updateBreadcrumbsCategories: function () {
            var container = $("<div></div>"),
                categoryLink = $("a[href^='" + this.options.categoryUrl + "']", this.headerDisplay),
                hasCategory = categoryLink.is("*"),
                template = hasCategory ? this.resources.readingArticleWithCategory : this.resources.readingArticleWithoutCategory;
            categoryLink = hasCategory ? categoryLink : null;

            // Breadcrumbs
            container.append(this.breadcrumbs.children().first()); // aside heading
            template = template.replace("{0}", GG.outerHtml($("a", this.breadcrumbs).first().html((this.titleEditor.is("*") ? this.titleEditor : this.title).html())));
            if (hasCategory) {
                template = template.replace("{1}", GG.outerHtml(categoryLink));
            }
            container.append(template);
            this.breadcrumbs.html(container.html());

            // Categories
            $("li", this.categories).removeClass(ACTIVE_CATEGORY_CSS_CLASS);
            if (hasCategory) {
                $("a[href='" + categoryLink.attr("href") + "']", this.categories).closest("li").addClass(ACTIVE_CATEGORY_CSS_CLASS);
            }
        }
    });

})();
