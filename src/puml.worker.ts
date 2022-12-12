import pumlService from "./service";
import stdlib from "./service/stdlib";

stdlib.resolve();

async function reply(data: { id: string; method: string; params: any[] }) {
  try {
    const res = await (pumlService as any)[data.method](...data.params);
    self.postMessage({
      id: data.id,
      res,
    });
  } catch (err) {
    self.postMessage({
      id: data.id,
      error: JSON.stringify(err),
    });
  }
}


self.onmessage = function (event) {
  reply(event.data);
};
