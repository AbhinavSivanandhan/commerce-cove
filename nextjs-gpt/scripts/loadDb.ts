//only ts consumeDynamicAccess, no tsx
import { DataAPIClient } from "@datastax/astra-db-ts" //DB
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai" //llm - make answers more readable

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean" //cosine is default for astradb, does not need to be normalised. dot_product is 50% faster than cosine but has to be normalised. //small euclidean distance means close in vector space 

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, OPENAI_API_KEY} = process.env
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const gptData = ['https://www.crash.net/f1/news/1055200/1/top-10-highest-paid-f1-drivers-2024']

//scrape, chunk, vectorise, send to db
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})
//chunk overlap is to ensure cross chunk context, so better chances of retrieving something right
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollectionIfNotExists = async (similarityMetric: SimilarityMetric = "dot_product") => {
    try {
        const collections = await db.listCollections();
        const exists = collections.find((col) => col.name === ASTRA_DB_COLLECTION);
        if (!exists) {
            console.log(`Creating collection: ${ASTRA_DB_COLLECTION}`);
            const res = await db.createCollection(ASTRA_DB_COLLECTION, {
                vector: {
                    dimension: 1536,
                    metric: similarityMetric
                }
            });
            console.log("Collection created:", res);
        } else {
            console.log(`Collection '${ASTRA_DB_COLLECTION}' already exists. Skipping creation.`);
        }
    } catch (err) {
        console.error("Error during collection creation:", err);
    }
};

const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await (const url of gptData) {
        const content = await scrapePage(url) //scrape every url
        const chunks = await splitter.splitText(content)
        for await ( const chunk of chunks ){
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding
            // Check if chunk already exists before inserting
            const existing = await collection.findOne({ text: chunk });

            if (!existing) {
                const res = await collection.insertOne({
                    $vector: vector,
                    text: chunk
                });
                console.log("Inserted chunk:", res);
            } else {
                console.log("Chunk already exists, skipping...");
            }
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions:{
            headless: true //A headless browser is a browser that runs without a user interface, like detached(we use this word often in context of terminals)
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return ( await loader.scrape() )?.replace(/<[^>]*>?/gm, '') //Uses regex to remove all HTML tags from the scraped content. if content exists(?)
}

const run = async () => {
    await createCollectionIfNotExists();
    await loadSampleData();
};

run();