/*!
 * Select2 Vietnamese translation
 * Original author: Green Grass (http://nguyenngocminh.info)
 */

(function ($) {
    "use strict";

    $.fn.select2.locales['vi'] = {
        formatNoMatches: function () { return "Không tìm thấy mục nào"; },
        formatInputTooShort: function (input, min) { var n = min - input.length; return "Vui lòng nhập thêm " + n + " ký tự"; },
        formatInputTooLong: function (input, max) { var n = input.length - max; return "Vui lòng xóa bớt " + n + " ký tự"; },
        formatSelectionTooBig: function (limit) { return "Chỉ có thể chọn được " + limit + " mục"; },
        formatLoadMore: function (pageNumber) { return "Đang tải thêm kết quả..."; },
        formatSearching: function () { return "Đang tìm..."; }
    };

    $.extend($.fn.select2.defaults, $.fn.select2.locales['vi']);
})(jQuery);
