# MARKDOWN-TO-JSON

A simple library to convert markdown content to JSON object.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save md-2-json
```

## Usage

### Simple content

```js

var md2json = require('md-2-json');

md2json.parse('This is a markdown content');

/* output
{
    raw: "This is a markdown content\n"
}
*/

```

### Multiline Content

```js

var md2json = require('md-2-json');
var mdContent = `
# Heading 1

This is a para

- This is a list

## Heading 2

This is a para
`

md2json.parse(mdContent);

/* output
{
    "Heading 1": {
        raw: "This is a para\n - This is a list\n",
        "Heading 2": {
            raw: "This is a para\n"
        }
    }
}
*/

```

### Converting JSON to MD string

The method `toMd` can be used to convert the JSON Object to Markdown string.

```js

var md2json = require('md-2-json');
var json = {
    "Heading 1": {
        raw: "This is a para\n",
    }
}

md2json.toMd(json);

/* output
`
# Heading 1

This is a para

`
*/

```
