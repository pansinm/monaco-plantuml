import { DEFAULT_EXPIRES } from "./constants";
import { getJson } from "./fetcher";

class Stdlib {
  modules: { path: string; type: string; url: string }[] = [];
  loading = false;

  getModule(name: string) {
    return this.modules.find(
      (module) => module.path === name || module.path === name + ".puml"
    );
  }
  private resolves: ((modules: Stdlib["modules"]) => void)[] = [];
  async resolve(): Promise<Stdlib["modules"]> {
    if (this.modules.length) {
      return this.modules;
    }
    if (this.loading) {
      return new Promise((resolve) => this.resolves.push(resolve));
    }
    this.loading = true;
    return getJson(
      "https://api.github.com/repos/plantuml/plantuml-stdlib/git/trees/master?recursive=10"
    )
      .then((body) => {
        if (body?.tree) {
          this.modules =
            (body as any).tree?.map((item: any) => ({
              ...item,
              path: item.path.replace(/^stdlib\//, ""),
            })) || [];
        }
        return this.modules;
      })
      .finally(() => {
        this.resolves.forEach((resolve) => resolve(this.modules));
        this.resolves = [];
        this.loading = false;
      });
  }
}

export default new Stdlib();
