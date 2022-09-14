import { createElement, Fragment, useEffect, useState } from "react";
import rehypeParse from "rehype-parse";
import rehypeReact from "rehype-react";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

function useHtmlToReact(html) {
  const [Content, setContent] = useState(null);

  useEffect(() => {
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeReact, { createElement, Fragment })
      .process(html)
      .then((file) => setContent(file.result));
  }, [html]);

  return Content;
}

function useMarkdownToReact(markdown) {
  const [Content, setContent] = useState(null);

  useEffect(() => {
    unified()
      .use(remarkParse, { fragment: true })
      .use(remarkRehype, { fragment: true })
      .use(rehypeReact, { createElement, Fragment })
      .process(markdown)
      .then((file) => setContent(file.result));
  }, [markdown]);

  return Content;
}

const Result = ({ html, query }) => {
  const pattern = `(>[^<\\/>]*?)(${query.replace(/\s/, "[\\w\\W]")}|${query
    .split(/\s+/)
    .filter((w) => w.match(/\w*/))
    .join("|")})`;

  const highlighted = html.replaceAll(
    new RegExp(pattern, "g"),
    (_, a, b) => `${a}<mark class="highlight">${b}</mark>`
  );

  const innerHtml = useHtmlToReact(highlighted);
  if (!innerHtml) return null;

  return (
    <div className="p-4 w-full text-white border-2 border-slate-500 rounded-xl bg-slate-700 prose prose-headings:my-0 prose-headings:text-white prose-code:bg-gray-800 prose-code:text-white">
      {innerHtml}
    </div>
  );
};

export default Result;
