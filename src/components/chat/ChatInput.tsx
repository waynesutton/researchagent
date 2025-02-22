"use client";

import { useState, FormEvent } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSubmit, placeholder, className = "" }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmit(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder || "Type a message..."}
          className="w-full px-4 py-3 text-gray-900 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="absolute right-2 p-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-black transition-colors duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
