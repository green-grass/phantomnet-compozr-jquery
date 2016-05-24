(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    var DEFAULT_EVENT_DOMAIN = ".doc-compozr",
        HAS_NUMBERS_CSS_CLASS = "has-numbers",
        EDITOR_CSS_CLASS = "editor",
        COMPACT_CSS_CLASS = "compact",

        NUMBER_CSS_CLASS = "number",
        CONTENT_CSS_CLASS = "content",
        TAGS_CSS_CLASS = "tags",
        CLEARFIX_CSS_CLASS = "clearfix",
        TOOLBOX_CSS_CLASS = "toolbox",
        TOOLBOX_BUTTON_GROUP_CSS_CLASS = "btn-group",
        TOOLBOX_BUTTON_CSS_CLASS = "btn btn-link btn-xs",

        AUTO_SPLIT_BUTTON_ICON_CSS_CLASS = "auto-split glyphicon glyphicon-th-list",
        MERGE_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-th-large",
        MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS = "merge-with-above glyphicon glyphicon-hand-up",
        MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS = "merge-with-below glyphicon glyphicon-hand-down",
        AUTO_NUMBER_BUTTON_ICON_CSS_CLASS = "auto-number fa fa-list-ol",
        AUTO_CLEAN_UP_NUMBER_BUTTON_ICON_CSS_CLASS = "auto-clean-up-number fa fa-list-ul",
        INSERT_BUTTON_ICON_CSS_CLASS = "glyphicon glyphicon-plus-sign",
        INSERT_ABOVE_BUTTON_ICON_CSS_CLASS = "insert-above glyphicon glyphicon-hand-up",
        INSERT_BELOW_BUTTON_ICON_CSS_CLASS = "insert-below glyphicon glyphicon-hand-down",
        DELETE_SECTION_BUTTON_ICON_CSS_CLASS = "delete glyphicon glyphicon-trash",

        TOOLBOX_ITEM_ATTRIBUTE = "data-compozr-toolbox-item",

        SHOW_PROGRESS_BREAK_POINT = 10;

    GG.Documentation.Split.PaperView = GG.Documentation.Base.PaperView.extend({
        resources: new GG.Documentation.Split.Resources(),

        sections: $(),
        toolbox: $(),
        directories: $(),

        setSectionsLock: 0,

        init: function (container, options, resources) {
            this._super(container, options, resources);
            this.sections = $(".sections", this.container);
            this.directories = $(".directories", this.container).parent();
        },

        isCompactMode: function () {
            return this.doc.hasClass(COMPACT_CSS_CLASS);
        },

        assignElements: function () {
            this.assignElementsLock++;
            this._super();

            var that = this;
            this.sections.append(this.toolbox = _createToolbox().hide());
            this.assignSectionsElements($(">li", this.sections));

            this.assignElementsLock--;

            function _createToolbox() {
                var button = $("<button></button>").attr("type", "button")
                                                   .attr("tabindex", "-1")
                                                   .addClass(TOOLBOX_BUTTON_CSS_CLASS),
                    autoSplitButton
                        = button.clone().attr("title", that.resources.autoSplit)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoSplitSection")
                                        .append($("<span></span>").addClass(AUTO_SPLIT_BUTTON_ICON_CSS_CLASS)),
                    mergeWithAboveButton
                        = button.clone().attr("title", that.resources.mergeWithAbove)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "mergeSectionWithAbove")
                                        .append($("<span></span>").addClass(MERGE_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS)),
                    mergeWithBelowButton
                        = button.clone().attr("title", that.resources.mergeWithBelow)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "mergeSectionWithBelow")
                                        .append($("<span></span>").addClass(MERGE_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS)),
                    autoNumberButton
                        = button.clone().attr("title", that.resources.autoNumber)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoNumberSections")
                                        .append($("<span></span>").addClass(AUTO_NUMBER_BUTTON_ICON_CSS_CLASS)),
                    autoCleanUpNumberButton
                        = button.clone().attr("title", that.resources.autoCleanupNumber)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "autoCleanUpNumberSections")
                                        .append($("<span></span>").addClass(AUTO_CLEAN_UP_NUMBER_BUTTON_ICON_CSS_CLASS)),
                    insertAboveButton
                        = button.clone().attr("title", that.resources.insertAbove)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "insertSectionAbove")
                                        .append($("<span></span>").addClass(INSERT_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(INSERT_ABOVE_BUTTON_ICON_CSS_CLASS)),
                    insertBelowButton
                        = button.clone().attr("title", that.resources.insertSectionBelow)
                                        .attr(TOOLBOX_ITEM_ATTRIBUTE, "insertSectionBelow")
                                        .append($("<span></span>").addClass(INSERT_BUTTON_ICON_CSS_CLASS))
                                        .append(" ")
                                        .append($("<span></span>").addClass(INSERT_BELOW_BUTTON_ICON_CSS_CLASS)),
                    deleteButton
                        = button.clone().attr("title", that.resources.deleteSection)
                                        .append($("<span></span>").addClass(DELETE_SECTION_BUTTON_ICON_CSS_CLASS)),
                    toolbox = $("<div></div>").addClass(TOOLBOX_CSS_CLASS)
                                              .append($("<div></div>").addClass(TOOLBOX_BUTTON_GROUP_CSS_CLASS)
                                                                      .append(autoSplitButton)
                                                                      .append(mergeWithAboveButton)
                                                                      .append(mergeWithBelowButton)
                                                                      .append(autoNumberButton)
                                                                      .append(autoCleanUpNumberButton)
                                                                      .append(insertAboveButton)
                                                                      .append(insertBelowButton)
                                                                      .append(deleteButton));

                $("[" + TOOLBOX_ITEM_ATTRIBUTE + "]", toolbox).on("click" + DEFAULT_EVENT_DOMAIN + "-toolbox", function () {
                    $Compozr.triggerHandler($(this).attr(TOOLBOX_ITEM_ATTRIBUTE), $(this).closest("li"));
                });

                deleteButton.on("click" + DEFAULT_EVENT_DOMAIN + "-toolbox", function () {
                    var section = $(this).closest("li");
                    that.sections.append(that.toolbox.hide());
                    section.remove();
                    Compozr.dirty(true);
                });

                return toolbox;
            }
        },

        prepareDocEditor: function (turnOffContentHtml) {
            this.prepareDocEditorLock++;
            this._super();

            if (!this.isCompactMode()) {
                this.directories.hide();
                this.doc.parent().css("width", "100%");
            }
            this.doc.removeClass(HAS_NUMBERS_CSS_CLASS)
                    .addClass(EDITOR_CSS_CLASS);
            $(">li", this.sections).show();
            this.prepareSectionsEditor($(">li", this.sections), turnOffContentHtml, false);

            this.prepareDocEditorLock--;
        },

        cleanupDocEditor: function (turnOnContentHtml) {
            this.cleanupDocEditorLock++;
            this._super();

            var that = this;
            this.cleanupSectionsEditorAsync($(">li", this.sections), turnOnContentHtml, function () {
                if (!that.isCompactMode()) {
                    that.doc.parent().css("width", "");
                    that.directories.show();
                }
                that.doc.removeClass(EDITOR_CSS_CLASS)
                        .addClass(HAS_NUMBERS_CSS_CLASS);
                that.checkHasNumbers();
                that.doc.removeClass(COMPACT_CSS_CLASS);
                that.cleanupDocEditorLock--;
            }, false);
        },

        prepareDocFullMode: function () {
            this.prepareDocEditorLock++;

            this.directories.hide();
            this.doc
                .removeClass(COMPACT_CSS_CLASS)
                .parent().css("width", "100%");
            this.prepareSectionsEditor($(">li", this.sections), null, true);

            this.prepareDocEditorLock--;
        },

        cleanupDocFullMode: function () {
            this.cleanupDocEditorLock++;

            var that = this;
            this.cleanupSectionsEditorAsync($(">li", this.sections), null, function () {
                that.doc
                    .addClass(COMPACT_CSS_CLASS)
                    .parent().css("width", "");
                that.directories.show();
                that.cleanupDocEditorLock--;
            }, true);
        },

        loadDocModel: function () {
            var ret = this._super();

            return $.extend(ret, {
                Sections: this.loadSections()
            });
        },

        createNewSection: function () {
            return $("<li></li>").append($("<div></div>").addClass(NUMBER_CSS_CLASS))
                                 .append($("<div></div>").addClass(CONTENT_CSS_CLASS));
        },

        assignSectionsElements: function (sections) {
            this.assignElementsLock++;
            var that = this;
            this.assignSectionsElementsAsync(sections, function () {
                that.assignElementsLock--;
            });
        },

        prepareSectionsEditor: function (sections, turnOffContentHtml, fromCompactMode) {
            this.prepareDocEditorLock++;
            var that = this;
            this.prepareSectionsEditorAsync(sections, turnOffContentHtml, function () {
                that.refreshToolbox();
                that.prepareDocEditorLock--;
            }, fromCompactMode);
        },

        checkHasNumbers: function () {
            var that = this,
                hasNumber = false;
            $.each($(">li", this.sections), function (index, value) {
                var $value = $(value),
                    number = $("." + NUMBER_CSS_CLASS, $value),
                    content = $("." + CONTENT_CSS_CLASS, $value);
                if (number.is(":empty") && content.is(":empty")) {
                    $value.hide();
                } else if (!number.is(":empty")) {
                    hasNumber = true;
                }
            });
            if (hasNumber) {
                this.doc.addClass(HAS_NUMBERS_CSS_CLASS);
            } else {
                this.doc.removeClass(HAS_NUMBERS_CSS_CLASS);
            }
        },

        refreshToolbox: function () {
            var mergeWithAboveButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=mergeSectionWithAbove]", this.sections),
                mergeWithBelowButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=mergeSectionWithBelow]", this.sections),
                autoNumberButtons = $("[" + TOOLBOX_ITEM_ATTRIBUTE + "=autoNumberSections]", this.sections);
            mergeWithAboveButtons.add(mergeWithBelowButtons)
                                 .add(autoNumberButtons)
                                 .removeAttr("disabled");
            $(">li:first", this.sections).find(mergeWithAboveButtons).attr("disabled", "disabled");
            $(">li:last", this.sections).find(mergeWithBelowButtons).attr("disabled", "disabled")
                                        .find(autoNumberButtons).attr("disabled", "disabled");
        },

        setSections: function (sectionsData) {
            this.setSectionsLock++;
            var that = this;
            this.setSectionsAsync($(">li", this.sections), sectionsData.slice(0), function () {
                that.setSectionsLock--;
            });
        },

        loadSections: function () {
            var that = this,
                ret = [];
            $.each($(">li", this.sections), function (index, value) {
                ret.push(that.loadSection($(value)));
            });
            return ret;
        },

        loadSection: function (section) {
            return {
                Number: this.loadField($("." + NUMBER_CSS_CLASS, section)),
                Content: this.loadField($("." + CONTENT_CSS_CLASS, section), true),
                TagsEdit: $("." + TAGS_CSS_CLASS, section).children("input").val(),
            };
        },

        assignSectionsElementsAsync: function (sections, done) {
            var that = this,
                tags = $("<div></div>").addClass(TAGS_CSS_CLASS)
                                       .append($("<input type=\"hidden\" />"))
                                       .hide(),
                clearfix = $("<div></div>").addClass(CLEARFIX_CSS_CLASS)
                                           .css("clear", "both")
                                           .hide(),
                content = $("." + CONTENT_CSS_CLASS, sections);
            if (content.length > 1) {
                content = content.slice(0, SHOW_PROGRESS_BREAK_POINT);
                window.setTimeout(function () {
                    $.each(content, function (index, value) {
                        var $value = $(value);
                        that.assignSectionElements($value, clearfix.clone(), tags.clone());
                        sections = sections.not($value.closest("li"));
                    });
                    that.assignSectionsElementsAsync(sections, done);
                }, 10);
            } else {
                if (content.length === 1) {
                    this.assignSectionElements(content, clearfix, tags);
                }
                done();
            }
        },

        assignSectionElements: function (content, clearfix, tags) {
            Compozr.increaseProgress(1, this.resources.assignElementsProgress);
            content.after(clearfix).after(tags);
        },

        prepareSectionsEditorAsync: function (sections, turnOffContentHtml, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections),
                number = $("." + NUMBER_CSS_CLASS, currentSections),
                content = $("." + CONTENT_CSS_CLASS, currentSections),
                tags = $("." + TAGS_CSS_CLASS, currentSections),
                clearfix = $("." + CLEARFIX_CSS_CLASS, currentSections);

            if (!fromCompactMode) {
                number.css("min-height", "0");
                this.initPlaceHolder(number, "#", false, false);
                content.css("min-height", "50px");
                this.initPlaceHolder(content, this.resources.content, true, false);
                clearfix.show();

                if (turnOffContentHtml) {
                    $(content).each(function (index, value) {
                        var $value = $(value);
                        $value.html(turnOffContentHtml($value.html()));
                    });
                }

                // Show toolbox on focus
                number.add(content).on("focus" + DEFAULT_EVENT_DOMAIN, function (e) {
                    $(this).closest("li").find(clearfix).append(that.toolbox.show());
                    that.refreshToolbox();
                });

                if (!Modernizr.touch) {
                    number.add(content).on("keypress" + DEFAULT_EVENT_DOMAIN, function (e) {
                        switch (e.which) {
                            case 77:
                            case 109:
                                if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) { // Ctrl + Shift + M
                                    e.preventDefault();
                                    _findButton(MERGE_WITH_ABOVE_BUTTON_ICON_CSS_CLASS).click();
                                } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) { // Ctrl + M
                                    e.preventDefault();
                                    _findButton(MERGE_WITH_BELOW_BUTTON_ICON_CSS_CLASS).click();
                                }
                                break;
                            case 13:
                                if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey) { // Ctrl + Shift + Enter
                                    e.preventDefault();
                                    _findButton(INSERT_ABOVE_BUTTON_ICON_CSS_CLASS).click();
                                } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) { // Ctrl + Enter
                                    e.preventDefault();
                                    _findButton(INSERT_BELOW_BUTTON_ICON_CSS_CLASS).click();
                                }
                                break;
                        }

                        var thisSection = $(this).closest("li");
                        function _findButton(cssClass) {
                            return $("." + cssClass.split(" ")[0], thisSection).closest("button");
                        }
                    });

                    number.on("keydown" + DEFAULT_EVENT_DOMAIN, function (e) {
                        var section = $();
                        switch (e.which) {
                            case 38:
                                // Up
                                section = $(this).closest("li").prev();
                                break;
                            case 40:
                                // Down
                            case 13:
                                // Enter
                                section = $(this).closest("li").next();
                                break;
                        }
                        if (section.is("*")) {
                            $("." + NUMBER_CSS_CLASS, section).focus();
                        }
                    });
                }
            }

            if (!this.isCompactMode()) {
                tags.show();
            }

            Compozr.increaseProgress(currentSections.length, this.resources.prepareDocEditorProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.prepareSectionsEditorAsync(nextSections, turnOffContentHtml, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        cleanupSectionsEditorAsync: function (sections, turnOnContentHtml, done, fromCompactMode) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections),
                number = $("." + NUMBER_CSS_CLASS, currentSections),
                content = $("." + CONTENT_CSS_CLASS, currentSections),
                tags = $("." + TAGS_CSS_CLASS, currentSections),
                clearfix = $("." + CLEARFIX_CSS_CLASS, currentSections);

            if (!this.isCompactMode()) {
                tags.hide();
            }

            if (!fromCompactMode) {
                number.add(content).off(DEFAULT_EVENT_DOMAIN);
                clearfix.hide();
                this.destroyPlaceHolder(number, false);
                this.destroyPlaceHolder(content, false);
                content.each(function (index, value) {
                    $(value).html(turnOnContentHtml($(value).html()));
                });
            }

            Compozr.increaseProgress(currentSections.length, this.resources.cleanupDocEditorProgress);
            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.cleanupSectionsEditorAsync(nextSections, turnOnContentHtml, done, fromCompactMode);
                }, 10);
            } else {
                done();
            }
        },

        setSectionsAsync: function (sections, sectionsData, done) {
            var that = this,
                currentSections = sections.slice(0, SHOW_PROGRESS_BREAK_POINT),
                nextSections = sections.not(currentSections);
            $.each(currentSections, function (index, value) {
                that.setSection($(value), sectionsData[0]);
                sectionsData.shift();
            });

            if (nextSections.length > 0) {
                window.setTimeout(function () {
                    that.setSectionsAsync(nextSections, sectionsData, done);
                }, 10);
            } else {
                done();
            }
        },

        setSection: function (section, sectionData) {
            Compozr.increaseProgress(1, this.resources.setSectionsProgress);
            $("." + TAGS_CSS_CLASS, section).children("input").val(sectionData.Tags);
        }
    });

})();
