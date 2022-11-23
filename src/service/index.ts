import PUmlFile from "./PUmlFile";
import stdlib from "./stdlib";

export class PUmlService {
  /**
   * 所有可调用函数
   */
  async callableSymbols(puml: string) {
    const file = new PUmlFile(puml);
    file.parse();
    return file.allCallableNodes().map((node) => node.name.name);
  }

  /**
   * 函数参数
   */
  async findCallableNode(puml: string, callableName: string) {
    const file = new PUmlFile(puml);
    file.parse();
    return file.findCallableNode(callableName);
  }

  async variableSymbols(puml: string) {
    const file = new PUmlFile(puml);
    file.parse();
    return file.allVariableNodes().map((node) => node.name.name);
  }

  async stdModules() {
    return stdlib.modules.map((m) => m.path.replace(/\.puml$/, ""));
  }
}

export default new PUmlService();
