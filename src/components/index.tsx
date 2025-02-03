"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // Syntax theme
import "./Form.css";

export default function Form() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const inputData = formData.get("inputData") as string;
    formData.append("file", file as File);

    setMessages((prev) => [...prev, `🧑‍💻: ${inputData}`]); // User message
    event.currentTarget.reset(); // Clear input

    const endpoint = "/api/upload";

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let message = "🤖: ";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });

      message += chunk;

      setCurrentMessage(message);
    }

    setMessages((prev) => [...prev, message]);
    setCurrentMessage("");
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentMessage]);

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={msg.startsWith("🧑‍💻") ? "user-message" : "bot-message"}
          >
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {msg}
            </ReactMarkdown>
          </motion.div>
        ))}
        {currentMessage && (
          <div className="bot-message">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
              {currentMessage}
            </ReactMarkdown>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          name="inputData"
          className="chat-input"
          placeholder="Type a message..."
        />
        <input
          type="file"
          accept="image/jpg, image/png, image/jpeg"
          onChange={handleFileChange}
        />
        <button type="submit" className="chat-submit-btn"></button>
      </form>
    </div>
  );
}
