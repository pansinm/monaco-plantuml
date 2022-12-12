import Dexie, { Table } from "dexie";

export type File = {
  id?: number;
  url: string;
  content: string;
  updatedAt: number;
};

class PUMLDB extends Dexie {
  files!: Table<File, number>;
  constructor() {
    super("PUML_DB");
    this.version(1).stores({
      files: "++id,&url,content,updatedAt",
    });
  }
}

export default new PUMLDB();
