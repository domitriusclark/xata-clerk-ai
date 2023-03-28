import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import useAskDocs from "@/src/hooks/useAskDocs";
import useGetDocs from "@/src/hooks/useGetDocs";
import { getDatabases } from "@/src/multiple-dbs";

export async function getStaticProps() {
  const dbs = [];

  for (const database of getDatabases()) {
    const { id, name, client: xata, lookupTable } = database;
    const { aggs } = await xata.db[lookupTable]?.aggregate({
      total: { count: "*" },
    });

    dbs.push({ id, name, recordCount: aggs.total });
  }

  return { props: { dbs } };
}

function prettyFormatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Home({
  dbs,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [question, setQuestion] = useState<string>("");
  const [selected, setSelected] = useState<string>(dbs[0].id);

  const { answer, isLoading, records, askQuestion } = useAskDocs();
  const { relatedDocs, clearRelated } = useGetDocs(selected, records);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearRelated();
    askQuestion(selected, question);
  };

  return (
    <>
      <Head>
        <title>Xata Chat Demo</title>
        <meta name="description" content="Xata Chat Demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div>
          <h1>Xata Ask Demo</h1>

          <div>
            {dbs.map(({ id, name, recordCount }) => (
              <div
                key={`database-${id}`}
                onClick={() => setSelected(id)}
                style={{
                  color: selected === id ? "#0070f3" : "inherit",
                  borderColor: selected === id ? "#0070f3" : "inherit",
                }}
              >
                <h3 style={{ marginBottom: 10 }}>{name}</h3>
                <p>
                  {prettyFormatNumber(recordCount)}{" "}
                  {recordCount === 1 ? "record" : "records"}
                </p>
              </div>
            ))}
          </div>
          <form onSubmit={handleFormSubmit}>
            <input
              value={question}
              className="w-2/3"
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={"Write a question to ask the chatbot"}
            />
            <div>
              <button disabled={isLoading ? true : false} type="submit">
                Ask
              </button>
            </div>
          </form>
          {answer ? (
            <p>{answer}</p>
          ) : isLoading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <span />
            </div>
          ) : null}
          {relatedDocs.length > 0 && (
            <div>
              <p>I have used the following doc pages as context:</p>
              {relatedDocs.map(({ id, title, url }) => (
                <li key={id}>
                  <a href={url} target="_blank">
                    {title}
                  </a>
                </li>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
