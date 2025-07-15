import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string()
    },
    // This mutation is used to create a new user in the database.
    // It takes the user's username, image URL, Clerk ID, and email as arguments.
    handler: async (ctx, args) => {
        await ctx.db.insert("users", args);
    },
});

// export const getByClerkId = internalQuery({
//     args: { clerkId: v.string() },
//     async handler(ctx, args) {
//         return ctx.db.query("users").withIndex("byClerkId").filter((q) => q.eq(q.field("clerkId"), args.clerkId)).unique();
//     }
// });    

export const getByClerkId = internalQuery({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
        return ctx.db
        .query("users")
        .withIndex("byClerkId",(q) => q.eq("clerkId", args.clerkId))
        .unique();
    }
});    