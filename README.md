# monaco-plantuml

monaco editor extension for PlantUML with better intellisense

![](./screenshot.gif)

[Online Demo](https://pansinm.github.io/monaco-plantuml/)

## Installation

```bash
yarn add @sinm/monaco-plantuml
```

## Usage

```ts
import { PUmlExtension, setMonacoInstance } from '@sinm/monaco-plantuml';

setMonacoInstance(monaco);

const extension = new PUmlExtension();

const disposer = extension.active(editor);

// when destroyed
disposer.dispose();
```
## Run with web worker

### webpack 5
1. create  `puml.worker.ts` file in current directory

```ts
// editor/puml.worker.ts
import '@sinm/monaco-plantuml/lib/puml.worker'
```

2. user worker in `editor.ts` file
```ts
// editor/editor.ts
import { PUmlExtension } from '@sinm/monaco-plantuml';
const worker = new Worker(new URL('./puml.worker.ts', import.meta.url));
const extension = new PUmlExtension(worker);
```

### vite
```ts
import { PUmlExtension } from '@sinm/monaco-plantuml';
import PUmlWorker from '@sinm/monaco-plantuml/lib/puml.worker?worker';
// relative
const worker = new PUmlWorker();
const extension = new PUmlExtension(worker);
```
