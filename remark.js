// import { remark } from "remark";
// import { readFileSync } from "fs";

// main();

// async function main() {
//   const buffer = readFileSync("fun.md");
//   const file = await remark().parse(buffer);

//   const grouped = file.children
//     .reduce(
//       ([groups, partial], current, idx, arr) => {
//         const nxt = arr[idx + 1];

//         if (!nxt || (nxt.type == "heading" && nxt.depth == 3)) {
//           return [[...groups, [...partial, current]], []];
//         }

//         return [groups, [...partial, current]];
//       },
//       [[], []]
//     )
//     .flat();

//   const functions = grouped.map((g) => {
//     return {
//       name: g[0].children[0].value,
//       input: sanitize(getHeadingCode(g, "input")),
//       output: sanitize(getHeadingCode(g, "output")),
//       markdown: g,
//     };
//   });
//   console.log(functions);

//   const functionIdcsByName = {};
//   for (const funIdx in functions) {
//     functionIdcsByName[functions[funIdx].name] = +funIdx;
//   }

//   console.log(functionIdcsByName);

//   const functionIdcsByInputType = new Map();
//   for (const funIdx in functions) {
//     const fun = functions[funIdx];
//     const inputTypes = inputStringToInputTypes(fun.input);
//     for (const inputType of inputTypes) {
//       if (!functionIdcsByInputType.has(inputType))
//         functionIdcsByInputType.set(inputType, new Set());
//       functionIdcsByInputType.get(inputType).add(+funIdx);
//     }
//     console.log(fun.name);
//     console.log(functionIdcsByInputType);
//   }

//   // search for input with type `uint`
//   console.log(
//     Array.from(functionIdcsByInputType.get("uint").values()).map(
//       (idx) => functions[idx]
//     )
//   );
// }

// function getHeadingCode(node, value) {
//   return node.filter(
//     (n) => n.type == "heading" && n.children[0].value.startsWith(value)
//   )[0].children[1].value;
// }

// function sanitize(string) {
//   return (
//     string
//       .replaceAll(/\s*\|\s*/g, " | ")
//       .replaceAll("AnyType", "Any")
//       // .replaceAll(/\w*Name/g, "Name")
//       .replaceAll(/<|>/g, "")
//       // .replaceAll(/\,*\s\.\.\./g, "...")
//       .replaceAll(/\,*\s\.\.\./g, "")
//       .replaceAll(/Function\(.*\)\s-\s\w*/g, "Function")
//       .replaceAll(/\(optional[\s\w]*\)/g, "optional")
//       .replaceAll(/\(response[\s\w]*\)/g, "response")
//       .replaceAll(/\(buff[\s\w]*\)/g, "buff")
//       .replaceAll("expression", "expr")
//   );
// }

// function inputStringToInputTypes(inputString) {
//   return inputString
//     .split(" | ")
//     .map((i) => i.split(/\,\s?/))
//     .flat();
// }

// // function inputToInputAliases(input) {
// //   const res = [input];
// //   if (input.includes("response")) res.push("response");
// //   if (input.includes("optional")) res.push("optional");
// //   return res;
// // }
