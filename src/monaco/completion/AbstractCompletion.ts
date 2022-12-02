import * as monaco from "monaco-editor";
import { PUmlService } from "../../service";

abstract class AbstractCompletion {
  service: PUmlService;
  constructor(service: PUmlService) {
    this.service = service;
  }

  isMatch(model: monaco.editor.ITextModel, position: monaco.Position): boolean | Promise<boolean> {
    throw new Error("Not implement yet!");
  }

  async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.ProviderResult<monaco.languages.CompletionList>> {
    throw new Error("Not implement yet!");
  }
}

export default AbstractCompletion;