"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  status: z.enum(["Pending", "Paid", "Cancelled", "Refunded"]),
});

type FormData = z.infer<typeof formSchema>;

export function CreateInvoice({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      status: "Pending",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      toast.success("Invoice created successfully");
      onOpenChange(false);
      onSuccess();
      form.reset();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Create invoice
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="text-sm text-gray-500">
              Fill in the details below to create a new invoice.
            </Dialog.Description>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label.Root htmlFor="clientName" className="text-sm font-medium">
                Client Name*
              </Label.Root>
              <Input
                id="clientName"
                {...form.register("clientName")}
                disabled={isLoading}
              />
              {form.formState.errors.clientName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.clientName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label.Root htmlFor="clientEmail" className="text-sm font-medium">
                Client Email*
              </Label.Root>
              <Input
                id="clientEmail"
                type="email"
                {...form.register("clientEmail")}
                disabled={isLoading}
              />
              {form.formState.errors.clientEmail && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.clientEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label.Root htmlFor="status" className="text-sm font-medium">
                Status*
              </Label.Root>
              <select
                id="status"
                {...form.register("status")}
                disabled={isLoading}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Create Invoice
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
