import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { PUmlExtension } from "../src";

const plantumlEncoder = require("plantuml-encoder");

function App() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [imgUri, setImgUri] = useState("");
  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current!, {
      language: "plantuml",
    });
    const worker = new Worker(
      new URL("../src/puml.worker.ts", import.meta.url)
    );
    const extension = new PUmlExtension(worker);
    const disposer = extension.active(editor);

    editor.onDidChangeModelContent((e) => {
      const content = editor.getModel()?.getValue() || "";
      const encoded = plantumlEncoder.encode(content);
      setImgUri("http://www.plantuml.com/plantuml/png/" + encoded);
    });
    return () => {
      disposer.dispose();
    };
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div ref={editorRef} style={{ width: "50%", height: "100vh" }}></div>
      <div style={{ width: "50%" }}>
        <img src={imgUri}></img>
      </div>
    </div>
  );
}

export default App;
