/*!
 * Phantom Net Utilities
 * Original author: Green Grass (http://nguyenngocminh.info)
 * Licensed under the MIT license
 * 
 * Dependencies:
 * - jQuery
 * - jQuery.UI
 */

(function ($, window, document, undefined) {

    "use strict";

    if (window.GG === undefined) {
        window.GG = function () { };
    }
    var GG = window.GG;

    if (GG.Globalization !== undefined) {
        return;
    }

    ////////////////////////////////////////////////////////////////
    // Globalization
    var currentCulture = '';
    var Globalization = GG.Class.extend({

        getCurrentCulture: function () {
            return currentCulture;
        },

        setCurrentCulture: function (culture) {
            currentCulture = culture;
            switch (culture) {
                case 'vi':
                    $.validator.addMethod('date', function (value, element) {
                        return true;
                    });
                    $.validator.addMethod('number', function (value, element) {
                        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:.\d{3})+)?(?:\,\d+)?$/.test(value);
                    });
                    break;
                default:
                    if (currentCulture == '') {
                        return;
                    }

                    // Reset to default
                    $.validator.addMethod('date', function (value, element) {
                        return this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
                    });
                    $.validator.addMethod('number', function (value, element) {
                        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
                    });
                    break;
            }
        }

    });

    GG.Globalization = new Globalization();

    ////////////////////////////////////////////////////////////////
    // showErrorMessages
    GG.showErrorMessages = function (messages) {
        alert(messages);
    };

    ////////////////////////////////////////////////////////////////
    // toAscii
    var _unicode = "áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴđĐ",
        _ascii = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYdD";
    GG.toAscii = function (source) {
        for (var i = 0; i < _unicode.length; i++) {
            var regexp = new RegExp(_unicode.substr(i, 1), "g");
            source = source.replace(regexp, _ascii.substr(i, 1));
        }
        return source;
    };

    ////////////////////////////////////////////////////////////////
    // outerHtml
    GG.outerHtml = function (elements) {
        return $("<div></div>").append($(elements).clone()).html();
    };

    ////////////////////////////////////////////////////////////////
    // textWithLineBreaks
    GG.textWithLineBreaks = function (html) {
        var breakToken = '_______break_______',
            lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken)
                                  .replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + "$1" + breakToken)
                                  .replace(/<div\.*?>(.*?)<\/div>/gi, breakToken + "$1" + breakToken)
                                  .replace(/<li\.*?>(.*?)<\/li>/gi, breakToken + "$1" + breakToken);
        var ret = $("<div></div>").html(lineBreakedHtml).text().replace(/\n/g, "").replace(new RegExp(breakToken, "g"), "\n");
        while (ret.indexOf("\n\n") > -1) {
            ret = ret.replace("\n\n", "\n");
        }
        return ret;
    };

    ////////////////////////////////////////////////////////////////
    // escapeHtmlWithLineBreaks
    GG.escapeHtmlWithLineBreaks = function (html) {
        return html.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/\n/g, "<br />");
    };

    ////////////////////////////////////////////////////////////////
    // toUrlFriendly
    GG.toUrlFriendly = function (source) {
        source = GG.toAscii(source).trim().toLowerCase();
        source = source.replace(/ /g, "-");
        source = source.replace(/&nbsp;/g, "-");
        source = source.replace(/[^0-9a-z-]/g, "");
        while (source.indexOf("--") > -1) {
            source = source.replace(/--/g, "-");
        }
        return source;
    };

    ////////////////////////////////////////////////////////////////
    // pasteHtmlAtCaret
    GG.pasteHtmlAtCaret = function (html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // non-standard and not supported in all browsers (IE9, for one)
                var el = document.createElement("div");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type !== "Control") {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    };

    ////////////////////////////////////////////////////////////////
    // tableToExcel
    GG.tableToExcel = function (table, name) {
        /// <signature>
        /// <param name='table' type='jQuery' />
        /// <param name='name' type='String' />
        /// <returns type='String'/>
        /// </signature>
        /*
         * Source :http://www.codeproject.com/Tips/755203/Export-HTML-table-to-Excel-With-CSS
         * by Er. Puneet Goel
         */

        var uri = "data:application/vnd.ms-excel;base64,",
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';

        var ctx = {
            worksheet: name || "Worksheet",
            table: table.html()
        };
        return uri + base64(format(template, ctx));

        function base64(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        }

        function format(s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            });
        }
    };

    ////////////////////////////////////////////////////////////////
    // getJSON
    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    GG.getJSON = function (url, options) {
        options = $.extend({
            data: {},
            onSuccess: function (/*data, textStatus, jqXHR*/) { },
            onUnsuccess: function (/*data, textStatus, jqXHR*/) { },
            onError: function (/*jqXHR, textStatus, errorThrown*/) { },
            onComplete: function (/*jqXHR, textStatus*/) { },
            onUnauthenticated: function (/*jqXHR, textStatus*/) {
                window.location = window.location;
            }
        }, options);

        return $.getJSON(url, options.data)
            .success(function (data, textStatus, jqXHR) {
                if (data.success === true) {
                    options.onSuccess(data, textStatus, jqXHR);
                } else {
                    if (data.unauthenticated === true) {
                        options.onUnauthenticated(jqXHR, textStatus);
                    } else {
                        options.onUnsuccess(data, textStatus, jqXHR);
                    }
                }
            })
            .error(function (jqXHR, textStatus, errorThrown) {
                if (options.onError(jqXHR, textStatus, errorThrown) !== false) {
                    GG.showErrorMessages([errorThrown, jqXHR.responseText]);
                }
            })
            .complete(function (jqXHR, textStatus) {
                options.onComplete(jqXHR, textStatus);
            })
        ;
    };

    ////////////////////////////////////////////////////////////////
    // postJSON
    // options { data, onSuccess, onUnsuccess, onError, onComplete }
    GG.postJSON = function (url, options) {
        options = $.extend({
            data: {},
            onSuccess: function (/*data, textStatus, jqXHR*/) { },
            onUnsuccess: function (/*data, textStatus, jqXHR*/) { },
            onError: function (/*jqXHR, textStatus, errorThrown*/) { },
            onComplete: function (/*jqXHR, textStatus*/) { },
            onUnauthenticated: function (/*jqXHR, textStatus*/) {
                window.location = window.location;
            }
        }, options);
        return $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(options.data),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (data, textStatus, jqXHR) {
                // TODO:: Migrate to new format
                if (data.success === true || data.Succeeded === true) {
                    options.onSuccess(data, textStatus, jqXHR);
                } else if (data.unauthenticated === true || data.Unauthenticated === true) {
                    options.onUnauthenticated(jqXHR, textStatus);
                } else {
                    options.onUnsuccess(data, textStatus, jqXHR);
                }
                options.onComplete(jqXHR, textStatus);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseText === "") {
                    options.onUnauthenticated(jqXHR, textStatus);
                } else if (options.onError(jqXHR, textStatus, errorThrown) !== false) {
                    GG.showErrorMessages([errorThrown, jqXHR.responseText]);
                }
                options.onComplete(jqXHR, textStatus);
            }
        });
    };

    ////////////////////////////////////////////////////////////////
    // initDatepickers
    GG.initDatepickers = function (elements, options) {
        if (Modernizr.inputtypes.date) {
            if (!Modernizr.touch) {
                elements.attr('type', 'text');
                _initDatepickers(elements, options);
            }
        }
        else {
            _initDatepickers(elements, options);
        }

        function _initDatepickers(datepickers, options) {
            $.each(datepickers, function (index, value) {
                if (!options.yearRange) {
                    var yearRange = $(value).attr('data-gg-datepicker-year-range');
                    options.yearRange = yearRange ? yearRange : 'c-10:c+10';
                }
                $(value).datepicker(options);
            });
        }
    };

})(jQuery, window, document);

$(function () {
    $('[data-gg-focus]').focus();

    GG.initDatepickers($('[data-gg-datepicker]'),
        {
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true
        });
});
