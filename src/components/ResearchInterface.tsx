"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Loader2, XCircle, Copy, Check, Trash2 } from "lucide-react";

interface Message {
  _id: Id<"messages">;
  content: string;
  role: "user" | "assistant";
  metadata?: {
    sources?: Array<{
      title: string;
      url: string;
    }>;
  };
}

export function ResearchInterface() {
  const [message, setMessage] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.messages.sendMessage);
  const cancelResearch = useMutation(api.conversations.cancel);
  const messages = useQuery(api.messages.list, conversationId ? { conversationId } : "skip");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isResearching) return;

    try {
      setIsResearching(true);
      let currentConversationId = conversationId;
      if (!currentConversationId) {
        const result = await createConversation({
          title: "Research Session",
          status: "active",
        });
        currentConversationId = result.conversationId;
        setConversationId(currentConversationId);
      }

      await sendMessage({
        conversationId: currentConversationId,
        content: message,
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setIsResearching(false);
    }
  };

  const handleCancel = async () => {
    if (!conversationId) return;
    try {
      await cancelResearch({ conversationId });
    } catch (error) {
      console.error("Error cancelling research:", error);
    }
  };

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setConversationId(null);
    setMessage("");
    setIsResearching(false);
  };

  // Reset researching state when new messages arrive and they include an assistant response
  useEffect(() => {
    if (messages?.length && messages[messages.length - 1].role === "assistant") {
      setIsResearching(false);
    }
  }, [messages?.length]);

  return (
    <div className="flex gap-6">
      {/* System Message Panel */}
      <div className="w-[430px] bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
        <div className="mb-4">
          <h2 className="font-mono text-sm mb-4">System</h2>
          <p className="text-sm leading-relaxed">
            I am an AI research assistant specialized in company analysis. I can help you research
            companies and provide detailed information about their business, leadership, and recent
            developments.
          </p>
        </div>
        <div className="mb-4">
          <h2 className="font-mono text-sm mb-2">Prompt:</h2>
          <p className="text-sm text-gray-600">
            Ask about a company (e.g., 'Tell me about Apple') <br></br> Results are saved below.
          </p>
          <div className="rounded p-3"></div>
        </div>
        <div className="mt-auto">
          <form onSubmit={handleSubmit} className="border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about a company..."
                rows={1}
                disabled={isResearching}
                style={{ resize: "none" }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] max-h-[200px] overflow-y-auto disabled:bg-gray-50 disabled:text-gray-500"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isResearching || !message.trim()}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
                  {isResearching ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      Research
                      <Send size={16} />
                    </>
                  )}
                </button>
                {/* {isResearching && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <XCircle size={16} />
                    Stop Research
                  </button>
                )} */}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 max-w-5xl">
        <div className="flex justify-between items-center px-6 py-2 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-700">Research Results</h2>
          {messages && messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              title="Clear conversation">
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="h-[500px] p-6 overflow-y-auto">
          {messages?.map((message: Message) => (
            <div
              key={message._id}
              className={`mb-4 ${
                message.role === "assistant" ? "text-gray-700" : "text-gray-900 font-medium"
              }`}>
              <div className="flex justify-between items-start gap-2">
                <div className="whitespace-pre-wrap flex-1">{message.content}</div>
                {message.role === "assistant" && (
                  <button
                    onClick={() => handleCopy(message.content, message._id)}
                    className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    title="Copy response">
                    {copiedId === message._id ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                )}
              </div>
              {message.role === "assistant" && message.metadata?.sources && (
                <div className="mt-2 space-y-1">
                  {message.metadata.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:underline">
                      {source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!messages?.length && !isResearching && (
            <div className="text-center text-sm text-gray-500">
              Ask me about any company and I'll research it for you
            </div>
          )}
          {isResearching && (
            <div className="flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
              <Loader2 size={24} className="animate-spin" />
              <p>Researching... This may take a minute as I gather comprehensive information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
