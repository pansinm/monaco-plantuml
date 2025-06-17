import type * as monaco from "monaco-editor";
import type { PUmlService } from "../service";
import { getFenceContent } from "./utils";

export class PumlSignatureHelpProvider
  implements monaco.languages.SignatureHelpProvider
{
  signatureHelpTriggerCharacters?: readonly string[] | undefined = ["(", ","];
  signatureHelpRetriggerCharacters?: readonly string[] | undefined = [","];

  service: PUmlService;
  constructor(service: PUmlService) {
    this.service = service;
  }

  async provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken,
    context: monaco.languages.SignatureHelpContext
  ): Promise<monaco.languages.SignatureHelpResult | null | undefined> {
    const fence =
      model.getLanguageId() === "markdown"
        ? getFenceContent(model, position)
        : model.getValue();

    const lineTextBefore = model
      .getLineContent(position.lineNumber)
      .slice(0, position.column - 1);
    const res = /([$a-zA-Z0-9_]+?)\(([^)]*)$/.exec(lineTextBefore);
    const name = res?.[1];
    const params = res?.[2];
    const node = name && (await this.service.findCallableNode(fence, name));
    if (node) {
      const activeIndex = (params?.split(",").length || 1) - 1;
      const parameters = node.arguments.map((arg: any) => ({
        label: arg.name.name,
        documentation: {
          value: `${node.name.name}(${node.arguments
            .map((arg, index) => {
              const text = `${arg.name.name}${
                arg.init ? "=" + JSON.stringify((arg.init as any).text) : ""
              }`;
              return index === activeIndex ? `**${text}**` : text;
            })
            .join(", ")})`,
        },
      }));

      return {
        value: {
          activeParameter: activeIndex,
          activeSignature: 0,
          signatures: [
            {
              label: node.name.name,
              parameters: parameters,
              activeParameter: activeIndex,
            },
          ],
        },
        dispose() {
          // nothing
        },
      };
    }
  }
}
