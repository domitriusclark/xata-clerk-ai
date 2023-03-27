import { useCallback, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";

const useXataAsk = () => {
  const [answer, setAnswer] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<string[]>([]);

  const askQuestion = useCallback((database: string, question: string) => {
    if (!question) return;

    setAnswer(undefined);
    setIsLoading(true);

    void fetchEventSource(`/api/ask`, {
      method: "POST",
      body: JSON.stringify({ question, database }),
      headers: { "Content-Type": "application/json" },
      openWhenHidden: true,
      onmessage(ev) {
        try {
          const { answer = "", records, done } = JSON.parse(ev.data);
          if (records) {
            setRecords(records);
            console.log("stop");
            throw new Error("stop");
          }
          setAnswer((prev = "") => `${prev}${answer}`);
          setIsLoading(!done);
        } catch (e) {}
      },
      onclose() {
        console.log("onclose");
        // do nothing to stop the operation
      },
      onerror(err) {
        console.log("onerror", err);
        throw err; // rethrow to stop the operation
      },
    });
  }, []);

  // Clear answer function
  const clearAnswer = useCallback(() => {
    setAnswer(undefined);
    setIsLoading(false);
    setRecords([]);
  }, []);

  return { isLoading, answer, records, askQuestion, clearAnswer };
};

export default useXataAsk;
