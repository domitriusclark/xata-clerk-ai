import { useState, useEffect, useCallback } from "react";
import { z } from "zod";

const xataDocsResponse = z.array(
  z.object({ id: z.string(), title: z.string(), url: z.string() })
);

export type XataDocsResponse = z.infer<typeof xataDocsResponse>;

export const useGetDocs = (database: string, ids: string[] = []) => {
  const [relatedDocs, setRelatedDocs] = useState<XataDocsResponse>([]);

  useEffect(() => {
    if (ids?.length === 0) {
      setRelatedDocs([]);
      return;
    }

    const fetchData = async () => {
      const response = await fetch(`/api/docs-get`, {
        method: "POST",
        body: JSON.stringify({ database, ids }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setRelatedDocs(xataDocsResponse.parse(data));
    };
    fetchData();
  }, [database, ids]);

  const clearRelated = useCallback(() => {
    setRelatedDocs([]);
  }, []);

  return { relatedDocs, clearRelated };
};

export default useGetDocs;
