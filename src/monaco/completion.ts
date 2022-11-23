import * as monaco from "monaco-editor";
import { findPreviousMatch, getFenceContent, isInFence } from "./utils";
import { call } from "../worker/ipc";
import { allkeywords, preprocessor } from "./hightlight";
import { preprocessSnippets } from "./snippets";
import type { PUmlService } from "../service";

function alphabet(from: string, to: string) {
  const charF = from.charCodeAt(0);
  const charT = from.charCodeAt(0);
  const arr: string[] = [];
  for (let char = charF; char <= charT; char++) {
    arr.push(String.fromCharCode(char));
  }
  return arr;
}

const ALL_THEMES = [
  "_none_",
  "amiga",
  "aws-orange",
  "black-knight",
  "bluegray",
  "blueprint",
  "carbon-gray",
  "cerulean",
  "cerulean-outline",
  "crt-amber",
  "crt-green",
  "cyborg",
  "cyborg-outline",
  "hacker",
  "lightgray",
  "mars",
  "materia",
  "materia-outline",
  "metal",
  "mimeograph",
  "minty",
  "plain",
  "reddress-darkblue",
  "reddress-darkgreen",
  "reddress-darkorange",
  "reddress-darkred",
  "reddress-lightblue",
  "reddress-lightgreen",
  "reddress-lightorange",
  "reddress-lightred",
  "sandstone",
  "silver",
  "sketchy",
  "sketchy-outline",
  "spacelab",
  "spacelab-white",
  "superhero",
  "superhero-outline",
  "toy",
  "united",
  "vibrant",
];

class UMLCompletionItemProvider
  implements monaco.languages.CompletionItemProvider
{
  service: PUmlService;
  constructor(service: PUmlService) {
    this.service = service;
  }

  preprocessorItems(
    lineTextBefore: string,
    position: monaco.Position
  ): monaco.languages.CompletionItem[] {
    const startIndex = lineTextBefore.lastIndexOf("!");
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 1,
      position.lineNumber,
      position.column
    );
    const items = Object.values(preprocessSnippets)
      .filter((snippet) => {
        return snippet.prefix.includes(lineTextBefore);
      })
      .map((snippet) => {
        return {
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: snippet.body,
          range,
          label: snippet.label,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        };
      });
    return items;
  }

  async includeItems(
    lineTextBefore: string,
    position: monaco.Position
  ): Promise<monaco.languages.CompletionItem[]> {
    const startIndex = lineTextBefore.lastIndexOf("<");
    const range = new monaco.Range(
      position.lineNumber,
      startIndex + 2,
      position.lineNumber,
      position.column
    );

    const modules = await this.service.stdModules();
    return modules.map((m) => ({
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: m,
      range,
      label: m,
    }));
  }

  completeTheme(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const prevSpace = findPreviousMatch(model, position, /\s+/);
    if (!prevSpace) {
      return;
    }
    const range = new monaco.Range(
      position.lineNumber,
      prevSpace.range.endColumn,
      position.lineNumber,
      position.column
    );
    return {
      suggestions: ALL_THEMES.map((theme) => ({
        kind: monaco.languages.CompletionItemKind.Color,
        insertText: theme,
        range,
        label: "" + theme,
      })),
    };
  }

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken
  ) {
    const isMarkdown = model.getLanguageId() === "markdown";

    if (isMarkdown && !isInFence(model, position, "plantuml")) {
      return;
    }

    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);

    if (context.triggerCharacter === "!") {
      const startIndex = lineTextBefore.lastIndexOf("!");
      const r = new monaco.Range(
        position.lineNumber,
        startIndex + 1,
        position.lineNumber,
        position.column
      );
      return {
        suggestions: preprocessor.map((pre) => {
          return {
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: pre + " ",
            range: r,
            label: pre,
          };
        }),
      };
    }

    if (/!include\s*</.test(lineTextBefore)) {
      return this.includeItems(lineTextBefore, position).then((items) => {
        return { suggestions: items };
      });
    }

    if (/!theme\s+/.test(lineTextBefore)) {
      return this.completeTheme(model, position);
    }

    const fence = getFenceContent(model, position);

    const res = /([$a-zA-Z0-9_]+?)\(/.exec(lineTextBefore);
    if (res) {
      let startIndex = lineTextBefore.lastIndexOf("(");
      const cIndex = lineTextBefore.lastIndexOf(",");
      if (cIndex > startIndex) {
        startIndex = cIndex;
      }
      const r = new monaco.Range(
        position.lineNumber,
        startIndex + 2,
        position.lineNumber,
        position.column
      );
      return this.service.findCallableNode(fence, res[1]).then((node) => {
        return {
          suggestions:
            node?.arguments.map((arg) => ({
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: arg.name.name + "=",
              label: arg.name.name,
              range: r,
            })) || [],
        };
      });
    }

    if (/^\s*![^\s]*/.test(lineTextBefore)) {
      return { suggestions: this.preprocessorItems(lineTextBefore, position) };
    }

    const r = new monaco.Range(
      position.lineNumber,
      position.column - 1,
      position.lineNumber,
      position.column
    );
    const keywords = allkeywords.map((kw) => ({
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: kw,
      range: r,
      label: kw,
    }));
    const callableSymbols = await this.service.callableSymbols(fence);
    const variableSymbols = await this.service.variableSymbols(fence);
    const suggestions = [
      ...callableSymbols.map((name) => ({
        kind: monaco.languages.CompletionItemKind.Method,
        insertText: name,
        label: name,
        range: r,
      })),
      ...variableSymbols.map((name) => ({
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: name,
        label: name,
        range: r,
      })),
      ...keywords,
    ];
    return {
      suggestions,
    };
  }

  triggerCharacters = alphabet("a", "z")
    .concat(alphabet("A", "Z"))
    .concat(["$", "/", "!", "<", "(", ",", "@"]);
}

export default UMLCompletionItemProvider;