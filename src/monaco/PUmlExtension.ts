import * as monaco from "monaco-editor";
import asyncAdapter from "../adapter/asyncAdapter";
import WorkerAdapter from "../adapter/WorkerAdapter";
import type { PUmlService } from "../service";
import UMLCompletionItemProvider from "./completion";
import { PumlSignatureHelpProvider } from "./helper";
import { languageDef } from "./hightlight";

class PUmlExtension {
  private registerLanguage() {
    monaco.languages.register({
      id: "plantuml",
      filenamePatterns: ["\\.(puml|plantuml)(\\.svg)?$"],
      aliases: ["puml"],
    });
  }
  adapter: PUmlService;

  constructor(worker?: Worker) {
    this.adapter = worker ? new WorkerAdapter(worker) : asyncAdapter;
  }

  active(editor: monaco.editor.IStandaloneCodeEditor): monaco.IDisposable {
    let disposers: monaco.IDisposable[] = [];
    this.registerLanguage();

    disposers.push(
      monaco.languages.setMonarchTokensProvider("plantuml", languageDef)
    );
    
    const completionProvider = new UMLCompletionItemProvider(this.adapter);
    disposers.push(
      monaco.languages.registerCompletionItemProvider(
        "markdown",
        completionProvider
      )
    );
    disposers.push(
      monaco.languages.registerCompletionItemProvider(
        "plantuml",
        completionProvider
      )
    );

    const signature = new PumlSignatureHelpProvider(this.adapter);
    disposers.push(
      monaco.languages.registerSignatureHelpProvider("markdown", signature)
    );
    disposers.push(
      monaco.languages.registerSignatureHelpProvider("plantuml", signature)
    );
    return {
      dispose() {
        disposers.forEach((disposer) => disposer.dispose());
      },
    };
  }
}

export default PUmlExtension;
