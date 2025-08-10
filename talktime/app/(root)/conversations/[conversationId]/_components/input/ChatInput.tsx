"use client"

import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { api } from "@/convex/_generated/api";
import { useConversation } from "@/hooks/useConversation";
import { useMutationState } from "@/hooks/useMutationState";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import TextareaAutosize from "react-textarea-autosize"
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

const chatMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
});

export const ChatInput = () => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    const {conversationId} = useConversation();

    const {mutate: createMessage, pending} = useMutationState(api.message.create);

    const form = useForm<z.infer<typeof chatMessageSchema>>({
        resolver: zodResolver(chatMessageSchema),
        defaultValues: {
            content: "",
        },
    });

    const handleInputChange = (event: any) => {
        const {value, selectionStart} = event.target;

        if (selectionStart !== null){
            form.setValue("content", value)
        }
    }

    const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
        try {
            await createMessage({
                conversationId,
                type: "text",
                content: [values.content]
            });
            form.reset();
        } catch (error) {
            // console.error("Error creating message:", error);
            toast.error(error instanceof ConvexError ?
                error.data : "Unexpected error occured"
            );
        }
    }

    const onSubmit = form.handleSubmit(handleSubmit);

    return (
        // <Card className="w-full p-2 rounded-lg relative shadow-md">
        //     <form onSubmit={onSubmit} className="flex gap-2">
        //         <input
        //             type="text"
        //             placeholder="Type a message..."
        //             className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        //             {...form.register("content")}
        //             disabled={pending}
        //         />
        //         <button
        //             type="submit"
        //             disabled={pending}
        //             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        //         >
        //             {pending ? "Sending..." : "Send"}
        //         </button>
        //     </form>
        // </Card>
        <Card className="w-full p-2 rounded-lg relative">
            <div className="flex gap-2 items-end w-full">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-end gap-2 w-full">
                        <FormField control={form.control} name="content"
                        render={({field}) => {
                            return <FormItem className="h-full w-full">
                                <FormControl>
                                    <TextareaAutosize onKeyDown={async e =>{
                                        if(e.key === "Enter" && !e.shiftKey){
                                            e.preventDefault();
                                            await form.handleSubmit(handleSubmit)();
                                        }
                                    }} rows={1} maxRows={3} {...field} onChange={handleInputChange} onClick={handleInputChange} placeholder="Type a message..." className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
    
                        }} />
                          

                          <Button disabled={pending} size="icon" type="submit">
                                <SendHorizonal />
                            </Button>
                    </form>
                </Form>
            </div>
        </Card>
    );
}

export default ChatInput;