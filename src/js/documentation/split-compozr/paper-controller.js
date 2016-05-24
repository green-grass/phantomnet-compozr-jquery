(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        COMPACT_CSS_CLASS = "compact",
        NUMBER_CSS_CLASS = "number",
        CONTENT_CSS_CLASS = "content",
        TAGS_CSS_CLASS = "tags",
        CLEARFIX_CSS_CLASS = "clearfix",
        SHOW_PROGRESS_BREAK_POINT = 10;

    GG.Documentation.Split.PaperModel = GG.Documentation.Base.PaperModel.extend({
        Sections: []
    });

    GG.Documentation.Split.PaperControllerOptions = GG.Documentation.Base.PaperControllerOptions.extend({
        compactModeAsDefault: false,
        findSectionTagsUrl: null,
        searchSectionTagsUrl: null
    });

    GG.Documentation.Split.PaperController = GG.Documentation.Base.PaperController.extend({
        view: new GG.Documentation.Split.PaperView(),
        options: new GG.Documentation.Split.PaperControllerOptions(),
        model: new GG.Documentation.Split.PaperModel(),
        resources: new GG.Documentation.Split.Resources(),

        init: function (view, options, viewModel, resources) {
            this._super(view, options, viewModel, resources);

            var that = this;

            $Compozr.on("autoSplitSection" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoSplitSection($(data));
            });

            $Compozr.on("mergeSectionWithAbove" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.mergeSectionWithAbove($(data));
            });

            $Compozr.on("mergeSectionWithBelow" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.mergeSectionWithBelow($(data));
            });

            $Compozr.on("autoNumberSections" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoNumberSections($(data));
            });

            $Compozr.on("autoCleanUpNumberSections" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.autoCleanUpNumberSections($(data));
            });

            $Compozr.on("insertSectionAbove" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.insertSectionAbove($(data));
            });

            $Compozr.on("insertSectionBelow" + DEFAULT_EVENT_DOMAIN, function (e, data) {
                that.insertSectionBelow($(data));
            });

            initGlobalEvents();

            function initGlobalEvents() {
                if (Modernizr.touch) { return; }
                $(document).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                    if (that.shortcutLock) { return; }
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) {
                        switch (e.which) {
                            case 69:
                            case 101:
                                // Ctrl + Shift + E
                                e.preventDefault();
                                $(":focus").blur();
                                var event = $.Event("click", { shiftKey: true });
                                Compozr.menu.EditDoc.trigger(event);
                                break;
                            case 78:
                            case 110:
                                // Ctrl + Shift + N
                                if (that.isEditMode()) {
                                    e.preventDefault();
                                    Compozr.menu.NewSection.click();
                                }
                                break;
                        }
                    }
                });
            }
        },

        onBeforeSaveDoc: function (doc) {
            var that = this;
            $.each(doc.Sections, function (index, value) {
                value.Content = $.trim(that.isEditMode() ? value.Content : that.turnOffContentHtml(value.Content));
            });
        },

        onRevertDoc: function () {
            this.view.sections.append(this.view.toolbox.hide());
            var sections = $(">li", this.view.sections);
            if (sections.length > this.model.Sections.length) {
                sections = sections.slice(this.model.Sections.length);
                sections.remove();
            }

            this._super();
        },

        initMenu: function () {
            this._super();

            var that = this;

            Compozr.menu.EditDoc.off("click" + DEFAULT_EVENT_DOMAIN);
            Compozr.menu.EditDoc.on("click" + DEFAULT_EVENT_DOMAIN, function (e) {
                if (e.shiftKey) {
                    that.toggleCompactMode();
                } else {
                    that.switchMode();
                }
            });

            Compozr.menuWithAlias.NewSection.hide();
            Compozr.menu.NewSection.on("click" + DEFAULT_EVENT_DOMAIN, function () {
                that.newSection();
            });
        },

        switchMode: function () {
            if (this.isEditMode()) {
                this.switchToPreviewMode();
            } else {
                this.switchToEditMode(this.options.compactModeAsDefault);
            }
        },

        switchToEditMode: function (compact) {
            compact = compact === true;
            if (compact) {
                this.view.doc.addClass(COMPACT_CSS_CLASS);
            }
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.prepareDocEditorProgress);
            }
            this._super();

            var that = this;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.queueTask("endProgress",
                    function () { // action
                        Compozr.endProgress();
                    },
                    function () { // condition
                        return that.enableElementsEditabilityLock === 0;
                    }
                );
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", compact ? this.resources.backToPreviewOrFull : this.resources.backToPreviewOrCompact);
            Compozr.menuWithAlias.NewSection.show();
        },

        switchToPreviewMode: function () {
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.disableElementsEditabilityProgress);
            }
            this._super();

            var that = this;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.queueTask("endProgress",
                    function () { // action
                        Compozr.endProgress();
                    },
                    function () { // condition
                        return that.view.cleanupDocEditorLock === 0;
                    }
                );
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.options.compactModeAsDefault ? this.resources.editOrFull : this.resources.editOrCompact);
            Compozr.menuWithAlias.NewSection.hide();
        },

        toggleCompactMode: function () {
            if (this.isEditMode()) {
                if (this.view.isCompactMode()) {
                    this.switchToFullMode();
                } else {
                    this.switchToCompactMode();
                }
            } else {
                this.switchToEditMode(!this.options.compactModeAsDefault);
            }
        },

        switchToFullMode: function () {
            if (!this.isEditMode()) {
                return;
            }

            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.enableElementsEditabilityProgress);
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.backToPreviewOrCompact);

            this.view.prepareDocFullMode();

            Compozr.queueTask("enableElementsEditability",
                function () { // action
                    that.enableElementsEditability();
                },
                function () { // condition
                    return that.view.prepareDocEditorLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToFullMode",
                function () { // action
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                },
                function () { // condition
                    return that.enableElementsEditabilityLock === 0;
                }
            );
        },

        switchToCompactMode: function () {
            if (!this.isEditMode()) {
                return;
            }

            var that = this;

            this.shortcutLock = true;
            Compozr.fadeOut();
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.disableElementsEditabilityProgress);
            }
            $("[title]", Compozr.menuWithAlias.EditDoc).attr("title", this.resources.backToPreviewOrFull);

            this.disableElementsEditability(true);

            Compozr.queueTask("cleanupDocFullMode",
                function () { // action
                    that.view.cleanupDocFullMode();
                },
                function () { // condition
                    return that.disableElementsEditabilityLock === 0;
                }
            );

            Compozr.queueTask("finishSwitchToCompactMode",
                function () { // action
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    Compozr.fadeIn();
                    that.shortcutLock = false;
                },
                function () { // condition
                    return that.view.cleanupDocEditorLock === 0;
                }
            );

        },

        backupData: function () {
            this._super();

            var that = this,
                sections = $(">li", this.view.sections);
            $.each(sections, function (index, value) {
                that.model.Sections[index] = $.extend(that.model.Sections[index], {
                    Number: $("." + NUMBER_CSS_CLASS, value).html(),
                    Content: $("." + CONTENT_CSS_CLASS, value).html()
                });
            });
        },

        restoreData: function () {
            this._super();

            var that = this,
                sections = $(">li", this.view.sections),
                emptySection = this.view.createNewSection();
            this.view.assignSectionsElements(emptySection);
            while (sections.length < this.model.Sections.length) {
                var newSection = emptySection.clone();
                sections.append(newSection);
                sections = sections.add(newSection);
            }
            $.each(sections, function (index, value) {
                $("." + NUMBER_CSS_CLASS, value).html(that.model.Sections[index].Number);
                $("." + CONTENT_CSS_CLASS, value).html(that.model.Sections[index].Content);
                that.view.setSection(value, that.model.Sections[index]);
                $(value).show();
            });
            this.view.checkHasNumbers();
        },

        newSection: function () {
            var newItem = this.view.createNewSection(),
                lastItem = this.view.sections.children().last();
            this.view.sections.append(newItem);
            if (lastItem.is("*")) {
                $("." + NUMBER_CSS_CLASS, newItem).html(this.increaseSectionNumber(lastItem));
            }
            this.finishInsertSection(newItem);
        },

        autoSplitSection: function (currentItem) {
            if (!window.confirm(this.resources.autoSplitWarning)) {
                return;
            }

            var that = this,
                paragraphs = GG.textWithLineBreaks(this.view.loadField($("." + CONTENT_CSS_CLASS, currentItem), true)).split("\n");
            this.shortcutLock = true;
            Compozr.fadeOut();
            if (paragraphs.length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, paragraphs.length * 3, this.resources.autoSplitSectionProgress);
            }
            this.autoSplitSectionAsync(paragraphs.slice(0), currentItem, currentItem, false, function (found) {
                if (found) {
                    that.view.sections.append(that.view.toolbox.hide());
                    currentItem.remove();
                    Compozr.dirty(true);
                }
                if (paragraphs.length > SHOW_PROGRESS_BREAK_POINT) {
                    Compozr.endProgress();
                }
                Compozr.fadeIn();
                that.shortcutLock = false;
            });
        },

        autoSplitSectionAsync: function (paragraphs, currentItem, previousItem, found, done) {
            var that = this,
                currentParagraphs = paragraphs.splice(0, SHOW_PROGRESS_BREAK_POINT);
            $.each(currentParagraphs, function (index, value) {
                if (value.trim() !== "") {
                    found = true;
                    var newItem = that.view.createNewSection();
                    previousItem.after(newItem);
                    $("." + NUMBER_CSS_CLASS, newItem).html(newItem.is(currentItem.next()) ? that.view.loadField($("." + NUMBER_CSS_CLASS, currentItem)) : that.increaseSectionNumber(previousItem));
                    $("." + CONTENT_CSS_CLASS, newItem).html(value.trim());
                    that.view.assignSectionsElements(newItem);
                    that.view.prepareSectionsEditor(newItem);
                    that.enableSectionsEditabilityAsync(newItem, function () { }, false);
                    Compozr.attachEditorEvents(newItem);
                    previousItem = newItem;
                    Compozr.increaseProgress(0, that.resources.autoSplitSectionProgress);
                } else {
                    Compozr.increaseProgress(3, that.resources.autoSplitSectionProgress);
                }
            });
            if (paragraphs.length > 0) {
                window.setTimeout(function () {
                    that.autoSplitSectionAsync(paragraphs, currentItem, previousItem, found, done);
                }, 10);
            } else {
                done(found);
            }
        },

        mergeSectionWithAbove: function (currentItem) {
            var previousItem = currentItem.prev();
            if (previousItem.is("*")) {
                this.mergeSections(previousItem, currentItem);
            }
        },

        mergeSectionWithBelow: function (currentItem) {
            var nextItem = currentItem.next();
            if (nextItem.is("*")) {
                this.mergeSections(currentItem, nextItem);
            }
        },

        mergeSections: function (item1, item2) {
            var content1 = this.view.loadField($("." + CONTENT_CSS_CLASS, item1), true),
                content2 = this.view.loadField($("." + CONTENT_CSS_CLASS, item2), true),
                tags1 = $("." + TAGS_CSS_CLASS, item1).children("input"),
                tags2 = $("." + TAGS_CSS_CLASS, item2).children("input");
            this.view.setField($("." + CONTENT_CSS_CLASS, item1), content1 + "<br />" + content2);
            this.mergeMultiSelectFields(tags1, tags2);
            item2.remove();
            $("." + CONTENT_CSS_CLASS, item1).focus();
            Compozr.dirty(true);
        },

        mergeMultiSelectFields: function (field1, field2) {
            var value1, value2;
            if (this.view.isCompactMode()) {
                value1 = field1.val().split(",");
                value2 = field2.val().split(",");
                var value = $.merge(value1, value2);
                value = value.filter(function (element, position) {
                    return element !== "" && value.indexOf(element) === position;
                });
                field1.val(value);
            } else {
                value1 = field1.select2("val");
                value2 = field2.select2("val");
                field1.select2("val", $.merge(value1, value2));
            }
        },

        autoNumberSections: function (currentItem) {
            if (!window.confirm(this.resources.autoNumberWarning)) {
                return;
            }

            var nextItem = currentItem.next();
            while (nextItem.is("*")) {
                this.view.setField($("." + NUMBER_CSS_CLASS, nextItem), this.increaseSectionNumber(nextItem.prev()));
                nextItem = nextItem.next();
            }
            Compozr.dirty(true);
        },

        autoCleanUpNumberSections: function (currentItem) {
            if (!window.confirm(this.resources.autoCleanupNumberWarning)) {
                return;
            }

            var found = false,
                nextItem = currentItem;
            while (nextItem.is("*")) {
                var numberField = $("." + NUMBER_CSS_CLASS, nextItem),
                    contentField = $("." + CONTENT_CSS_CLASS, nextItem),
                    number = this.view.loadField(numberField).trim(),
                    contentText = this.view.loadField(contentField),
                    content = this.view.loadField(contentField, true),
                    regexp = new RegExp("^" + number + "([.]|\\s)+");
                if (number !== "" && regexp.test(contentText)) {
                    found = true;
                    regexp = new RegExp("^" + number + "([.]|\\s|&nbsp;)+");
                    content = content.replace(regexp, "").trim();
                    while (content.indexOf("&nbsp;") === 0) {
                        content = content.substr("&nbsp;".length).trim();
                    }
                    this.view.setField(contentField, content);
                }
                nextItem = nextItem.next();
            }
            if (found) {
                Compozr.dirty(true);
            }
        },

        insertSectionAbove: function (currentItem) {
            var newItem = this.view.createNewSection();
            currentItem.before(newItem);
            this.finishInsertSection(newItem);
        },

        insertSectionBelow: function (currentItem) {
            if (currentItem.is(":last")) {
                this.newSection();
            } else {
                var newItem = this.view.createNewSection();
                currentItem.after(newItem);
                this.finishInsertSection(newItem);
            }
        },

        assignElements: function () {
            this.assignElementsLock++;
            if ($(">li", this.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                Compozr.startProgress(0, $(">li", this.view.sections).length * 2, this.resources.assignElementsProgress);
            }
            this._super();

            var that = this;
            Compozr.queueTask("setSections",
                function () {
                    that.view.setSections(that.model.Sections);
                },
                function () {
                    return that.view.assignElementsLock === 0;
                }
            );
            Compozr.queueTask("finishAssignElements",
                function () {
                    if ($(">li", that.view.sections).length > SHOW_PROGRESS_BREAK_POINT) {
                        Compozr.endProgress();
                    }
                    that.assignElementsLock--;
                },
                function () {
                    return that.view.setSectionsLock === 0;
                }
            );
        },

        enableElementsEditability: function (fromCompactMode) {
            this.enableElementsEditabilityLock++;
            if (!fromCompactMode) {
                this._super();
            }

            var that = this;
            this.enableSectionsEditabilityAsync($(">li", this.view.sections), function () {
                that.enableElementsEditabilityLock--;
            }, fromCompactMode);
        },

        disableElementsEditability: function (toCompactMode) {
            this.disableElementsEditabilityLock++;
            if (!toCompactMode) {
                this._super();
            }

            var that = this;
            this.disableSectionsEditabilityAsync($(">li", this.view.sections), function () {
                that.disableElementsEditabilityLock--;
            }, toCompactMode);
        },

        enableSectionsEditabilityAsync: function (sections, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);

            if (!fromCompactMode) {
                var editables = $("." + NUMBER_CSS_CLASS, currentSections).add($("." + CONTENT_CSS_CLASS, currentSections));
                editables.attr(Compozr.CONTENTEDITABLE, "true")
                         .not("." + CONTENT_CSS_CLASS)
                         .attr(Compozr.SINGLE_LINE, "")
                         .attr(Compozr.NO_HTML, "")
                         .attr(Compozr.SELECT_ON_FOCUS, "");
            }

            if (!this.view.isCompactMode()) {
                var tags = $("." + TAGS_CSS_CLASS, currentSections);
                Compozr.includeAllInputs(tags.children("input"));
                tags.children("input").select2({
                    width: "100%",
                    placeholder: "[" + this.resources.tags + "]",
                    multiple: true,
                    query: function (query) {
                        Compozr.getJSON(that.options.searchSectionTagsUrl, {
                            data: { term: query.term },
                            onSuccess: function (data/*, textStatus, jqXHR*/) {
                                $.each(data.models, function (index, value) {
                                    data.models[index] = {
                                        id: value.Key,
                                        text: value.Text
                                    };
                                });
                                query.callback({ results: data.models });
                            },
                        });
                    },
                    initSelection: function (element, callback) {
                        var keys = $(element).val();
                        if (keys !== "") {
                            Compozr.getJSON(that.options.findSectionTagsUrl, {
                                data: { keys: keys },
                                onSuccess: function (data/*, textStatus, jqXHR*/) {
                                    $.each(data.models, function (index, value) {
                                        data.models[index] = {
                                            id: value.Key,
                                            text: value.Text
                                        };
                                    });
                                    callback(data.models);
                                }
                            });
                        }
                    }
                }).on("select2-focus" + DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.fixSizeViewport();
                    $(this).closest("li").find("." + CLEARFIX_CSS_CLASS).append(that.view.toolbox.show());
                    that.view.refreshToolbox();
                }).on("select2-blur" + DEFAULT_EVENT_DOMAIN, function () {
                    Compozr.restoreViewport();
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.enableElementsEditabilityProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.enableSectionsEditabilityAsync(nextSections, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        disableSectionsEditabilityAsync: function (sections, done, toCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);

            if (!toCompactMode) {
                var editables = $("." + NUMBER_CSS_CLASS, currentSections).add($("." + CONTENT_CSS_CLASS, currentSections));
                editables.removeAttr(Compozr.CONTENTEDITABLE);
            }

            if (!this.view.isCompactMode()) {
                var tags = $("." + TAGS_CSS_CLASS, currentSections);
                $.each(tags.children("input").off(DEFAULT_EVENT_DOMAIN), function (index, value) {
                    $(value).select2("destroy")
                            .removeAttr("style");
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.disableElementsEditabilityProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.disableSectionsEditabilityAsync(nextSections, done, toCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        finishInsertSection: function (newItem) {
            this.view.assignSectionsElements(newItem);
            this.view.prepareSectionsEditor(newItem);
            this.enableSectionsEditabilityAsync(newItem, function () { }, false);
            Compozr.attachEditorEvents(newItem);
            $("." + CONTENT_CSS_CLASS, newItem).focus();
            Compozr.dirty(true);
        },

        increaseSectionNumber: function (item) {
            var itemNumber = this.view.loadField($("." + NUMBER_CSS_CLASS, item)),
                dotIndex = itemNumber.lastIndexOf(".") + 1,
                lastFactor = parseInt(itemNumber.substr(dotIndex));
            if (isNaN(lastFactor)) {
                return itemNumber;
            } else {
                return itemNumber.substr(0, dotIndex) + (lastFactor + 1);
            }
        }
    });

})();
