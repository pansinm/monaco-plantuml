import type { PUmlService } from "../service";
import { call } from "../ipc";

class WorkerAdapter implements PUmlService {
  private worker: Worker;
  constructor(worker: Worker) {
    this.worker = worker;
  }
  localSymbols(puml: string): Promise<string[]> {
    return call(this.worker, 'localSymbols', puml);
  }
  findCallableNode(puml: string, callableName: string) {
    return call(this.worker, "findCallableNode", puml, callableName);
  }

  callableSymbols(puml: string) {
    return call(this.worker, "callableSymbols", puml);
  }
  variableSymbols(puml: string): Promise<string[]> {
    return call(this.worker, "variableSymbols", puml);
  }
  stdModules(): Promise<string[]> {
    return call(this.worker, "stdModules");
  }
}

export default WorkerAdapter;
