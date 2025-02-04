"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Paperclip, Send, Bot, User } from "lucide-react";

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputValue, setInputValue] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!inputValue.trim() && !file) return;

    const formData = new FormData();
    formData.append("inputData", inputValue);
    if (file) formData.append("file", file);

    setMessages((prev) => [...prev, `🧑‍💻: ${inputValue}`]);
    setInputValue("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

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
  }, [chatEndRef]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Chat Interface</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-2xl font-semibold text-gray-700 mt-20">
            What can I help you ship?
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start space-x-3"
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.startsWith("🧑‍💻") ? "bg-blue-100" : "bg-purple-100"
                }`}
              >
                {msg.startsWith("🧑‍💻") ? (
                  <User className="w-5 h-5 text-blue-600" />
                ) : (
                  <Bot className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div
                className={`flex-1 max-w-3xl overflow-hidden rounded-lg p-4 ${
                  msg.startsWith("🧑‍💻") ? "bg-blue-50" : "bg-purple-50"
                }`}
              >
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  className="prose prose-sm max-w-none"
                >
                  {msg.substring(4)}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {currentMessage && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 max-w-3xl overflow-hidden rounded-lg p-4 bg-purple-50">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                className="prose prose-sm max-w-none"
              >
                {currentMessage.substring(4)}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {file && (
          <div className="mb-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center">
            <Paperclip className="w-4 h-4 mr-2" />
            <span className="truncate">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpg, image/png, image/jpeg"
              className="hidden"
            />
            <Paperclip className="w-5 h-5 text-gray-500" />
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask v0 a question..."
            className="flex-1 p-2 border-0 focus:outline-none focus:ring-0 text-base"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() && !file}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
