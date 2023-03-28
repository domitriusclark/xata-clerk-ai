// Generated with CLI
import { getXataClient } from "@/src/xata";
const xata = getXataClient();

const records = await xata.search.all("expo", {
  tables: [
    { table: "content", target: [{ column: "title" }, { column: "content" }] },
  ],
  fuzziness: 1,
  prefix: "phrase",
});

console.log(records);
