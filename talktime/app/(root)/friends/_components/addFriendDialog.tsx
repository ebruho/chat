"use client";

import React from "react";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipContent } from "@/components/ui/tooltip";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

const addFrientFromSchema = z.object({
    email: z.string().min(1, { message: "Email is required" })
        .email("Please enter a valid email"),
});

const AddFriendDialog = () => {

    const {mutate: createRequest, pending} = useMutationState(api.request.create);

    const form = useForm<z.infer<typeof addFrientFromSchema>>({
        resolver: zodResolver(addFrientFromSchema),
        defaultValues: {
            email: "",
        },
    });

    const handleSubmit = async (values: z.infer<typeof addFrientFromSchema>) => {
        await createRequest({email: values.email}).then(() => {
            form.reset();
            toast.success("Friend request sent successfully!");
        }).catch((error) => {
            toast.error(error instanceof ConvexError ? error.data : "An error occurred while sending the friend request");
        })
    };

    return (
        <Dialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" className="w-12 h-12 rounded-xl hover-lift">
                        <DialogTrigger>
                            <UserPlus className="w-5 h-5" />
                        </DialogTrigger>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Friend</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <DialogTitle>Add Friend</DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground/80">
                        Send a friend request by entering their email address. They'll receive a notification and can accept your request.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-base font-medium">Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60 w-4 h-4" />
                                        <Input 
                                            placeholder="Enter friend's email" 
                                            className="pl-10 rounded-xl"
                                            {...field} 
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <DialogFooter>
                            <Button 
                                disabled={pending} 
                                type="submit" 
                                variant="default"
                                className="rounded-xl w-full sm:w-auto"
                            >
                                {pending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Request
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddFriendDialog;