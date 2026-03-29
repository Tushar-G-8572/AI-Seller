import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useProduct";
import Sidebar from "./Sidebar";
import { MdGroupAdd } from "react-icons/md";
import MarkdownMessage from "./MarkDownMessage";

const formatMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\s\*\s/g, "\n\n* ")
    .replace(/\*\*([^*]+)\*\*:/g, "\n\n**$1**:")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// ── Small blinking cursor shown at the end of a streaming message
const BlinkingCursor = () => (
  <span className="inline-block w-2 h-4 bg-gray-300 ml-1 animate-pulse rounded-sm" />
);

// ── Skeleton shown when the AI placeholder is still completely empty
const ThinkingSkeleton = () => (
  <div className="flex flex-col gap-2 py-2">
    <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4" />
    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
    <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
  </div>
);

const ChatPage = () => {
  const [chatInput, setChatInput] = useState("");
  const { chatId } = useParams();
  const chatEndRef = useRef(null);

  const { handleSendMessage, handleOpenChat } = useChat();

  // Select just this chat's data from Redux
  const chatData = useSelector((state) => state.chat.chats?.[chatId]);
  const messages = chatData?.messages || [];

  // ── Load messages from DB when the chatId changes in the URL
  useEffect(() => {
    handleOpenChat(chatId, chatData);
  }, [chatId]);

  // ── Auto-scroll to bottom on every new message / chunk
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage) return;
    setChatInput("");
    // chatId from useParams — undefined on first message, that's fine
    await handleSendMessage({ message: trimmedMessage, chatId });
    // No navigate needed here — Home.jsx handles the first-message navigate
    // Follow-up messages are already on /chat/:chatId
  }

  return (
    <section className="bg-black text-gray-200 h-screen w-full">
      <div className="main w-full h-screen flex px-2 py-1 gap-1">
        <Sidebar />

        <div className="h-full w-full flex-1 flex flex-col">

          {/* NAV */}
          <div className="nav w-full flex px-4 py-6 justify-between border-b border-gray-800">
            <h1 className="font-semibold text-2xl">Perplexity</h1>
            <h4 className="text-3xl font-medium cursor-pointer"><MdGroupAdd /></h4>
          </div>

          {/* CHAT BODY */}
          <div className="flex-1 overflow-y-auto px-10 py-4 flex flex-col gap-5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[65%] px-5 py-4 rounded-2xl text-sm leading-7 ${
                    msg.role === "user"
                      ? "bg-gray-800 text-white rounded-br-md"
                      : "text-gray-200 rounded-bl-md"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <>
                      {/* Show skeleton while content is still empty */}
                      {msg.isStreaming && !msg.content ? (
                        <ThinkingSkeleton />
                      ) : (
                        <>
                          <MarkdownMessage content={formatMarkdown(msg.content)} />
                          {/* Show blinking cursor while still receiving chunks */}
                          {msg.isStreaming && <BlinkingCursor />}
                        </>
                      )}
                    </>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="w-full px-10 py-4 border-t border-gray-800">
            <div className="search w-full flex items-center px-4 py-2 bg-gray-800 rounded-3xl">
              <textarea
                rows={1}
                onInput={handleInput}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  // Ctrl+Enter or Cmd+Enter to submit
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit(e);
                }}
                placeholder="Ask anything..."
                className="w-full bg-transparent px-2 outline-0 py-2 resize-none overflow-hidden max-h-40"
              />
              <button
                onClick={handleSubmit}
                className="px-4 ml-2 rounded-md py-2 hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ChatPage;