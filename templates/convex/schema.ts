import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** The five pipeline stages a lead moves through. Reused by the CRM functions. */
export const LEAD_STATUS = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("quoted"),
  v.literal("won"),
  v.literal("lost"),
);

export default defineSchema({
  /**
   * One row per enquiry. Written by the public website form (submitLead),
   * read + worked in the CRM dashboard.
   */
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    message: v.string(),
    /** where it came from — "website" or "manual" */
    source: v.optional(v.string()),
    status: LEAD_STATUS,
    /** estimated / quoted value in currency MAJOR units (e.g. 1500 = $1,500) */
    value: v.optional(v.number()),
    /** append-only activity trail */
    notes: v.array(v.object({ text: v.string(), at: v.number() })),
    paid: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),
});
