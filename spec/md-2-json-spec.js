const MD2JSON = require('../index');
const PARSE = MD2JSON.parse;
const TOMD = MD2JSON.toMd;

const SIMPLE_CONTENT = `# Heading1
Testing`;
const NESTED_HEADERS = `# Heading1
Testing1

## Heading2
Testing2

### Heading3
Testing3`;
const NESTED_AND_DUPLICATE_HEADERS = `# Heading1
## Duplicate Heading 
Testing Duplicate 1
## Duplicate Heading
Testing Duplicate 2`;

describe("md-2-json unit testing", () => {
    it("simple content", () => {
        var result = PARSE(SIMPLE_CONTENT);
        var expected = { "Heading1": { raw: "Testing" } };
        expect(result).toEqual(expected);
    });
    it("multiple headers", () => {
        var result = PARSE(NESTED_HEADERS);
        var expected = { 
            "Heading1": { 
                raw: "Testing1\n\n",
                "Heading2": { 
                    raw: "Testing2\n\n",
                    "Heading3": { 
                        raw: "Testing3" 
                    }
                } 
            }
        };
        expect(result).toEqual(expected);
    });
    it("multiple headers", () => {
        var result = PARSE(NESTED_AND_DUPLICATE_HEADERS);
        var expected = { 
            "Heading1": { 
                "Duplicate Heading":{
                    raw: "Testing Duplicate 1\nTesting Duplicate 2",
                },
            }
        };
        expect(result).toEqual(expected);
    });
    
});