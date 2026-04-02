import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  skills: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    skillType: v.union(v.literal("claude"), v.literal("grok")),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_and_type", ["userId", "skillType"]),

  aiSuggestions: defineTable({
    userId: v.id("users"),
    skillId: v.optional(v.id("skills")),
    prompt: v.string(),
    suggestion: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_skill", ["skillId"]),

  templates: defineTable({
    name: v.string(),
    description: v.string(),
    skillType: v.union(v.literal("claude"), v.literal("grok")),
    content: v.string(),
  }),
});
