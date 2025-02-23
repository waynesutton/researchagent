import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ResearchResult {
  _id: Id<"researchResults">;
  companyName: string;
  industry?: string;
  keyPeople: string[];
  funding?: string;
  confidence?: number;
}

export function ResearchResults() {
  const results = useQuery(api.index.getResearchResults);

  if (!results) {
    return <div>Loading...</div>;
  }

  return (
    <div className="research-results">
      {results.map((result: ResearchResult) => (
        <div key={result._id} className="result-card">
          <h3>{result.companyName}</h3>
          {result.industry && <p>Industry: {result.industry}</p>}
          <p>Key People: {result.keyPeople.join(", ")}</p>
          {result.funding && <p>Funding: {result.funding}</p>}
          {result.confidence !== undefined && (
            <div className="confidence-score">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
