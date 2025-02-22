"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Id } from "../../convex/_generated/dataModel";

interface ResearchModalProps {
  result: {
    _id: Id<"researchResults">;
    companyName: string;
    businessAnalysis: string;
    keyPeople: string[];
    recentDevelopments: string;
    links: Array<{ title: string; url: string }>;
    highlights: string;
    notes?: string;
  };
  onClose: () => void;
  updateNotes: (id: Id<"researchResults">, notes: string) => void;
}

export function ResearchModal({ result, onClose, updateNotes }: ResearchModalProps) {
  const [notes, setNotes] = useState(result.notes || "");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    updateNotes(result._id, newNotes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
      <div className="bg-white w-[800px] min-h-[600px] max-h-[80vh] shadow-xl rounded-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-medium text-gray-800">{result.companyName}</h2>
            <p className="text-sm text-gray-500">Research Results</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-8">
            {/* Business Analysis */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Business Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-slate max-w-none prose-headings:font-normal prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4">
                  <ReactMarkdown>{result.businessAnalysis}</ReactMarkdown>
                </div>
              </div>
            </section>

            {/* Key People */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Key People</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 leading-relaxed">{result.keyPeople.join(", ")}</p>
              </div>
            </section>

            {/* Recent Developments */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Recent Developments</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-slate max-w-none prose-headings:font-normal prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4">
                  <ReactMarkdown>{result.recentDevelopments}</ReactMarkdown>
                </div>
              </div>
            </section>

            {/* Links */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Links</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-1.5">
                  {result.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline">
                      {link.title}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Highlights</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-slate max-w-none prose-headings:font-normal prose-headings:text-gray-800 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-ul:my-1 prose-ul:list-disc prose-ul:pl-4">
                  <ReactMarkdown>{result.highlights}</ReactMarkdown>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Notes</h3>
              <textarea
                className="w-full min-h-[200px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add notes..."
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
