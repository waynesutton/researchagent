"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { ResearchModal } from "@/components/ResearchModal";
import { Id } from "../../../../convex/_generated/dataModel";

// Helper function to safely convert string to Convex ID
function parseId(id: string): Id<"researchResults"> | null {
  // Convex IDs are 32 characters long
  if (typeof id !== "string" || id.length !== 32) {
    return null;
  }
  // This cast is safe because we've verified the format
  return id as Id<"researchResults">;
}

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();

  // Safely convert the ID and handle invalid cases
  const id = parseId(params.id as string);
  const result = id ? useQuery(api.researchResults.get, { id }) : null;

  if (!id) {
    router.push("/"); // Redirect to home if ID is invalid
    return null;
  }

  if (!result) {
    return <div>Loading...</div>;
  }

  return (
    <ResearchModal
      result={result}
      onClose={() => router.push("/")}
      updateNotes={(id, notes) => {
        // Handle notes update
      }}
    />
  );
}
