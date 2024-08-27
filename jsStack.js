/*!
 * jsStack v2.0.0
 * A simple and easy library for highlighting JavaScript stack traces
 * License: Apache 2
 * Author: https://elmah.io
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.jsStack = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function jsStack(element, options) {
        // Default settings
        var settings = Object.assign({
            method: 'st-methodName',
            file: 'st-fileName',
            line: 'st-lineNumber',
            column: 'st-column'
        }, options);

        var UNKNOWN_FUNCTION = '<unknown>';
        var chrome = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
            gecko = /^(?:\s*([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i,
            node  = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,
            other = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )\(?((?:).*?)?\)?\s*$/i;

        var stacktrace = escapeHtml(element.textContent),
            lines = stacktrace.split('\n'),
            stack = '',
            parts,
            elementObj;

        function template_line(line, element) {
            line = line.replace(element.file, '<span class="'+ settings.file +'">' + element.file + '</span>')
                .replace(element.methodName + ' (', '<span class="'+ settings.method +'">' + element.methodName + '</span> (')
                .replace(':' + element.lineNumber + ':' + element.column, ':<span class="'+ settings.line +'">' + element.lineNumber + '</span>:<span class="'+ settings.column +'">' + element.column + '</span>');
            line = line.replace(/&lt;/g, '<span>&lt;</span>').replace(/&gt;/g, '<span>&gt;</span>');

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
                elementObj = {
                    'file': parts[3],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                };
                line = template_line(lines[i], elementObj);
            } else if ((parts = chrome.exec(lines[i]))) {
                elementObj = {
                    'file': parts[2],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
                line = template_line(lines[i], elementObj);
            } else if ((parts = node.exec(lines[i]))) {
                elementObj = {
                    'file': parts[2],
                    'methodName': parts[1] || UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                };
                line = template_line(lines[i], elementObj);
            } else if ((parts = other.exec(lines[i]))) {
                elementObj = {
                    'file': parts[2],
                    'methodName': parts[1] || UNKNOWN_FUNCTION
                };
                line = template_line(lines[i], elementObj);
            } else {
                line = lines[i].replace(/&lt;/g, '<span>&lt;</span>').replace(/&gt;/g, '<span>&gt;</span>');
            }

            if (lines.length - 1 == i) {
                stack += line;
            } else {
                stack += line + '\n';
            }
        }

        element.innerHTML = stack;
    }

    // Function to initialize the plugin on elements
    function initJsStack(elements, options) {
        elements.forEach(function(element) {
            jsStack(element, options);
        });
    }

    // Expose the plugin globally
    function jsStackLibrary(selector, options) {
        var elements = document.querySelectorAll(selector);
        initJsStack(Array.from(elements), options);
    }

    return jsStackLibrary;

}));