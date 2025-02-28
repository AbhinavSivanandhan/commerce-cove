"use client";

import Image from "next/image";
import logo from "./assets/logo.png";
import { useState, useRef } from "react";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";

const Home = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef(null);

    const handleInputChange = (e) => setInput(e.target.value);

    const appendMessage = (msg) => {
        setMessages((prev) => [...prev, msg]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Append user's message
        const userMessage = { id: crypto.randomUUID(), content: input, role: "user" };
        appendMessage(userMessage);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantMessage = { id: crypto.randomUUID(), content: "", role: "assistant" };

            // Read and parse SSE stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const jsonStr = line.replace("data: ", "").trim();
                        if (jsonStr === "[DONE]") {
                            setIsLoading(false);
                            break;
                        }

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices?.[0]?.delta?.content || "";
                            assistantMessage.content += content;

                            // Update assistant's message in state
                            setMessages((prev) => {
                                const updated = prev.filter((msg) => msg.id !== assistantMessage.id);
                                return [...updated, assistantMessage];
                            });
                        } catch (err) {
                            console.error("Failed to parse chunk:", err, jsonStr);
                        }
                    }
                }
            }

            setIsLoading(false);
        } catch (err) {
            console.error("Error in chat:", err);
            setIsLoading(false);
        }
    };

    const handlePrompt = (promptText) => {
        setInput(promptText);
    };

    return (
        <main>
            <Image src={logo} width="250" height="250" alt="gpt logo" />
            <section className={messages.length === 0 ? "" : "populated"}>
                {messages.length === 0 ? (
                    <>
                        <p className="starter-text">
                            Ask GPT anything about me or my projects. It can respond.
                        </p>
                        <br />
                        <PromptSuggestionsRow onPromptClick={handlePrompt} />
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <Bubble key={`message-${index}`} message={message} />
                        ))}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input
                    className="question-box"
                    onChange={handleInputChange}
                    value={input}
                    placeholder="Ask me something..."
                />
                <input type="submit" />
            </form>
        </main>
    );
};

export default Home;
