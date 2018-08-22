/*!
 * jsStack v1.0.0
 * A simple and easy jQuery plugin for highlighting JavaScript stack traces
 * License : Apache 2
 * Author : Stanescu Eduard-Dan (https://elmah.io)
 */
(function($) {
    'use strict';

    $.fn.jsStack = function(options) {

        var settings = $.extend({

            // Default values for classes
            method: 'st-methodName',
            file: 'st-fileName',
            line: 'st-lineNumber',
            column: 'st-column'

        }, options);

        return this.each(function() {

            var UNKNOWN_FUNCTION = '<unknown>';
            var chrome = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                gecko = /^(?:\s*([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i,
                node  = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                other = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:).*?)?\)?\s*$/i;
            var stacktrace = escapeHtml($(this).text()),
                lines = stacktrace.split('\n'),
                stack = '',
                parts,
                element;

            function template_line(line, element) {
                line = line.replace(element.file, '<span class="'+ settings.file +'">' + element.file + '</span>')
                    .replace(element.methodName + ' (', '<span class="'+ settings.method +'">' + element.methodName + '</span> (')
                    .replace(':' + element.lineNumber + ':' + element.column, ':<span class="'+ settings.line +'">' + element.lineNumber + '</span>:<span class="'+ settings.column +'">' + element.column + '</span>');

                return line;
            }

            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }

            for (var i = 0, j = lines.length; i < j; ++i) {
                var line = '';

                if ((parts = gecko.exec(lines[i]))) {
                    element = {
                        'file': parts[3],
                        'methodName': parts[1] || UNKNOWN_FUNCTION,
                        'lineNumber': +parts[4],
                        'column': parts[5] ? +parts[5] : null
                    };
                    line = template_line(lines[i], element);
                } else if ((parts = chrome.exec(lines[i]))) {
                    element = {
                        'file': parts[2],
                        'methodName': parts[1] || UNKNOWN_FUNCTION,
                        'lineNumber': +parts[3],
                        'column': parts[4] ? +parts[4] : null
                    };
                    line = template_line(lines[i], element);
                } else if ((parts = node.exec(lines[i]))) {
                    element = {
                        'file': parts[2],
                        'methodName': parts[1] || UNKNOWN_FUNCTION,
                        'lineNumber': +parts[3],
                        'column': parts[4] ? +parts[4] : null
                    };
                    line = template_line(lines[i], element);
                } else if ((parts = other.exec(lines[i]))) {
                    element = {
                        'file': parts[3],
                        'methodName': parts[1] || UNKNOWN_FUNCTION,
                        'lineNumber': +parts[4],
                        'column': parts[5] ? +parts[5] : null
                    };
                    line = template_line(lines[i], element);
                } else {
                    line = lines[i];
                }

                if (lines.length - 1 == i) {
                    stack += line;
                } else {
                    stack += line + '\n';
                }
            }

            return $(this).html(stack);
        });
    };

}(jQuery));
