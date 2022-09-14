import { visit } from "unist-util-visit";

export default function sanitizerPlugin({
  filter = ["text", "code", "inlineCode"],
  func,
}) {
  return () => {
    return (tree) => {
      visit(tree, filter, (node) => {
        node.value = func(node.value);
      });

      return tree;
    };
  };
}
