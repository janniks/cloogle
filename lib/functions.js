import { readFileSync } from "fs";
import { remark } from "remark";
import sanitizerPlugin from "./sanitizer";
import remarkHtml from "remark-html";

const not = (f) => (x) => !f(x);

export async function buildFunctionsIndex() {
  const buffer = readFileSync("fun.md");
  let file = await remark().parse(buffer);
  file = await remark()
    .use(sanitizerPlugin({ func: sanitize }))
    .runSync(file);

  const grouped = file.children
    .reduce(
      ([groups, partial], current, idx, arr) => {
        const nxt = arr[idx + 1];

        if (!nxt || (nxt.type == "heading" && nxt.depth == 3)) {
          return [[...groups, [...partial, current]], []];
        }

        return [groups, [...partial, current]];
      },
      [[], []]
    )
    .flat();

  const functions = await Promise.all(
    grouped.map(async (g) => {
      const markdown = remark().stringify({
        type: "root",
        children: g
          // .map((c) => {
          //   if (c.type == "heading") c.depth--;
          //   return c;
          // })
          .filter(
            not(
              (c) =>
                c.type == "heading" &&
                c.children[0].value.startsWith("description")
            )
          ),
      });

      const html = String(await remark().use(remarkHtml).process(markdown));

      return {
        name: g[0].children[0].value,
        input: sanitize(getHeadingCode(g, "input")),
        output: sanitize(getHeadingCode(g, "output")),
        markdown,
        html,
        words: markdown
          .replaceAll(/[^\w]/g, " ")
          .replaceAll(/\s\d\w*\b/g, "")
          .replaceAll(/\s+/g, " ")
          .toLowerCase(),
      };
    })
  );

  const functionIdxFromName = {};
  for (const funIdx in functions) {
    functionIdxFromName[functions[funIdx].name] = funIdx;
  }

  const functionIdcsByInputType = new Map();
  for (const funIdx in functions) {
    const fun = functions[funIdx];
    const inputTypes = inputStringToInputTypes(fun.input);
    for (const inputType of inputTypes) {
      if (!functionIdcsByInputType.has(inputType))
        functionIdcsByInputType.set(inputType, new Set());
      functionIdcsByInputType.get(inputType).add(funIdx);
    }
  }

  const functionFromIdx = Object.fromEntries(functions.entries());

  return {
    functionFromIdx,
    functionIdxFromName,
    functionIdcsFromInputType: Object.fromEntries(
      Array.from(functionIdcsByInputType.entries()).map(([k, v]) => [
        k,
        Array.from(v),
      ])
    ),
  };
}

function getHeadingCode(node, value) {
  return node.filter(
    (n) => n.type == "heading" && n.children[0].value.startsWith(value)
  )[0].children[1].value;
}

function inputStringToInputTypes(inputString) {
  return inputString
    .split(" | ")
    .map((i) => i.split(/\,\s?/))
    .flat();
}

// function inputToInputAliases(input) {
//   const res = [input];
//   if (input.includes("response")) res.push("response");
//   if (input.includes("optional")) res.push("optional");
//   return res;
// }

function sanitize(string) {
  return (
    string
      .replaceAll(/\s*\|\s*/g, " | ")
      .replaceAll("AnyType", "Any")
      // .replaceAll(/\w*Name/g, "Name")
      .replaceAll(/<|>/g, "")
      // .replaceAll(/\,*\s\.\.\./g, "...")
      .replaceAll(/\,*\s\.\.\./g, "")
      .replaceAll(/Function\(.*\)\s-\s\w*/g, "Function")
      .replaceAll(/\(optional[\s\w]*\)/g, "optional")
      .replaceAll(/\(response[\s\w]*\)/g, "response")
      .replaceAll(/\(buff[\s\w]*\)/g, "buff")
      .replaceAll("expression", "expr")
  );
}
