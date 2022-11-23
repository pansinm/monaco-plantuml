import type * as monaco from "monaco-editor";
import { parse, traverse } from "../parser/parser";
import type {
  DefineLongStatement,
  DefineStatement,
  FunctionDeclaration,
  IncludeStatement,
  InlineFunctionDeclaration,
  ProcedureDeclaration,
  Root,
  VariableDeclaration,
} from "../parser/PreprocessorAst";
import stdlib from "./stdlib";

type CallableNode =
  | FunctionDeclaration
  | InlineFunctionDeclaration
  | ProcedureDeclaration;

class PUmlFile {
  static cache: Record<string, PUmlFile> = {};

  static create(content: string, url?: string) {
    if (!url) {
      return new PUmlFile(content);
    }
    if (!this.cache[url]) {
      this.cache[url] = new PUmlFile(content, url);
    }
    return this.cache[url];
  }

  static async fetchOrCreate(url: string) {
    if (this.cache[url]) {
      return this.cache[url];
    }
    const content = await fetch(url)
      .then((res) => res.json())
      .then((body) => body.content);
    return PUmlFile.create(atob(content), url);
  }

  includes: Record<string, PUmlFile> = {};

  variables: VariableDeclaration[] = [];

  callableNodes: CallableNode[] = [];

  ast: Root;
  url: string;
  constructor(content: string, url?: string) {
    try {
      this.ast = parse(content);
      this.url = url || "";
    } catch (err) {
      console.error(err, content);
      throw err;
    }
  }

  allCallableNodes() {
    const nodes = [...this.callableNodes];
    for (const include of Object.values(this.includes)) {
      nodes.push(...include.allCallableNodes());
    }
    return nodes;
  }

  allVariableNodes() {
    const nodes = [...this.variables];
    for (const include of Object.values(this.includes)) {
      nodes.push(...include.allVariableNodes());
    }
    return nodes;
  }

  findCallableNode(
    callableName: string
  ): CallableNode | undefined {
    let node = this.callableNodes.find((n) => n.name.name === callableName);
    if (node) {
      return node;
    }
    for (const include of Object.values(this.includes)) {
      node = include.findCallableNode(callableName);
      if (node) {
        return node;
      }
    }
    return node;
  }

  findArguments(callableName: string) {
    const callable = this.findCallableNode(callableName);
    return callable?.arguments || [];
  }

  async parse() {
    await stdlib.resolve();
    if (this.callableNodes.length || this.variables.length) {
      return;
    }
    const includes: IncludeStatement[] = [];
    traverse(this.ast, {
      VariableDeclaration: (node: VariableDeclaration) => {
        if (node.scope === "global") {
          this.variables.push(node);
        }
      },
      FunctionDeclaration: (node: FunctionDeclaration) => {
        this.callableNodes.push(node);
      },
      InlineFunctionDeclaration: (node: InlineFunctionDeclaration) => {
        this.callableNodes.push(node);
      },
      ProcedureDeclaration: (node: ProcedureDeclaration) => {
        this.callableNodes.push(node);
      },
      IncludeStatement: (node: IncludeStatement) => {
        includes.push(node);
      },
      DefineStatement: (node: DefineStatement) => {
        if (node.arguments) {
          this.callableNodes.push(node as any);
        } else {
          this.variables.push(node as any);
        }
      },
      DefineLongStatement: (node: DefineLongStatement) => {
        if (node.arguments) {
          this.callableNodes.push(node as any);
        } else {
          this.variables.push(node as any);
        }
      },
    });
    for (const inc of includes) {
      let fullurl = inc.path;
      if (inc.std) {
        fullurl = stdlib.getModule(inc.path)?.url as string;
        if (!fullurl) {
          continue;
        }
      } else if (!/https?:/.test(fullurl)) {
        fullurl = new URL(inc.path, this.url).toString();
      }
      if (!this.includes[fullurl]) {
        this.includes[fullurl] = await PUmlFile.fetchOrCreate(fullurl);
        await this.includes[fullurl].parse();
      }
    }
  }
}

export default PUmlFile;
