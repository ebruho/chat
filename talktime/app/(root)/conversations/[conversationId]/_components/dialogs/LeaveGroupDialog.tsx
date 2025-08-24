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

const LeaveGroupDialog = ({conversationId, open, setOpen} : Props) => {
    const {mutate: leaveGroup, pending } = useMutationState(api.conversation.leaveGroup);

    const handleLeaveGroup = async() => {
        leaveGroup({conversationId}).then(() => {
            toast.success("You successfully left the group");
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
                        <AlertDialogTitle>Leave Group</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-left">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-foreground/70 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground mb-2">This action cannot be undone.</p>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    You will no longer be able to send or receive messages in this group. 
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
                        onClick={handleLeaveGroup}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl p-3"
                    >
                        {pending ? "Leaving..." : "Leave Group"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default LeaveGroupDialog;