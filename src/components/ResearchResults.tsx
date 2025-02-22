import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ResearchResults({ channelId }) {
  const results = useQuery(api.index.getResearchResults, { channelId });

  return (
    <div className="research-results">
      {results?.map((result) => (
        <div key={result._id} className="result-card">
          <h3>{result.companyName}</h3>
          <p>Industry: {result.industry}</p>
          <p>Key People: {result.keyPeople.join(", ")}</p>
          <p>Funding: {result.funding}</p>
          <div className="confidence-score">
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}
