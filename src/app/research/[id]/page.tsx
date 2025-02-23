"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { ResearchModal } from "@/components/ResearchModal";
import { useRouter } from "next/navigation";

export default function ResearchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const result = useQuery(api.researchResults.get, { id });

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
