import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Public functions
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("researchResults").order("desc").collect();
  },
});

export const toggleOpen = mutation({
  args: {
    id: v.id("researchResults"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    if (!result) {
      throw new Error("Research result not found");
    }
    await ctx.db.patch(args.id, {
      isOpen: !result.isOpen,
    });
  },
});

export const deleteResult = mutation({
  args: {
    id: v.id("researchResults"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateNotes = mutation({
  args: {
    id: v.id("researchResults"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    if (!result) {
      throw new Error("Research result not found");
    }
    await ctx.db.patch(args.id, {
      notes: args.notes,
    });
  },
});

// Internal functions
export const create = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("researchResults", {
      ...args,
      isOpen: false,
      createdAt: Date.now(),
    });
  },
});
