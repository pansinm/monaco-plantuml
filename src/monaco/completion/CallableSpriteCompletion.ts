import {
  editor,
  Position,
  languages,
  CancellationToken,
  Range,
} from "monaco-editor";
import {
  buildCompletionItems,
  findPreviousMatch,
  getLineTextBefore,
  getPlantUMLContent,
  parseCallExpression,
} from "../utils";
import AbstractCompletion from "./AbstractCompletion";

class CallableSpriteCompletion extends AbstractCompletion {
  async isMatch(model: editor.ITextModel, position: Position) {
    const lineTextBefore = getLineTextBefore(model, position);
    const exp = parseCallExpression(lineTextBefore);
    if (!exp) {
      return false;
    }
    if (/\$sprite=[a-zA-Z0-9]*$/.test(lineTextBefore)) {
      return true;
    }
    const x = await this.service.findCallableNode(
      getPlantUMLContent(model, position),
      exp.name
    );
    if (!x) {
      return false;
    }
    if (x.arguments[exp.params.length - 1].name.name === "$sprite") {
      return true;
    }
    return false;
  }
  async provideCompletionItems(
    model: editor.ITextModel,
    position: Position,
    context: languages.CompletionContext,
    token: CancellationToken
  ): Promise<languages.ProviderResult<languages.CompletionList>> {
    const puml = getPlantUMLContent(model, position);
    const sprites = await this.service.findSpriteSymbols(puml);
    const match = findPreviousMatch(model, position, /=|\s|,/);
    const startPos = match
      ? new Position(match.range.startLineNumber, match.range.startColumn + 1)
      : position;
    const range = new Range(
      startPos.lineNumber,
      startPos.column,
      position.lineNumber,
      position.column
    );
    return {
      suggestions: buildCompletionItems(
        sprites.map((sprite) => JSON.stringify(sprite)),
        languages.CompletionItemKind.Color,
        range
      ),
    };
  }
}

export default CallableSpriteCompletion;
