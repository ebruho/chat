"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { AlertDialogAction, AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { ConvexError } from "convex/values";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

type Props = {
    conversationId: Id<"conversations">;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const RemoveFriendDialog = ({conversationId, open, setOpen} : Props) => {
    const {mutate: removeFriend, pending } = useMutationState(api.friend.remove);

    const handleRemoveFriend = async() => {
        removeFriend({conversationId}).then(() => {
            toast.success("The friend successfully removed")
        }).catch((error) => {
            toast.error(
                error instanceof ConvexError ?
                error.data
                : "Unexpected error occured"
            );
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. All messages will be deleted
                        and you will not be able to message this user. All group chats will
                        still work as normal.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction disabled={pending} onClick={handleRemoveFriend}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default RemoveFriendDialog;