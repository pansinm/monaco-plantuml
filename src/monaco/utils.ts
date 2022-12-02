import { findLastIndex } from "lodash";
import * as monaco from "monaco-editor";

type Matcher = RegExp | string | ((text: string) => boolean);

export function getCurrentRange(editor: monaco.editor.ICodeEditor) {
  const selection = editor?.getSelection();
  if (selection) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } =
      selection;
    return new monaco.Range(
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn
    );
  }
  return undefined;
}

export function isTextMatch(text: string, matcher: Matcher) {
  if (typeof matcher === "string") {
    return text.includes(matcher);
  }
  if (matcher instanceof RegExp) {
    return matcher.test(text);
  }
  return matcher(text);
}

export function getTextBefore(
  model: monaco.editor.ITextModel,
  position: monaco.Position
) {
  const beforeRange = new monaco.Range(
    1,
    1,
    position.lineNumber,
    position.column
  );
  return model.getValueInRange(beforeRange);
}

export function getTextAfter(
  model: monaco.editor.ITextModel,
  position: monaco.Position
) {
  const modelRange = model.getFullModelRange();
  const afterRange = new monaco.Range(
    position.lineNumber,
    position.column,
    modelRange.endLineNumber,
    modelRange.endColumn
  );
  return model.getValueInRange(afterRange);
}

export function isPositionMatch(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  [beforeMather, afterMatcher]: [Matcher, Matcher]
) {
  const beforeText = getTextBefore(model, position);
  const afterText = getTextAfter(model, position);
  return (
    isTextMatch(beforeText, beforeMather) &&
    isTextMatch(afterText, afterMatcher)
  );
}

export function isInFence(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  lang: string
) {
  const prev = model.findPreviousMatch(
    "```",
    position,
    false,
    true,
    null,
    false
  );
  const next = model.findNextMatch("```", position, false, true, null, false);
  const openLine = prev?.range.startLineNumber;
  const closeLine = next?.range.startLineNumber;
  if (openLine && closeLine) {
    let firstLine = model.getLineContent(openLine);
    const lastLine = model.getLineContent(closeLine);
    if (openLine === position.lineNumber) {
      firstLine = firstLine.slice(0, position.column);
    }

    return (
      firstLine.trim().startsWith("```" + lang) && lastLine.trim() === "```"
    );
  }
  return false;
}

export function getFenceContent(
  model: monaco.editor.ITextModel,
  position: monaco.Position
) {
  const beforeText = getTextBefore(model, position);
  const afterText = getTextAfter(model, position);
  const beforeIndex = beforeText.lastIndexOf("```");
  const afterIndex = afterText.indexOf("```");
  return (
    beforeText
      .slice(beforeIndex)
      .replace(/```.*?\n/, "")
      .trimStart() + afterText.slice(0, afterIndex).trimEnd()
  );
}

export function findPreviousMatch(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  searchString: string | RegExp
) {
  const isReg = searchString instanceof RegExp;
  const match = model.findPreviousMatch(
    isReg ? searchString.source : searchString,
    position,
    isReg,
    true,
    null,
    false
  );
  return match;
}

export function parseCallExpression(lineTextBefore: string) {
  const reg = /([$a-zA-Z0-9_]+?)\(([^)]*)$/;
  const res = reg.exec(lineTextBefore);
  if (!res) {
    return null;
  }
  return {
    name: res[1],
    params: res[2].split(",").map((item) => item.trim()),
  };
}

export function buildCompletionItems(
  symbols: string[],
  kind: monaco.languages.CompletionItemKind,
  range: monaco.Range
): monaco.languages.CompletionItem[] {
  return symbols.map((symbol) => ({
    kind,
    range,
    insertText: symbol,
    label: symbol,
  }));
}

export function getLineTextBefore(
  model: monaco.editor.ITextModel,
  position: monaco.Position
) {
  return model
    .getLineContent(position.lineNumber)
    .slice(0, position.column - 1);
}

export function getPlantUMLContent(model: monaco.editor.ITextModel, position: monaco.Position) {
  if (['puml', 'plantuml'].includes(model.getLanguageId())) {
    return model.getValue();
  }
  if(model.getLanguageId() === 'markdown' && isInFence(model, position, 'plantuml')) {
    return getFenceContent(model, position);
  }
  throw new Error('Not plantuml');
}