"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function MigrationRunner() {
  const runMigration = useMutation(api.conversations.runMigration);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info" | null;
  }>({ message: "", type: null });
  const [isRunning, setIsRunning] = useState(false);

  const handleMigration = async () => {
    try {
      setIsRunning(true);
      setStatus({ message: "Running migration...", type: "info" });

      const result = await runMigration();
      if (result.success) {
        setStatus({
          message: `Migration successful: ${result.message}`,
          type: "success",
        });
      } else {
        setStatus({
          message: `Migration failed: ${result.message}`,
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Migration error:", error);
      setStatus({
        message: error?.message || "An unexpected error occurred",
        type: "error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleMigration}
        disabled={isRunning}
        className={`px-4 py-2 text-white rounded transition-colors ${
          isRunning ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
        }`}>
        {isRunning ? "Running Migration..." : "Run Migration"}
      </button>
      {status.type && (
        <p
          className={`text-sm ${
            status.type === "success"
              ? "text-green-600"
              : status.type === "error"
                ? "text-red-600"
                : "text-blue-600"
          }`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
