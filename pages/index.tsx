import { InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useState } from "react";
import useAskDocs from "@/src/hooks/useAskDocs";
import useGetDocs from "@/src/hooks/useGetDocs";
import { getXataClient } from "@/lib/xata";

export async function getStaticProps() {
  const xata = getXataClient();

  const { aggs } = await xata.db.content.aggregate({
    total: { count: "*" },
  });

  return { props: { recordCount: aggs.total } };
}

function prettyFormatNumber(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function Home({
  recordCount,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [question, setQuestion] = useState<string>("");
  const [selected, setSelected] = useState<string>("clerk-docs-test");

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
          <div>
            <div key={`database-clerk-docs-test`}>
              <h3 style={{ marginBottom: 10 }}>Clerk Docs Demo</h3>
              <p>
                {prettyFormatNumber(recordCount)}{" "}
                {recordCount === 1 ? "record" : "records"}
              </p>
            </div>
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
