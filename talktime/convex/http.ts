import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const validatePayload = async (req: Request):
    Promise<WebhookEvent | undefined> => {
    const payload = await req.text();
    console.log("Received webhook payload:", payload);

    const svixHeader = {
        "svix-id": req.headers.get("svix-id")!,
        "svix-timestamp": req.headers.get("svix-timestamp")!,
        "svix-signature": req.headers.get("svix-signature")!,
    }

    console.log("Svix headers:", svixHeader);

    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

    try {
        const event = webhook.verify(payload, svixHeader) as WebhookEvent;
        console.log("Webhook event verified successfully:", event.type, event.data.id);
        return event;
    } catch (error) {
        console.error("Webhook verification failed:", error);
        return;
    }
}

const handleClerkWebhook = httpAction(async (ctx, req) => {
    console.log("Webhook handler called");
    
    const event = await validatePayload(req);

    if (!event) {
        console.error("Invalid webhook payload");
        return new Response("Invalid webhook payload", { status: 400 });
    }

    console.log("Processing webhook event:", event.type, "for user:", event.data.id);

    switch (event.type) {
        case "user.created": {
            console.log("User created event received for:", event.data.id);
            const user = await ctx.runQuery(internal.user.getByClerkId, { clerkId: event.data.id });
            if (user) {
                console.log(`User ${event.data.id} already exists, updating...`);
            } else {
                console.log(`User ${event.data.id} does not exist, creating new user...`);
            }
            // fall through to user.updated to ensure user is created/updated
        }
        case "user.updated": {
            console.log("Creating or updating user:", event.data.id);
            try {
                await ctx.runMutation(internal.user.create, {
                    username: `${event.data.first_name || ''} ${event.data.last_name || ''}`.trim() || 'Unknown User',
                    imageUrl: event.data.image_url || '',
                    clerkId: event.data.id,
                    email: event.data.email_addresses[0]?.email_address || '',
                });
                console.log("User successfully created/updated in Convex:", event.data.id);
            } catch (error) {
                console.error("Error creating/updating user in Convex:", error);
                return new Response("Error processing user", { status: 500 });
            }
            return new Response("Webhook event processed", { status: 200 });
        }
        default: {
            console.log("Clerk webhook event not supported:", event.type);
            return new Response("Webhook event type not supported", { status: 200 });
        }
    }
})

http.route({
    path: "/clerk-users-webhook",
    method: "POST",
    // This route handles Clerk webhook events for user creation and updates.
    handler: handleClerkWebhook,
})

export default http;