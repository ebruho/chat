import { Id } from "@/convex/_generated/dataModel";
import { Card } from "./ui/card";
import React from "react";
// import { Avatar } from "@radix-ui/react-avatar";
import { Avatar } from "./ui/avatar"
import { AvatarFallback, AvatarImage } from "./ui/avatar";
import { Check, User, X } from "lucide-react";
import { Button } from "./ui/button";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import error from "next/error";

type Props = {
    id: Id<"requests">;
    imageUrl: string;
    username: string;
    email: string;
};

const Request = ({ id, imageUrl, username, email }: Props) => {
    const { mutate: denyRequest, pending: denyPending } = useMutationState(api.request.deny);

    const { mutate: acceptRequest, pending: acceptPending } = useMutationState(api.request.accept);

    return (
        <Card className="w-full p-2 flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-4 truncate">
                <Avatar>
                    <AvatarImage src={imageUrl} />
                    <AvatarFallback>
                        <User />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                    <h4 className="truncate">{username}</h4>
                    <p className="text-xstext-muted-foreground truncate">
                        {email}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="icon" disabled={denyPending || acceptPending} onClick={() => {
                    acceptRequest({ id }).then(() => {
                        toast.success("Friend request accepted")
                    }
                    ).catch((err) => {
                        toast.error(error instanceof ConvexError ? error.data : "An error occurred while denying the friend request");
                    });
                }}

                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" disabled={denyPending || acceptPending} variant="destructive" onClick={() => {
                    denyRequest({ id }).then(() => {
                        toast.success("Friend request denied")
                    }
                    ).catch((err) => {
                        toast.error(error instanceof ConvexError ? error.data : "An error occurred while denying the friend request");
                    });
                }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}

export default Request;