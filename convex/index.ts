import { query } from "./_generated/server";
import { v } from "convex/values";

export const getResearchResults = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("researchResults"),
      companyName: v.string(),
      industry: v.optional(v.string()),
      keyPeople: v.array(v.string()),
      funding: v.optional(v.string()),
      confidence: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    const results = await ctx.db.query("researchResults").order("desc").take(10);

    return results.map((result) => ({
      _id: result._id,
      companyName: result.companyName,
      industry: result.industry,
      keyPeople: result.keyPeople,
      funding: result.funding,
      confidence: result.confidence,
    }));
  },
});
