"use client";

import * as React from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().optional(),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true;
  return data.endTime > data.startTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type FormValues = z.infer<typeof formSchema>;

interface AddEventDialogProps {
  selectedDate: Date;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export function AddEventDialog({ selectedDate, isOpen, onClose, onSubmit }: AddEventDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: selectedDate,
      startTime: "09:00",
      endTime: "10:00",
      location: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg p-6 shadow-lg w-[90vw] max-w-[450px] z-[51]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Event</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: ControllerRenderProps<FormValues, "title"> }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting with team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: ControllerRenderProps<FormValues, "description"> }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add event description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }: { field: ControllerRenderProps<FormValues, "date"> }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }: { field: ControllerRenderProps<FormValues, "startTime"> }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }: { field: ControllerRenderProps<FormValues, "endTime"> }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }: { field: ControllerRenderProps<FormValues, "location"> }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting room, Zoom link, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-x-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Event
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
