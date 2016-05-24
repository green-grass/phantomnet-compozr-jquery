(function () {

    "use strict";

    GG.namespace("GG.Blog");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr";

    GG.Blog.Categories = GG.Class.extend({
        container: $(),
        resources: new GG.Blog.Resources(),

        form: $(),
        categories: $(),
        categoryTemplate: $(),

        init: function (container, resources) {
            this.container = $(container);
            this.resources = $.extend(this.resources, resources);

            this.form = $("form", this.container);

            var that = this;

            initGlobalEvents();

            $Compozr.on("init" + DEFAULT_EVENT_DOMAIN, function () {
                that.initMenu();
                that.assignElements();
                that.backupData();
                that.prepareEditor(that.categories);
                Compozr.menuWithAlias.Save.add(Compozr.menuWithAlias.Revert).show();
            });
            $Compozr.on("saveDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onSaveDoc();
            });
            $Compozr.on("revertDoc" + DEFAULT_EVENT_DOMAIN, function () {
                that.onRevertDoc();
            });

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 78:
                            case 110:
                                // Ctrl + N
                                e.preventDefault();
                                Compozr.menu.NewCategory.click();
                                break;
                        }
                    }
                });
            }
        },

        onSaveDoc: function () {
            if (this.form.valid()) {
                Compozr.dirty(false);
                $.each(this.categories, function (index, value) {
                    var category = $(value),
                        inputs = $("[name^='Categories[']", category);
                    $.each(inputs, function (inputIndex, inputValue) {
                        var input = $(inputValue),
                            name = input.attr("name");
                        input.attr("name", "Categories[" + index + name.substr(name.lastIndexOf("].")));
                    });
                });
                this.form.submit();
            }
        },

        onRevertDoc: function () {
            this.restoreData();
            this.assignElements();
            this.prepareEditor(this.categories);
        },

        backupData: function () {
            this.form.data("original", this.form.html());
        },

        restoreData: function () {
            this.form.html(this.form.data("original"));
        },

        newCategory: function () {
            var newCategory = $(this.categoryTemplate.html()),
                id = $("input[name$='.Id']", newCategory);
            id.val(parseInt(id.val(), 10) - 1);
            this.categoryTemplate.html(GG.outerHtml(newCategory));
            this.categories = this.categories.add(newCategory);
            this.form.append(newCategory);
            this.prepareEditor(newCategory);
            Compozr.attachEditorEvents(newCategory);
            Compozr.dirty(true);
            $("input[name$='.Name']", newCategory).focus();
        },

        deleteCategory: function (category) {
            var id = $("input[name$='.Id']", category).val();
            $("input[name$='.ParentId'][value=" + id + "]", this.categories).val("");
            this.categories = this.categories.not(category);
            category.remove();
            this.initParentDropdown(this.categories);
            Compozr.dirty(true);
        },

        initMenu: function () {
            var that = this;

            Compozr.menu.NewCategory.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.newCategory();
            });
        },

        initParentDropdown: function (categories) {
            var that = this,
                parentId = $("input[name$='.ParentId']", categories);

            parentId.select2("destroy")
                    .removeAttr("style")
                    .select2({
                        width: "100%",
                        placeholder: " ",
                        allowClear: true,
                        query: function (query) {
                            var currentId = $("input[name$='.Id']", $(this.element).closest("fieldset")).val();
                            query.callback({ results: that.getModels(currentId) });
                        },
                        initSelection: function (element, callback) {
                            var id = $(element).val();
                            if (id !== "") {
                                var value = that.findModel(id);
                                callback(value);
                            }
                        }
                    }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                        Compozr.fixSizeViewport();
                    }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                        Compozr.restoreViewport();
                    });
        },

        refreshParentDropdown: function (categories) {
            var parentIds = $("input[name$='.ParentId']", categories);
            $.each(parentIds, function (index, value) {
                $(value).data("select2").initSelection();
            });
        },

        prepareEditor: function (categories) {
            var that = this;

            Compozr.includeAllInputs(categories);

            this.initParentDropdown(categories);

            $("input", categories).off(DEFAULT_EVENT_DOMAIN);

            $("input[name$='.Name']", categories).on("keyup" + DEFAULT_EVENT_DOMAIN, function () {
                var $this = $(this),
                    name = $this.val(),
                    heading = $("h1", $this.closest("section")),
                    urlFriendlyName = $("input[name$='.UrlFriendlyName']", $this.closest("fieldset")),
                    originalUrlFriendlyName = urlFriendlyName.val();
                heading.text(name === "" ? that.resources.unnamedCategory : name);
                urlFriendlyName.val(GG.toUrlFriendly(name));
                if (urlFriendlyName.val() !== originalUrlFriendlyName) {
                    Compozr.dirty(true);
                }
            });

            $("input[name$='.Name']", categories).add($("input[name$='.UrlFriendlyName']", categories))
                .on("change" + DEFAULT_EVENT_DOMAIN, function () {
                    that.refreshParentDropdown(that.categories);
                });

            $("button", categories).on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.deleteCategory($(this).closest("section"));
            });
        },

        assignElements: function () {
            this.categoryTemplate = $("template", Compozr.container);
            this.categories = $("section", this.form);
        },

        getModels: function (currentId) {
            var that = this,
                ret = [];
            $.each(this.categories, function (index, value) {
                var id = $("input[name$='.Id']", value).val(),
                    name = $("input[name$='.Name']", value).val(),
                    urlFriendlyName = $("input[name$='.UrlFriendlyName']", value).val();
                if (!currentId || id !== currentId) {
                    var text;
                    if (name !== "" && urlFriendlyName !== "") {
                        text = name + " (" + urlFriendlyName + ")";
                    } else if (name !== "") {
                        text = name;
                    } else if (urlFriendlyName !== "") {
                        text = urlFriendlyName;
                    } else {
                        text = "[" + that.resources.unnamedCategory + "]";
                    }

                    ret.push({
                        id: id,
                        name: name,
                        urlFriendlyName: urlFriendlyName,
                        text: text
                    });
                }
            });
            return ret;
        },

        findModel: function (id) {
            var models = this.getModels(),
                ret = null;
            $.each(models, function (index, value) {
                if (value.id === id) {
                    ret = value;
                    return false;
                }
            });
            return ret;
        }
    });

})();
