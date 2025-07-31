"use client";

import React from "react";
import { email, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { TooltipContent } from "@radix-ui/react-tooltip";
import { TooltipContent } from "@/components/ui/tooltip";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutationState } from "@/hooks/useMutationState";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { ConvexError } from "convex/values";

// type Props = {}

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
                    <Button size="icon" variant="outline">
                        <DialogTrigger >
                            <UserPlus />
                        </DialogTrigger>

                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Friend</p>
                </TooltipContent>
            </Tooltip>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                        Send a request to add a friend by entering their email address.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <DialogFooter>
                            <Button disabled={pending} type="submit" variant="default">
                                Send Request
                            </Button>
                        </DialogFooter>

                    </form>
                </Form>

            </DialogContent>
        </Dialog>
    );
};

export default AddFriendDialog;