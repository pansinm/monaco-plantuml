import type * as monaco from "monaco-editor";

let _instance = (window as any).monaco as typeof monaco | undefined;

function setMonacoInstance(m: typeof monaco) {
  if (typeof m !== "object") {
    throw new Error("monaco is not a valid object");
  }
  _instance = m;
}

function getMonacoInstance(): typeof monaco {
  if (!_instance) {
    throw new Error("monaco is not initialized");
  }
  return _instance;
}

export { setMonacoInstance, getMonacoInstance };
