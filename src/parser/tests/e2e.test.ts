import fs from "fs";
import path from "path";
import { parse } from "../parser";

const getAllFiles = function (dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

let allFiles = getAllFiles("./plantuml-stdlib").filter((file) =>
  file.endsWith(".puml")
);

if (!process.env.E2E) {
  allFiles = allFiles.slice(Math.round(allFiles.length * Math.random())).slice(0, 300)
}

describe("parse stdlib", () => {
  for (let file of allFiles) {
    it("parse: " + file, () => {
      const content = fs.readFileSync(
        path.resolve(__dirname, "../../../", file),
        "utf-8"
      );
      try {
        parse(content);
      } catch (err) {
        console.error("parse failed:", err, content);
        throw err;
      }
    });
  }
});
