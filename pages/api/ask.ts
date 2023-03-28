import { AskResult } from "@xata.io/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { getXataClient } from "@/lib/xata";

const xata = getXataClient();

export const config = {
  runtime: "edge",
};

const bodySchema = z.object({
  database: z.string(),
  question: z.string(),
});

const handler = async (req: NextRequest): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
    });
  }

  const body = bodySchema.safeParse(await req.json());
  if (!body.success) {
    return new Response(JSON.stringify({ message: "Invalid body" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      xata.db.content.ask(body.data.question, {
        rules: [
          "You are a friendly chat bot that answers questions about the Netlify platform.",
          'Only answer questions that are relating to the defined context or are general technical questions. If asked about a question outside of the context, you can respond with "It doesn\'t look like I have enough information to answer that. Check the documentation or contact support."',
        ],
        searchType: "keyword",
        search: {
          fuzziness: 1,
          prefix: "phrase",
        },
        onMessage: (message: AskResult) => {
          controller.enqueue(encoder.encode(`event: message\n`));
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          );
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream;charset=utf-8",
    },
  });
};

export default handler;
