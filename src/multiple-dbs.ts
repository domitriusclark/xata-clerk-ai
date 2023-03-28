import { AskOptions, BaseClient } from "@xata.io/client";

type Database = {
  id: string;
  name: string;
  client: BaseClient;
  lookupTable: string;
  options: AskOptions<any>;
};

export const getDatabases = (): Database[] => {
  const clerkDocs = new BaseClient({
    databaseURL:
      "https://Shared-Testing-Databases-lrnsjf.us-east-1.xata.sh/db/clerk-docs-test",
  });

  return [
    {
      id: "clerk-docs-test",
      client: clerkDocs,
      name: "Clerk docs",
      lookupTable: "content",
      options: {
        rules: [
          "You are a friendly chat bot that answers questions about the Netlify platform.",
          'Only answer questions that are relating to the defined context or are general technical questions. If asked about a question outside of the context, you can respond with "It doesn\'t look like I have enough information to answer that. Check the documentation or contact support."',
        ],
        searchType: "keyword",
        search: {
          fuzziness: 1,
          prefix: "phrase",
        },
      },
    },
  ];
};
