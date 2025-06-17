import PUmlFile from "../PUmlFile";
import fetch from "node-fetch";
import stdlib from "../stdlib";

jest.mock(
  "dexie",
  () =>
    class {
      files: any;
      constructor() {}
      version() {
        return {
          stores: () => {
            this.files = {
              add() {},
              get() {
                return null;
              },
            };
          },
        };
      }
    } as any
);
const puml = `
!include <archimate/Archimate>

Group(group, "动机元素") {
    Motivation_Stakeholder(m_stakeholder, "利益相关者")
    Motivation_Driver(m_driver, "驱动力")
    Motivation_Assessment(m_assessment, "评估")
    Motivation_Goal(m_goal, "目标")
    Motivation_Outcome(m_outcome, "产出")
    Motivation_Principle(m_principle, "原则")
    Motivation_Requirement(m_rquirement, "需求")
    Motivation_Constraint(m_constraint, "约束")
    Motivation_Meaning(m_meaning, "含义") 
    Motivation_Value(m_value, "价值")
}
`;
const file = PUmlFile.create(puml);

beforeAll(async () => {
  await stdlib.resolve();
  window.fetch = fetch as any;
  await file.parse();
}, 10000);

it("find include callable nodes", async () => {
  expect(
    file
      .allCallableNodes()
      .find((node) => node.name.name === "Motivation_Value")
  ).toBeTruthy();
});

it("find arguments", async () => {
  expect(file.findArguments("Motivation_Assessment").length).toBe(2);
});

it("find callable node", () => {
  // console.log(JSON.stringify(file.ast, null, 2));
  expect(file.findCallableNode("Motivation_Assessment")?.name.name).toBe(
    "Motivation_Assessment"
  );
});
