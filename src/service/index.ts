import PUmlFile from "./PUmlFile";
import stdlib from "./stdlib";

stdlib.resolve();

export class PUmlService {
  /**
   * 所有可调用函数
   */
  async callableSymbols(puml: string) {
    const file = new PUmlFile(puml);
    await file.parse();
    return file.allCallableNodes().map((node) => node.name.name);
  }

  /**
   * 函数参数
   */
  async findCallableNode(puml: string, callableName: string) {
    const file = new PUmlFile(puml);
    await file.parse();
    return file.findCallableNode(callableName);
  }

  async variableSymbols(puml: string) {
    const file = new PUmlFile(puml);
    await file.parse();
    return file
      .allGlobalVariableNodes()
      .map((node) => node.name.name)
      .concat(file.localVariables.map((v) => v.name.name));
  }
  
  async localSymbols(puml: string) {
    const file = new PUmlFile(puml);
    await file.parse();
    return file.localSymbols();
  }

  async stdModules() {
    await stdlib.resolve();
    return stdlib.modules
      .filter((m) => /\.puml$/.test(m.path) || m.type === "tree")
      .map((m) => m.path.replace(/\.puml$/, ""));
  }
}

export default new PUmlService();
