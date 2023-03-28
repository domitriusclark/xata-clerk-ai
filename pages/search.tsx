import * as React from "react";
import Head from "next/head";
import { Content, getXataClient } from "@/lib/xata";
import useDebounce from "@/src/hooks/useDebounce";

export async function getStaticProps() {
  const xata = getXataClient();

  const content = await xata.db.content.getAll();

  return { props: { docs: content } };
}

export default function Search({ docs }: { docs: Content[] }) {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [results, setResults] = React.useState<any[]>([]);

  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  const debouncedSearchTerm: string = useDebounce<string>(searchTerm, 500);

  React.useEffect(
    () => {
      if (debouncedSearchTerm) {
        setIsSearching(true);
        fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ searchTerm: debouncedSearchTerm }),
        })
          .then((res) => res.json())
          .then((res) => {
            setIsSearching(false);
            setResults(res);
          });
      } else {
        setResults(docs);
      }
    },
    [docs, debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  console.log(results);

  return (
    <>
      <Head>
        <title>Keyword Search Clerk Docs</title>
      </Head>
      <main>
        <h1>Search Page</h1>
        <input
          placeholder="Search Clerk Docs"
          className="w-1/2 p-2 border-2 border-gray-800 rounded-xl"
          onChange={(e: React.FormEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        <div className="flex flex-col gap-5">
          {results.map((doc: Content) => (
            <div
              className="p-4 border-2 border-blue-600 rounded-lg"
              key={doc.id}
            >
              <h3>
                <em>{doc.title}</em>
              </h3>
              <a className="text-blue-400" href={doc.url}>
                {doc.url}
              </a>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
