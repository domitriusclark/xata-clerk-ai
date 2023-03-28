import { NextApiRequest, NextApiResponse } from "next";
import { getXataClient } from "@/lib/xata";
const xata = getXataClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { searchTerm } = req.body;
  const records = await xata.search.all(searchTerm, {
    tables: [
      {
        table: "content",
        target: [{ column: "title" }, { column: "content" }],
      },
    ],
    fuzziness: 1,
    prefix: "phrase",
  });

  let data = [];

  for (const { record } of records) {
    data.push(record);
  }

  res.status(200).json(data);
};

export default handler;
