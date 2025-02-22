"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResearchModal } from "./ResearchModal";
import ReactMarkdown from "react-markdown";

export function ResearchResultsTable() {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: any; name: string } | null>(
    null
  );
  const results = useQuery(api.researchResults.list);
  const toggleOpen = useMutation(api.researchResults.toggleOpen);
  const updateNotes = useMutation(api.researchResults.updateNotes);
  const deleteResult = useMutation(api.researchResults.deleteResult);

  if (!results) {
    return null;
  }

  return (
    <>
      <div className="w-full mt-8">
        <div className="bg-white rounded-2xl shadow-none border border-gray-100">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-normal text-black">Research Results</h2>
            <button
              onClick={() => setIsTableVisible(!isTableVisible)}
              className="px-3 py-1 text-sm text-black border border-black rounded hover:bg-gray-100 transition-colors">
              {isTableVisible ? "hide" : "show"}
            </button>
          </div>

          {isTableVisible && (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="text-left text-black border-b border-gray-100 bg-white">
                    <th className="p-3 w-32 font-normal"></th>
                    <th className="p-3 w-48 font-normal">Company name</th>
                    <th className="p-3 w-64 font-normal">Business analysis</th>
                    <th className="p-3 w-48 font-normal">Key people</th>
                    <th className="p-3 w-64 font-normal">Recent developments</th>
                    <th className="p-3 w-48 font-normal">Links</th>
                    <th className="p-3 w-64 font-normal">Highlights</th>
                    <th className="p-3 w-48 font-normal">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr
                      key={result._id}
                      className="border-b border-gray-100 text-black hover:bg-gray-50">
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="px-2 py-1 text-sm border border-black rounded hover:bg-gray-100">
                          View
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({ id: result._id, name: result.companyName })
                          }
                          className="px-2 py-1 text-sm border border-black rounded hover:bg-red-50">
                          Delete
                        </button>
                      </td>
                      <td className="p-3 font-medium truncate font-mono text-sm">
                        {result.companyName}
                      </td>
                      <td className="p-3 truncate">
                        <div className="prose prose-sm max-w-none font-mono text-sm">
                          <ReactMarkdown>{result.businessAnalysis}</ReactMarkdown>
                        </div>
                      </td>
                      <td className="p-3 truncate font-mono text-sm">
                        {result.keyPeople.join(", ")}
                      </td>
                      <td className="p-3 truncate">
                        <div className="prose prose-sm max-w-none font-mono text-sm">
                          <ReactMarkdown>{result.recentDevelopments}</ReactMarkdown>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="truncate font-mono text-sm">
                          {result.links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-black hover:underline block truncate">
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 truncate">
                        <div className="prose prose-sm max-w-none font-mono text-sm">
                          <ReactMarkdown>{result.highlights}</ReactMarkdown>
                        </div>
                      </td>
                      <td className="p-3 truncate">
                        <div className="prose prose-sm max-w-none font-mono text-sm">
                          <ReactMarkdown>{result.notes || "Click to add notes..."}</ReactMarkdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedResult && (
        <ResearchModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          updateNotes={(id, notes) => {
            updateNotes({ id, notes });
          }}
        />
      )}

      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Confirmation</h3>
            <p className="mb-6">
              Are you sure you want to delete the research results for "{deleteConfirmation.name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm border border-black rounded hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteResult({ id: deleteConfirmation.id });
                  setDeleteConfirmation(null);
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
