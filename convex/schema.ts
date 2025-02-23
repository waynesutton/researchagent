import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
    isCancelled: v.boolean(),
  }).index("by_createdAt", ["createdAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    createdAt: v.number(),
    model: v.union(v.literal("gpt4"), v.literal("claude"), v.literal("mistral"), v.literal("grok")),
    metadata: v.optional(
      v.object({
        sources: v.array(
          v.object({
            title: v.string(),
            url: v.string(),
          })
        ),
      })
    ),
  }).index("by_conversation", ["conversationId"]),

  researchResults: defineTable({
    companyName: v.string(),
    businessAnalysis: v.string(),
    keyPeople: v.array(v.string()),
    recentDevelopments: v.string(),
    links: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
      })
    ),
    highlights: v.string(),
    notes: v.optional(v.string()),
    isOpen: v.boolean(),
    createdAt: v.number(),
    industry: v.optional(v.string()),
    funding: v.optional(v.string()),
    confidence: v.optional(v.number()),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_company", ["companyName"]),

  companyResearch: defineTable({
    name: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    lastUpdated: v.number(),
    metadata: v.optional(
      v.object({
        industry: v.optional(v.string()),
        founded: v.optional(v.string()),
        headquarters: v.optional(v.string()),
        revenue: v.optional(v.string()),
        employees: v.optional(v.string()),
      })
    ),
  })
    .index("by_name", ["name"])
    .index("by_lastUpdated", ["lastUpdated"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
});
