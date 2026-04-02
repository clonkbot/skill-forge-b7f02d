import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listBySkill = query({
  args: { skillId: v.id("skills") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiSuggestions")
      .withIndex("by_skill", (q) => q.eq("skillId", args.skillId))
      .order("desc")
      .take(10);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("aiSuggestions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const save = mutation({
  args: {
    skillId: v.optional(v.id("skills")),
    prompt: v.string(),
    suggestion: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("aiSuggestions", {
      userId,
      skillId: args.skillId,
      prompt: args.prompt,
      suggestion: args.suggestion,
      createdAt: Date.now(),
    });
  },
});
