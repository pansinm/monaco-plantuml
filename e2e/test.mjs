import fs from "fs";
import path from "path";
import parser from "../lib/parser/parser.js";

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

const allFiles = getAllFiles("./plantuml-stdlib").filter((file) =>
  file.endsWith(".puml")
);

for (let file in allFiles) {
  const content = fs.readFileSync(file, "utf-8");
  parser.parse(content);
  console.log("parse files success:", file);
}
console.log("done!");
