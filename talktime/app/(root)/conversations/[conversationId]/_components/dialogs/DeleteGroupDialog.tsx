"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutationState } from "@/hooks/useMutationState";
import { AlertDialogAction, AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { ConvexError } from "convex/values";
import React, { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { UserMinus, AlertTriangle } from "lucide-react";

type Props = {
    conversationId: Id<"conversations">;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const DeleteGroupDialog = ({conversationId, open, setOpen} : Props) => {
    const {mutate: deleteGroup, pending } = useMutationState(api.conversation.deleteGroup);

    const handleDeletedGroup = async() => {
        deleteGroup({conversationId}).then(() => {
            toast.success("The group successfully deleted");
            setOpen(false); // Close dialog on success
        }).catch((error) => {
            toast.error(
                error instanceof ConvexError ?
                error.data
                : "Unexpected error occurred"
            );
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                            <UserMinus className="w-6 h-6" />
                        </div>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-left">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-foreground/70 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground mb-2">This action cannot be undone.</p>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    All messages will be permanently deleted and you will not be able to message this group again. 
                                    Your other conversations and group chats will remain unaffected.
                                </p>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending} className="rounded-xl">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction 
                        disabled={pending} 
                        onClick={handleDeletedGroup}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl p-3"
                    >
                        {pending ? "Deleting..." : "Delete Group"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteGroupDialog;