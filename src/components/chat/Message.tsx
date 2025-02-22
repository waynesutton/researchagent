"use client";

import { ReactNode } from "react";

interface MessageProps {
  children: ReactNode;
}

interface SourceLink {
  title: string;
  url: string;
  relevance: number;
}

interface AssistantMessageProps extends MessageProps {
  sources?: SourceLink[];
}

export function SystemMessage({ children }: MessageProps) {
  return (
    <div className="bg-blue-50/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-blue-700">System</div>
      </div>
      <div className="text-blue-700 ml-8">{children}</div>
    </div>
  );
}

export function UserMessage({ children }: MessageProps) {
  return (
    <div className="bg-gray-100/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-gray-700">You</div>
      </div>
      <div className="text-gray-700 ml-8">{children}</div>
    </div>
  );
}

export function AssistantMessage({ children, sources }: AssistantMessageProps) {
  const handleCopy = () => {
    if (typeof children === "string") {
      navigator.clipboard.writeText(children);
    } else if (children?.props?.children) {
      navigator.clipboard.writeText(children.props.children);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 backdrop-blur-sm p-4 rounded-xl border border-purple-100/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <div className="text-sm font-medium text-purple-700">Assistant</div>
        <button
          onClick={handleCopy}
          className="ml-auto p-1 rounded hover:bg-purple-100/50 transition-colors"
          title="Copy response">
          <svg
            className="w-4 h-4 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </button>
      </div>
      <div className="text-gray-700 ml-8 prose prose-sm max-w-none">
        {children}
        {sources && sources.length > 0 && (
          <div className="mt-4 border-t border-purple-100/50 pt-3">
            <p className="text-sm font-medium text-purple-700">Sources:</p>
            <ul className="mt-2 space-y-1">
              {sources.map((source, index) => (
                <li key={index} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
