"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, MapPin, Clock, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  userId: string;
  allDay: boolean;
}

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  if (!event) return null;

  const formatEventTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a");
  };

  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg w-[90vw] max-w-[450px] focus:outline-none z-[51]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {event.title}
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1.5 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-x-2">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-gray-700">
                  {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-x-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  {isValidUrl(event.location) ? (
                    <a
                      href={event.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline flex items-center gap-x-1"
                    >
                      Join meeting
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-gray-700">{event.location}</p>
                  )}
                </div>
              </div>
            )}

            {event.description && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
