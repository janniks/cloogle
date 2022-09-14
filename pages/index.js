import { useEffect, useState } from "react";
import { Corpus } from "tiny-tfidf";
import Result from "../components/Result";
import { buildFunctionsIndex } from "../lib/functions";
import useDebounce from "../lib/use-debounce";

export default function Home({
  functionFromIdx,
  functionIdxFromName,
  functionIdcsFromInputType,
}) {
  const [corpus, setCorpus] = useState();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");

  const debouncedQuery = query;

  useEffect(() => {
    setCorpus(
      new Corpus(
        Object.values(functionIdxFromName),
        Object.values(functionFromIdx).map((i) => i.words)
      )
    );
  }, [functionIdxFromName, functionFromIdx]);

  useEffect(() => {
    if (!corpus || !debouncedQuery) {
      setResults([]);
      return;
    }
    const typeIdcs = functionIdcsFromInputType[debouncedQuery] ?? [];
    const queryIdcs = corpus
      .getResultsForQuery(debouncedQuery)
      .map((r) => r[0]);
    const idcs = [...new Set([...typeIdcs, ...queryIdcs])];
    setResults(idcs.map((idx) => functionFromIdx[idx]));
  }, [corpus, debouncedQuery, functionIdcsFromInputType, functionFromIdx]);

  if (!corpus) return "...";

  function handleInputChange(e) {
    if (!e.target.value) setResults([]);
    setQuery(e.target.value.trim());
  }

  // todo: stable sort for searchterm in title/name (h3)

  return (
    <div className="bg-gray-800">
      <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-indigo-300">Cloogle</h2>
          <div className="mx-auto mt-5 max-w-lg ">
            <input
              autoFocus
              className="w-full text-black rounded-md text-lg px-2 py-1"
              placeholder="Query clarity functions"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <p className="mt-4 text-center text-gray-400">
          {!!debouncedQuery && results.length > 0 ? results.length : "No"}{" "}
          results
        </p>

        <div className="mx-auto mt-4 max-w-2xl flex flex-col items-center space-y-6">
          {results.length > 0 &&
            results.map((r, k) => (
              <Result key={k} html={r.html} query={query} />
            ))}
        </div>

        {/* <div className="mx-auto mt-4 max-w-2xl flex flex-col items-center space-y-6">
          {(results.length == 0 || !debouncedQuery) &&
            Object.keys(functionIdcsFromInputType).map((t, k) => (
              <p key={k}>{t}</p>
            ))}
        </div> */}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: await buildFunctionsIndex(),
  };
}
