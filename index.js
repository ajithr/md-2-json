'use strict';

var marked = require('marked');
var traverse = require('traverse');

var parse = function (mdContent) {
    var aligned = getAlignedContent(mdContent);
    var json = marked.lexer(aligned);
    var currentHeading, headings = [];
    var output = json.reduce(function (result, item) {
        if (!currentHeading) {
            currentHeading = result;
        }
        if (item.type == 'heading') {
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
        }
        else {
            currentHeading.raw = currentHeading.raw ? currentHeading.raw + item.raw : item.raw;
        }
        return result;
    }, {});
    return output;
}
exports.parse = parse;

function getAlignedContent(mdContent) {
    var headings = mdContent.match(/(?:\r\n)#.*$/mg);
    if (!headings) {
        return mdContent.trim();
    }
    for (var i = 0; i < headings.length; i++) {
        var heading = headings[i].trim();
        var propHeading = new RegExp('(?:\r\n){2}' + heading + '.*$', 'mg');
        if (!mdContent.match(propHeading)) {
            var wrongHeading = new RegExp('(?:\r\n)' + heading + '.*$', 'mg');
            mdContent = mdContent.replace(wrongHeading, '\r\n\r\n' + heading);
        }
    }
    return mdContent;
}

function getParentHeading(headings, item, result) {
    var parent, index = item.depth - 1;
    var currentHeading = headings[index];
    if (currentHeading) {
        headings.splice(index, headings.length - index);
    }
    headings.push(item.text);
    for (var i = 0; i < index; i++) {
        parent = !parent ? result[headings[i]] : parent[headings[i]];
    }
    return {
        headings: headings,
        parent: parent
    };
}

function toMd(jsonObject) {
    var mdText = '';
    traverse(jsonObject).reduce(function (acc, value) {
        mdText += (this.isLeaf && this.key === 'raw') ? value : getHash(this.level) + ' ' + this.key + '\n\n';
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
