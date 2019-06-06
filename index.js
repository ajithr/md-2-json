'use strict';

var marked = require('marked');
var traverse = require('traverse');

var parse = function(mdContent) {
    var json = marked.lexer(mdContent);
    var currentHeading, headings = [],
        isOrdered = true;
    var output = json.reduce(function(result, item, index, array) {
        switch (item.type) {
            case 'heading':
                if (!currentHeading || item.depth == 1) {
                    headings = [];
                    result[item.text] = {};
                    currentHeading = result[item.text];
                    headings.push(item.text);
                } else {
                    var parentHeading = getParentHeading(headings, item, result);
                    headings = parentHeading.headings;
                    currentHeading = parentHeading.parent;
                    currentHeading[item.text] = {};
                    currentHeading = currentHeading[item.text];
                }
                break;
            case 'list_start':
                isOrdered = item.ordered;
                break;
            case 'text':
                var ordered = isOrdered ? '1. ' : '- ';
                var text = ordered + item.text + '\n';
                currentHeading.raw = currentHeading.raw ? currentHeading.raw + text : text;
                break;
            case 'table':
                var tableContent = getTableContent(item);
                currentHeading.raw = currentHeading.raw ? currentHeading.raw + tableContent : tableContent;
                break;
            case 'space':
                currentHeading.raw = currentHeading.raw ? currentHeading.raw + '\n' : '\n';
                break;
            case 'paragraph':
                if (!currentHeading) {
                    currentHeading = result;
                }
                var para = checkNextLine(item.text);
                currentHeading.raw = currentHeading.raw ? currentHeading.raw + para : para;
                break;
            default:
                break;
        }
        return result;
    }, {});
    return output;
}
exports.parse = parse;

function getParentHeading(headings, item, result) {
    var parent, index = item.depth - 1;
    var currentHeading = headings[index];
    if (currentHeading) {
        headings.splice(index, headings.length - index);
    }
    headings.push(item.text);
    for (var i = 0; i < index; i++) {
        if (!parent) {
            parent = result[headings[i]];
        } else {
            parent = parent[headings[i]];
        }
    }
    return {
        headings: headings,
        parent: parent
    };
}

function getTableContent(item) {
    var tableHeader = '',
        tableContent = '',
        separator = '';
    for (var i = 0; i < item.header.length; i++) {
        tableHeader += item.header[i] + ' | ';
    }
    for (var i = 0; i < item.align.length; i++) {
        separator += '---------:| ';
    }
    for (var i = 0; i < item.cells.length; i++) {
        var cells = item.cells[i];
        for (var j = 0; j < cells.length; j++) {
            tableContent += cells[j] + ' | ';
        }
        var sep = i !== item.cells.length - 1 ? '| ' : '';
        tableContent += '\n' + sep;
    }
    return '| ' + tableHeader + '\n|: ' + separator + '\n| ' + tableContent + '\n';
}

function checkNextLine(mdText) {
    if (!mdText.endsWith('\n\n')) {
        mdText += '\n\n';
    }
    return mdText;
}

function toMd(jsonObject) {
    var mdText = '';
    traverse(jsonObject).reduce(function(acc, value) {
        if (this.isLeaf && this.key === 'raw') {
            mdText += value;
        } else {
            mdText += getHash(this.level) + ' ' + this.key + '\n\n';
        }
        return;
    });
    return mdText;
}
exports.toMd = toMd;

function getHash(level) {
    var hash = '';
    for (var i = 0; i < level; i++) {
        hash += '#';
    }
    return hash;
}
