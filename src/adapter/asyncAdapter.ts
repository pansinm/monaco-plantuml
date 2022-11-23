import type { PUmlService } from "../service";

function createAdapter() {
  return new Proxy(
    {},
    {
      get(target: any, p: keyof PUmlService, receiver: any) {
        return (...args: any[]) =>
          import("../service")
            .then((m) => m.default)
            .then((service) => (service[p] as any)(...args) as any);
      },
    }
  ) as PUmlService;
}

export default createAdapter();
