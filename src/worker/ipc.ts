import uniqueId from "lodash/uniqueId";
import { PUmlService } from "../service";

export function call<T extends keyof PUmlService>(
  worker: Worker,
  method: T,
  ...params: Parameters<PUmlService[T]>
): Promise<Awaited<ReturnType<PUmlService[T]>>> {
  const reqId = uniqueId("puml-");
  return new Promise((resolve, reject) => {
    const handle = (event: MessageEvent) => {
      const { id, res, error } = event.data;
      if (id === reqId) {
        error ? reject(error) : resolve(res);
        worker.removeEventListener("message", handle);
      }
    };
    worker.addEventListener("message", handle);
    worker.postMessage({ id: reqId, method, params });
  });
}
