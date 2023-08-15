import { parse } from "../parser";
import { DefineStatement, UMLSpriteStatement } from "../PreprocessorAst";

it("定义变量", () => {
  const input = String.raw`@startuml
!$ab ?= "foo1"
!$cd = "foo2"
!$ef = $ab + $cd
Alice -> Bob : $ab
Alice -> Bob : $cd
Alice -> Bob : $ef
@enduml`;
  const output = {
    children: [
      { pos: { end: 9, start: 0 }, text: "@startuml", type: "UmlText" },
      {
        init: {
          pos: { end: 24, start: 18 },
          text: "foo1",
          type: "StringLiteral",
        },
        name: { name: "$ab", pos: { end: 14, start: 11 }, type: "Identifier" },
        pos: { end: 24, start: 10 },
        scope: undefined,
        type: "VariableDeclaration",
      },
      {
        init: {
          pos: { end: 38, start: 32 },
          text: "foo2",
          type: "StringLiteral",
        },
        name: { name: "$cd", pos: { end: 29, start: 26 }, type: "Identifier" },
        pos: { end: 38, start: 25 },
        scope: undefined,
        type: "VariableDeclaration",
      },
      {
        init: {
          left: {
            name: "$ab",
            pos: { end: 49, start: 46 },
            type: "Identifier",
          },
          operator: {
            kind: "+",
            pos: { end: 51, start: 50 },
            type: "BinaryOperatorToken",
          },
          pos: { end: 55, start: 46 },
          right: {
            name: "$cd",
            pos: { end: 55, start: 52 },
            type: "Identifier",
          },
          type: "BinaryExpression",
        },
        name: { name: "$ef", pos: { end: 43, start: 40 }, type: "Identifier" },
        pos: { end: 55, start: 39 },
        scope: undefined,
        type: "VariableDeclaration",
      },
      {
        pos: { end: 74, start: 56 },
        text: "Alice -> Bob : $ab",
        type: "UmlText",
      },
      {
        pos: { end: 93, start: 75 },
        text: "Alice -> Bob : $cd",
        type: "UmlText",
      },
      {
        pos: { end: 112, start: 94 },
        text: "Alice -> Bob : $ef",
        type: "UmlText",
      },
      { pos: { end: 120, start: 113 }, text: "@enduml", type: "UmlText" },
    ],
    pos: { end: 120, start: 0 },
    sourceString: `@startuml
!$ab ?= \"foo1\"
!$cd = \"foo2\"
!$ef = $ab + $cd
Alice -> Bob : $ab
Alice -> Bob : $cd
Alice -> Bob : $ef
@enduml`,
    type: "Root",
  };
  const ast = parse(input);
  expect(ast).toEqual(output);
});

it("!$LEGEND_IMAGE_SIZE_FACTOR ?= 0.25", () => {
  const input = String.raw`!$LEGEND_IMAGE_SIZE_FACTOR ?= 0.25`;
  const ast = parse(input);
  const output = {
    children: [
      {
        init: {
          pos: { end: 34, start: 30 },
          text: "0.25",
          type: "NumberLiteral",
        },
        name: {
          name: "$LEGEND_IMAGE_SIZE_FACTOR",
          pos: { end: 26, start: 1 },
          type: "Identifier",
        },
        pos: { end: 34, start: 0 },
        scope: undefined,
        type: "VariableDeclaration",
      },
    ],
    pos: { end: 34, start: 0 },
    sourceString: "!$LEGEND_IMAGE_SIZE_FACTOR ?= 0.25",
    type: "Root",
  };
  expect(ast).toEqual(output);
});

it("parse    `!theme superhero`", () => {
  const input = "    !theme superhero";
  expect(parse(input)).toEqual({
    children: [
      {
        pos: { end: 20, start: 4 },
        theme: "superhero",
        type: "ThemeStatement",
      },
    ],
    pos: { end: 20, start: 4 },
    sourceString: "!theme superhero",
    type: "Root",
  });
});

it("If", () => {
  const input = String.raw`@startuml
!$a = 10
!$ijk = "foo"
Alice -> Bob : A
!if ($ijk == "foo") && ($a+10>=4)
Alice -> Bob : yes
!else
Alice -> Bob : This should not appear
!endif
Alice -> Bob : B
@enduml`;
  const output = {
    type: "Root",
    children: [
      {
        type: "UmlText",
        text: "@startuml",
        pos: {
          start: 0,
          end: 9,
        },
      },
      {
        type: "VariableDeclaration",
        init: {
          pos: {
            end: 18,
            start: 16,
          },
          text: "10",
          type: "NumberLiteral",
        },
        name: {
          type: "Identifier",
          name: "$a",
          pos: {
            start: 11,
            end: 13,
          },
        },
        pos: {
          start: 10,
          end: 18,
        },
      },
      {
        type: "VariableDeclaration",
        init: {
          type: "StringLiteral",
          text: "foo",
          pos: {
            start: 27,
            end: 32,
          },
        },
        name: {
          type: "Identifier",
          name: "$ijk",
          pos: {
            start: 20,
            end: 24,
          },
        },
        pos: {
          start: 19,
          end: 32,
        },
      },
      {
        type: "UmlText",
        text: "Alice -> Bob : A",
        pos: {
          start: 33,
          end: 49,
        },
      },
      {
        type: "IfStatement",
        expression: {
          type: "BinaryExpression",
          left: {
            type: "ParenthesizedExpression",
            expression: {
              type: "BinaryExpression",
              left: {
                type: "Identifier",
                name: "$ijk",
                pos: {
                  start: 55,
                  end: 59,
                },
              },
              operator: {
                kind: "==",
                pos: {
                  end: 62,
                  start: 60,
                },
                type: "BinaryOperatorToken",
              },
              pos: {
                start: 55,
                end: 68,
              },
              right: {
                type: "StringLiteral",
                text: "foo",
                pos: {
                  start: 63,
                  end: 68,
                },
              },
            },
            pos: {
              start: 54,
              end: 69,
            },
          },
          operator: {
            kind: "&&",
            pos: {
              end: 72,
              start: 70,
            },
            type: "BinaryOperatorToken",
          },
          pos: {
            start: 54,
            end: 83,
          },
          right: {
            type: "ParenthesizedExpression",
            expression: {
              type: "BinaryExpression",
              left: {
                type: "Identifier",
                name: "$a",
                pos: {
                  start: 74,
                  end: 76,
                },
              },
              operator: {
                kind: "+",
                pos: {
                  end: 77,
                  start: 76,
                },
                type: "BinaryOperatorToken",
              },
              pos: {
                start: 74,
                end: 82,
              },
              right: {
                type: "BinaryExpression",
                left: {
                  pos: {
                    end: 79,
                    start: 77,
                  },
                  text: "10",
                  type: "NumberLiteral",
                },
                operator: {
                  kind: ">=",
                  pos: {
                    end: 81,
                    start: 79,
                  },
                  type: "BinaryOperatorToken",
                },
                pos: {
                  start: 77,
                  end: 82,
                },
                right: {
                  pos: {
                    end: 82,
                    start: 81,
                  },
                  text: "4",
                  type: "NumberLiteral",
                },
              },
            },
            pos: {
              start: 73,
              end: 83,
            },
          },
        },
        then: [
          {
            type: "UmlText",
            text: "Alice -> Bob : yes",
            pos: {
              start: 84,
              end: 102,
            },
          },
        ],
        else: [
          [
            {
              type: "UmlText",
              text: "Alice -> Bob : This should not appear",
              pos: {
                start: 109,
                end: 146,
              },
            },
          ],
        ],
        pos: {
          start: 50,
          end: 153,
        },
      },
      {
        type: "UmlText",
        text: "Alice -> Bob : B",
        pos: {
          start: 154,
          end: 170,
        },
      },
      {
        type: "UmlText",
        text: "@enduml",
        pos: {
          start: 171,
          end: 178,
        },
      },
    ],
    sourceString:
      '@startuml\n!$a = 10\n!$ijk = "foo"\nAlice -> Bob : A\n!if ($ijk == "foo") && ($a+10>=4)\nAlice -> Bob : yes\n!else\nAlice -> Bob : This should not appear\n!endif\nAlice -> Bob : B\n@enduml',
    pos: {
      start: 0,
      end: 178,
    },
  };
  const ast = parse(input);
  expect(ast).toEqual(output);
});

it("!function", () => {
  const input = String.raw`!function $double($a=1,$b="3", $c=4)
!return $a + $a
!endfunction`;
  const output = {
    type: "Root",
    children: [
      {
        name: {
          type: "Identifier",
          name: "$double",
          pos: {
            start: 10,
            end: 17,
          },
        },
        type: "FunctionDeclaration",
        pos: {
          start: 0,
          end: 65,
        },
        statements: [
          {
            type: "ReturnStatement",
            expression: {
              type: "BinaryExpression",
              left: {
                type: "Identifier",
                name: "$a",
                pos: {
                  start: 45,
                  end: 47,
                },
              },
              operator: {
                kind: "+",
                pos: {
                  end: 49,
                  start: 48,
                },
                type: "BinaryOperatorToken",
              },
              pos: {
                start: 45,
                end: 52,
              },
              right: {
                type: "Identifier",
                name: "$a",
                pos: {
                  start: 50,
                  end: 52,
                },
              },
            },
            pos: {
              start: 37,
              end: 52,
            },
          },
        ],
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$a",
              pos: {
                start: 18,
                end: 20,
              },
            },
            pos: {
              start: 18,
              end: 22,
            },
            init: {
              type: "NumberLiteral",
              text: "1",
              pos: {
                start: 21,
                end: 22,
              },
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$b",
              pos: {
                start: 23,
                end: 25,
              },
            },
            pos: {
              start: 23,
              end: 29,
            },
            init: {
              type: "StringLiteral",
              text: "3",
              pos: {
                start: 26,
                end: 29,
              },
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$c",
              pos: {
                start: 31,
                end: 33,
              },
            },
            pos: {
              start: 31,
              end: 35,
            },
            init: {
              type: "NumberLiteral",
              text: "4",
              pos: {
                start: 34,
                end: 35,
              },
            },
          },
        ],
      },
    ],
    sourceString:
      '!function $double($a=1,$b="3", $c=4)\n!return $a + $a\n!endfunction',
    pos: {
      start: 0,
      end: 65,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("!procedure", () => {
  const input = String.raw`!procedure msg($source, $destination)
$source --> $destination
!endprocedure`;
  const output = {
    type: "Root",
    children: [
      {
        name: {
          type: "Identifier",
          name: "msg",
          pos: {
            start: 11,
            end: 14,
          },
        },
        type: "ProcedureDeclaration",
        pos: {
          start: 0,
          end: 76,
        },
        statements: [
          {
            type: "UmlText",
            text: "$source --> $destination",
            pos: {
              start: 38,
              end: 62,
            },
          },
        ],
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$source",
              pos: {
                start: 15,
                end: 22,
              },
            },
            pos: {
              start: 15,
              end: 22,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$destination",
              pos: {
                start: 24,
                end: 36,
              },
            },
            pos: {
              start: 24,
              end: 36,
            },
          },
        ],
      },
    ],
    sourceString:
      "!procedure msg($source, $destination)\n$source --> $destination\n!endprocedure",
    pos: {
      start: 0,
      end: 76,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("inline function", () => {
  const input = String.raw`!function $double($a) return $a + $a`;
  const output = {
    type: "Root",
    children: [
      {
        name: {
          type: "Identifier",
          name: "$double",
          pos: {
            start: 10,
            end: 17,
          },
        },
        type: "InlineFunctionDeclaration",
        pos: {
          start: 0,
          end: 36,
        },
        return: {
          type: "BinaryExpression",
          left: {
            type: "Identifier",
            name: "$a",
            pos: {
              start: 29,
              end: 31,
            },
          },
          operator: {
            kind: "+",
            pos: {
              end: 33,
              start: 32,
            },
            type: "BinaryOperatorToken",
          },
          pos: {
            start: 29,
            end: 36,
          },
          right: {
            type: "Identifier",
            name: "$a",
            pos: {
              start: 34,
              end: 36,
            },
          },
        },
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$a",
              pos: {
                start: 18,
                end: 20,
              },
            },
            pos: {
              start: 18,
              end: 20,
            },
          },
        ],
      },
    ],
    sourceString: "!function $double($a) return $a + $a",
    pos: {
      start: 0,
      end: 36,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("unquoted function", () => {
  const input = String.raw`!unquoted function id($text1, $text2="FOO") return $text1 + $text2`;
  const output = {
    type: "Root",
    children: [
      {
        name: {
          type: "Identifier",
          name: "id",
          pos: {
            start: 19,
            end: 21,
          },
        },
        unquoted: true,
        type: "InlineFunctionDeclaration",
        pos: {
          start: 0,
          end: 66,
        },
        return: {
          type: "BinaryExpression",
          left: {
            type: "Identifier",
            name: "$text1",
            pos: {
              start: 51,
              end: 57,
            },
          },
          operator: {
            kind: "+",
            pos: {
              end: 59,
              start: 58,
            },
            type: "BinaryOperatorToken",
          },
          pos: {
            start: 51,
            end: 66,
          },
          right: {
            type: "Identifier",
            name: "$text2",
            pos: {
              start: 60,
              end: 66,
            },
          },
        },
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$text1",
              pos: {
                start: 22,
                end: 28,
              },
            },
            pos: {
              start: 22,
              end: 28,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "$text2",
              pos: {
                start: 30,
                end: 36,
              },
            },
            pos: {
              start: 30,
              end: 42,
            },
            init: {
              type: "StringLiteral",
              text: "FOO",
              pos: {
                start: 37,
                end: 42,
              },
            },
          },
        ],
      },
    ],
    sourceString:
      '!unquoted function id($text1, $text2="FOO") return $text1 + $text2',
    pos: {
      start: 0,
      end: 66,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("While loop", () => {
  const input = String.raw`  !while $arg!=0
    [Component $arg] as $arg
    !$arg = $arg - 1
  !endwhile`;
  const output = {
    type: "Root",
    children: [
      {
        type: "WhileStatement",
        expression: {
          type: "BinaryExpression",
          left: {
            type: "Identifier",
            name: "$arg",
            pos: {
              start: 9,
              end: 13,
            },
          },
          operator: {
            kind: "!=",
            pos: {
              end: 15,
              start: 13,
            },
            type: "BinaryOperatorToken",
          },
          pos: {
            start: 9,
            end: 16,
          },
          right: {
            type: "NumberLiteral",
            text: "0",
            pos: {
              start: 15,
              end: 16,
            },
          },
        },
        statements: [
          {
            type: "UmlText",
            text: "[Component $arg] as $arg",
            pos: {
              start: 21,
              end: 45,
            },
          },
          {
            type: "VariableDeclaration",
            init: {
              type: "BinaryExpression",
              left: {
                type: "Identifier",
                name: "$arg",
                pos: {
                  start: 58,
                  end: 62,
                },
              },
              operator: {
                kind: "-",
                pos: {
                  end: 64,
                  start: 63,
                },
                type: "BinaryOperatorToken",
              },
              pos: {
                start: 58,
                end: 66,
              },
              right: {
                type: "NumberLiteral",
                text: "1",
                pos: {
                  start: 65,
                  end: 66,
                },
              },
            },
            name: {
              type: "Identifier",
              name: "$arg",
              pos: {
                start: 51,
                end: 55,
              },
            },
            pos: {
              start: 50,
              end: 66,
            },
          },
        ],
        pos: {
          start: 2,
          end: 78,
        },
      },
    ],
    sourceString:
      "!while $arg!=0\n    [Component $arg] as $arg\n    !$arg = $arg - 1\n  !endwhile",
    pos: {
      start: 2,
      end: 78,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("include", () => {
  const input = String.raw`!include <aws/common>
!include https://a.b.com/a.puml
!include ../a.puml!part1`;
  const output = {
    type: "Root",
    children: [
      {
        type: "IncludeStatement",
        path: "aws/common",
        token: "include",
        pos: {
          start: 0,
          end: 21,
        },
        std: true,
      },
      {
        type: "IncludeStatement",
        path: "https://a.b.com/a.puml",
        token: "include",
        pos: {
          start: 22,
          end: 53,
        },
        std: false,
      },
      {
        type: "IncludeStatement",
        path: "../a.puml",
        token: "include",
        pos: {
          start: 54,
          end: 78,
        },
        std: false,
        subpart: "part1",
      },
    ],
    sourceString:
      "!include <aws/common>\n!include https://a.b.com/a.puml\n!include ../a.puml!part1",
    pos: {
      start: 0,
      end: 78,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("scope var", () => {
  const input = String.raw`
!local $ELEMENT_FONT_COLOR = "#FFFFFF"
!global $ARROW_COLOR = "#666666"
`;
  const output = {
    type: "Root",
    children: [
      {
        type: "VariableDeclaration",
        init: {
          type: "StringLiteral",
          text: "#FFFFFF",
          pos: {
            start: 30,
            end: 39,
          },
        },
        name: {
          type: "Identifier",
          name: "$ELEMENT_FONT_COLOR",
          pos: {
            start: 8,
            end: 27,
          },
        },
        pos: {
          start: 1,
          end: 39,
        },
        scope: "global",
      },
      {
        type: "VariableDeclaration",
        init: {
          type: "StringLiteral",
          text: "#666666",
          pos: {
            start: 63,
            end: 72,
          },
        },
        name: {
          type: "Identifier",
          name: "$ARROW_COLOR",
          pos: {
            start: 48,
            end: 60,
          },
        },
        pos: {
          start: 40,
          end: 72,
        },
        scope: "global",
      },
    ],
    sourceString:
      '!local $ELEMENT_FONT_COLOR = "#FFFFFF"\n!global $ARROW_COLOR = "#666666"\n',
    pos: {
      start: 1,
      end: 73,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("callExpression", () => {
  const input = String.raw`
    %strlen($tags)
    $xx(3, "x")
    $yy()
  `;
  const output = {
    type: "Root",
    children: [
      {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          name: {
            type: "Identifier",
            name: "strlen",
            pos: {
              start: 6,
              end: 12,
            },
          },
          buildIn: true,
          args: [
            {
              type: "Identifier",
              name: "$tags",
              pos: {
                start: 13,
                end: 18,
              },
            },
          ],
          pos: {
            start: 5,
            end: 19,
          },
        },
        pos: {
          start: 5,
          end: 19,
        },
      },
      {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          name: {
            type: "Identifier",
            name: "$xx",
            pos: {
              start: 24,
              end: 27,
            },
          },
          args: [
            {
              type: "NumberLiteral",
              text: "3",
              pos: {
                start: 28,
                end: 29,
              },
            },
            {
              type: "StringLiteral",
              text: "x",
              pos: {
                start: 31,
                end: 34,
              },
            },
          ],
          pos: {
            start: 24,
            end: 35,
          },
        },
        pos: {
          start: 24,
          end: 35,
        },
      },
      {
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          name: {
            type: "Identifier",
            name: "$yy",
            pos: {
              start: 40,
              end: 43,
            },
          },
          args: [],
          pos: {
            start: 40,
            end: 45,
          },
        },
        pos: {
          start: 40,
          end: 45,
        },
      },
    ],
    sourceString: '%strlen($tags)\n    $xx(3, "x")\n    $yy()\n  ',
    pos: {
      start: 5,
      end: 48,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("!define", () => {
  const input = String.raw`!define LAYOUT_TOP_DOWN top to bottom direction
  !define AWSCLI(e_alias, e_label, e_techn, e_descr) AWSEntity(e_alias, e_label, e_techn, e_descr, #CC2264, AWSCLI, AWSCLI)
  `;
  const output = {
    type: "Root",
    children: [
      {
        type: "DefineStatement",
        name: {
          type: "Identifier",
          name: "LAYOUT_TOP_DOWN",
          pos: {
            start: 8,
            end: 23,
          },
        },
        content: "top to bottom direction",
        pos: {
          start: 0,
          end: 47,
        },
      },
      {
        type: "DefineStatement",
        name: {
          type: "Identifier",
          name: "AWSCLI",
          pos: {
            start: 58,
            end: 64,
          },
        },
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_alias",
              pos: {
                start: 65,
                end: 72,
              },
            },
            pos: {
              start: 65,
              end: 72,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_label",
              pos: {
                start: 74,
                end: 81,
              },
            },
            pos: {
              start: 74,
              end: 81,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_techn",
              pos: {
                start: 83,
                end: 90,
              },
            },
            pos: {
              start: 83,
              end: 90,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_descr",
              pos: {
                start: 92,
                end: 99,
              },
            },
            pos: {
              start: 92,
              end: 99,
            },
          },
        ],
        content:
          "AWSEntity(e_alias, e_label, e_techn, e_descr, #CC2264, AWSCLI, AWSCLI)",
        pos: {
          start: 50,
          end: 171,
        },
      },
    ],
    sourceString:
      "!define LAYOUT_TOP_DOWN top to bottom direction\n  !define AWSCLI(e_alias, e_label, e_techn, e_descr) AWSEntity(e_alias, e_label, e_techn, e_descr, #CC2264, AWSCLI, AWSCLI)\n  ",
    pos: {
      start: 0,
      end: 174,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("!definelong", () => {
  const input = String.raw`!definelong AzureEntity(e_alias, e_label, e_techn, e_color, e_sprite, e_stereo)
rectangle "==e_label\n<color:e_color><$e_sprite></color>\n//<size:TECHN_FONT_SIZE>[e_techn]</size>//" <<e_stereo>> as e_alias
!enddefinelong
`;
  const output = {
    type: "Root",
    children: [
      {
        type: "DefineLongStatement",
        name: {
          type: "Identifier",
          name: "AzureEntity",
          pos: {
            start: 12,
            end: 23,
          },
        },
        arguments: [
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_alias",
              pos: {
                start: 24,
                end: 31,
              },
            },
            pos: {
              start: 24,
              end: 31,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_label",
              pos: {
                start: 33,
                end: 40,
              },
            },
            pos: {
              start: 33,
              end: 40,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_techn",
              pos: {
                start: 42,
                end: 49,
              },
            },
            pos: {
              start: 42,
              end: 49,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_color",
              pos: {
                start: 51,
                end: 58,
              },
            },
            pos: {
              start: 51,
              end: 58,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_sprite",
              pos: {
                start: 60,
                end: 68,
              },
            },
            pos: {
              start: 60,
              end: 68,
            },
          },
          {
            type: "Argument",
            name: {
              type: "Identifier",
              name: "e_stereo",
              pos: {
                start: 70,
                end: 78,
              },
            },
            pos: {
              start: 70,
              end: 78,
            },
          },
        ],
        statements: [
          {
            type: "UmlText",
            text: 'rectangle "==e_label\\n<color:e_color><$e_sprite></color>\\n//<size:TECHN_FONT_SIZE>[e_techn]</size>//" <<e_stereo>> as e_alias',
            pos: {
              start: 80,
              end: 205,
            },
          },
        ],
        pos: {
          start: 0,
          end: 220,
        },
      },
    ],
    sourceString:
      '!definelong AzureEntity(e_alias, e_label, e_techn, e_color, e_sprite, e_stereo)\nrectangle "==e_label\\n<color:e_color><$e_sprite></color>\\n//<size:TECHN_FONT_SIZE>[e_techn]</size>//" <<e_stereo>> as e_alias\n!enddefinelong\n',
    pos: {
      start: 0,
      end: 221,
    },
  };
  expect(parse(input)).toEqual(output);
});

it("UMLSpriteStatement", () => {
  const input = String.raw`
 sprite $bug [15x15/16z] PKzR2i0m2BFMi15p__FEjQEqB1z27aeqCqixa8S4OT7C53cKpsHpaYPDJY_12MHM-BLRyywPhrrlw3qumqNThmXgd1TOterAZmOW8sgiJafogofWRwtV3nCF
 sprite $printer [15x15/8z] NOtH3W0W208HxFz_kMAhj7lHWpa1XC716sz0Pq4MVPEWfBHIuxP3L6kbTcizR8tAhzaqFvXwvFfPEqm0
 sprite $disk {
   444445566677881
   436000000009991
   43600000000ACA1
   53700000001A7A1
   53700000012B8A1
   53800000123B8A1
   63800001233C9A1
   634999AABBC99B1
   744566778899AB1
   7456AAAAA99AAB1
   8566AFC228AABB1
   8567AC8118BBBB1
   867BD4433BBBBB1
   39AAAAABBBBBBC1
}
sprite foo1 <svg viewBox="0 0 36 36">
<path fill="#77B255" d="M36 32c0 2.209-1.791 4-4 4H4c-2.209 0-4-1.791-4-4V4c0-2.209 1.791-4 4-4h28c2.209 0 4 1.791 4 4v28z"/>
<path fill="#FFF" d="M21.529 18.006l8.238-8.238c.977-.976.977-2.559 0-3.535-.977-.977-2.559-.977-3.535 0l-8.238 8.238-8.238-8.238c-.976-.977-2.56-.977-3.535 0-.977.976-.977 2.559 0 3.535l8.238 8.238-8.258 8.258c-.977.977-.977 2.559 0 3.535.488.488 1.128.732 1.768.732s1.28-.244 1.768-.732l8.258-8.259 8.238 8.238c.488.488 1.128.732 1.768.732s1.279-.244 1.768-.732c.977-.977.977-2.559 0-3.535l-8.24-8.237z"/>
</svg>
  `;
  const { children } = parse(input);
  expect(children.length).toBe(4);
  expect(
    children.map((statement) => {
      const s = statement as unknown as UMLSpriteStatement;
      return s.name.name;
    })
  ).toEqual(["$bug", "$printer", "$disk", "foo1"]);
  expect(children[0]).toHaveProperty("spec", "15x15/16z");
});

it("!define argument identifier starts with _", () => {
  const input = `@startuml
!define FA5_AD(_alias) ENTITY(rectangle,black,ad,_alias,FA5 AD)
@enduml`;

  const { children } = parse(input);
  const def = children[1] as any;
  const name = def.arguments[0].name.name;
  expect(name).toBe("_alias");
});
