import { streamText } from "ai";
import { openai as aiOpenAI } from "@ai-sdk/openai"; // For streamText
import OpenAI from "openai"; // Official OpenAI SDK for embeddings
import { DataAPIClient } from "@datastax/astra-db-ts";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY } = process.env;

// Official OpenAI SDK instance for embeddings
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export const POST = async (req: Request) => {
    try {
        const { messages } = await req.json();
        const latestMessage = messages[messages?.length - 1]?.content;

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format: "float"
        });

        const collection = await db.collection(ASTRA_DB_COLLECTION);
        const cursor = collection.find(null, { sort: { $vector: embedding.data[0].embedding }, limit: 10 });
        const documents = await cursor.toArray();
        const docContext = JSON.stringify(documents.map(doc => doc.text));

        const prompt = `
        You are an AI assistant who knows everything about Formula One.
        Use the below context to augment your answers.
        ------------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        -----------------------
        QUESTION: ${latestMessage}
        -----------------------`;

        const { textStream } = await streamText({
            model: aiOpenAI("gpt-4"),
            prompt: prompt,
        });

        const readable = new ReadableStream({
            start(controller) {
                (async () => {
                    for await (const chunk of textStream) {
                        const jsonChunk = JSON.stringify({
                            choices: [{ delta: { content: chunk }, finish_reason: null }]
                        });
                        controller.enqueue(new TextEncoder().encode(`data: ${jsonChunk}\n\n`));
                    }

                    // Send [DONE] at the end of the stream
                    controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                    controller.close();
                })().catch((err) => {
                    console.error("Error during streaming:", err);
                    controller.close();
                });
            }
        });

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        });
    } catch (err) {
        console.error("Error in POST handler:", err);
        return new Response("Internal Server Error", { status: 500 });
    }
};
