import type * as monaco from "monaco-editor";
import {
  buildCompletionItems,
  getFenceContent,
  getLineTextBefore,
} from "../utils";
import AbstractCompletion from "./AbstractCompletion";
import { getMonacoInstance } from "../../monaco";

class NormalSpriteCompletion extends AbstractCompletion {
  isMatch(model: monaco.editor.ITextModel, position: monaco.Position) {
    const lineTextBefore = getLineTextBefore(model, position);
    return /\<\$[0-9a-zA-Z]*$/.test(lineTextBefore);
  }

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.ProviderResult<monaco.languages.CompletionList>> {
    const _monaco = getMonacoInstance();
    const puml =
      model.getLanguageId() === "markdown"
        ? getFenceContent(model, position)
        : model.getValue();
    const sprites = await this.service.findSpriteSymbols(puml);
    const findMatch = model.findPreviousMatch(
      "$",
      position,
      false,
      true,
      null,
      true
    );
    if (findMatch?.range) {
      const { startLineNumber, startColumn } = findMatch.range;
      const range = new _monaco.Range(
        startLineNumber,
        startColumn + 1,
        position.lineNumber,
        position.column
      );
      return {
        suggestions: buildCompletionItems(
          sprites,
          _monaco.languages.CompletionItemKind.Color,
          range
        ),
      };
    }
  }
}

export default NormalSpriteCompletion;
