(function () {

    "use strict";

    GG.namespace("GG.Documentation.Split");

    GG.Documentation.Split.Resources = GG.Documentation.Base.Resources.extend({
        content: null,

        editOrCompact: null,
        editOrFull: null,
        backToPreviewOrCompact: null,
        backToPreviewOrFull: null,

        autoSplit: null,
        autoSplitWarning: null,
        mergeWithAbove: null,
        mergeWithBelow: null,
        autoNumber: null,
        autoNumberWarning: null,
        autoCleanupNumber: null,
        autoCleanupNumberWarning: null,
        insertSectionAbove: null,
        insertSectionBelow: null,
        deleteSection: null,

        assignElementsProgress: null,
        setSectionsProgress: null,
        prepareDocEditorProgress: null,
        cleanupDocEditorProgress: null,
        enableElementsEditabilityProgress: null,
        disableElementsEditabilityProgress: null,
        autoSplitSectionProgress: null
    });

})();
