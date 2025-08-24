import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId: identity.subject
        })

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

   
        const friendships1 = await ctx.db.query("friends")
            .withIndex("by_user1", (q) => q.eq("user1", currentUser._id)).collect(); // Get friendships where current user is user1

        const friendships2 = await ctx.db.query("friends")
            .withIndex("by_user2", (q) => q.eq("user2", currentUser._id)).collect(); // Get friendships where current user is user2
        
        const friendships = [...friendships1, ...friendships2]; // Combine both friendships, creating a full list

        const friends = await Promise.all(friendships.map(async (friendship) => {
            const friend = await ctx.db.get(friendship.user1 === currentUser._id ? friendship.user2 : friendship.user1); // Get the friend details

            if (!friend) {
                throw new ConvexError("Friend not found");
            }

            return friend;
        }));

        return friends;
    },
});
// This query retrieves all friends of the current user by checking both directions of the friendship relationship.

export const createGroup = mutation({
    args: {
        members: v.array(v.id("users")),
        name: v.string(),
    }, 
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await getUserByClerkId({
            ctx, clerkId: identity.subject
        })

        if (!currentUser) {
            throw new ConvexError("User not found");
        }

       const conversationId = await ctx.db.insert("conversations",{
        isGroup: true,
        name: args.name,
       });

       await Promise.all([...args.members, currentUser._id].map(async (memberId) => {
            await ctx.db.insert("conversationMembers",{
                memberId,
                conversationId,
            });
       }))
    }
});
// This mutation is used to create a group conversation with the specified members and name. It inserts a new conversation into the "conversations" table and adds each member to the "conversationMembers" table.