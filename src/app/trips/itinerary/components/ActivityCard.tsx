"use client";

import {
  useActivitiesContext,
  useTripsContext,
} from "@/app/_context/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { deleteActivity } from "@/utils/supabase/supabaseRequests";
import {
  HOURS,
  HourType,
  MINUTE,
  MinuteType,
  PERIOD,
  PeriodType,
  UserRole,
} from "@/validators/options";
import { EllipsisVertical, Loader, Map, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Database } from "../../../../../database.types";

type Activities = Database["public"]["Tables"]["activities"]["Row"];

interface Time {
  hour: string;
  minute: string;
  period: string;
}

const ActivityCard = ({
  activities,
  userRole,
  onSuccess,
}: {
  activities: Activities;
  userRole: UserRole;
  onSuccess: () => void;
}) => {
  const { name, time, address, description, id: activityId } = activities;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const { editData, setEditData, editActivity, getToken } =
    useActivitiesContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { darkMode } = useTripsContext();

  const timeHour = time && time.split(":")[0];
  const timeMinute = time && time.split(":")[1].split(" ")[0];
  const timePeriod = time && time.split(" ")[1];
  const [editTime, setEditTime] = useState<Time>({
    hour: timeHour ?? "8",
    minute: timeMinute ?? "00",
    period: timePeriod ?? "AM",
  });

  function handleEditData() {
    setIsEditOpen(true);
    setEditData({ name, time, address, description });
  }

  async function handleEditSubmit() {
    setIsSubmitting(true);

    if (
      editData.name === name &&
      editData.address === address &&
      editData.time === time &&
      editData.description === description
    ) {
      toast({
        title: "No changes were made",
        description: "Your activity details remain the same.",
        variant: "default",
      });
      setIsEditOpen(false);
      setIsSubmitting(false);
      return;
    }

    const result = await editActivity({ activityId });
    if (!result) {
      setIsSubmitting(false);
      // setEditData({ name, time, address, description });

      toast({
        title: "Update Error",
        description:
          "There has been an error updating the activity. Please try again.",
        variant: "default",
      });
      return;
    }

    if (result.length >= 1) {
      setIsEditOpen(false);
      setIsSubmitting(false);
    }
  }

  async function handleDeleteActivity() {
    const token = await getToken({ template: "lakbai-supabase" });
    const error = await deleteActivity({ token, activityId });

    if (error) {
      toast({
        title: "Deletion failed.",
        description: "Please try again later.",
        variant: "default",
      });
      return;
    }
    // Update the state with database
    onSuccess();
    return;
  }

  useEffect(() => {
    const time = `${editTime.hour}:${editTime.minute} ${editTime.period}`;
    setEditData((prev) => ({ ...prev, time }));
  }, [editTime, setEditData]);

  return (
    <div
      className={`relative flex items-center space-x-4 bg-card hover:bg-primary/50 border-accent border-2 rounded-2xl p-6 cursor-pointer transition-all`}
    >
      {/* Card Details */}
      <div className="text-left space-y-1 pr-6">
        <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
          {time}
        </p>
        <h2 className="text-title text-base sm:text-xl font-extrabold">
          {name}
        </h2>
        <p className="text-xs text-muted-foreground font-semibold line-clamp-1">
          {address}
        </p>
        <p className="text-sm text-muted-foreground font-medium line-clamp-1">
          {description}
        </p>
      </div>

      {/* View Details Button (whole card) */}
      <div
        onClick={() => setIsViewOpen(true)}
        className="absolute inset-0 z-10"
      />

      {/* [VIEW] Activity Detail Sheet  */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="overflow-auto">
          <SheetHeader>
            <SheetTitle>Activity Details</SheetTitle>
            <SheetDescription>
              View of the full details of the selected activity.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label className="text-left">Name</Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{name}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="text-left">Location</Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{address}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="text-left">Time</Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{time}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="text-left">Description</Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>
                  {description || description!.length >= 1 ? (
                    description
                  ) : (
                    <span className="select-none text-gray-700/70">
                      No description for this activity.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURI(
                address!
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "default" })}
            >
              See Location
            </Link>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Activity Options Button */}
      {(userRole === "owner" || userRole === "edit") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="absolute top-5 right-5 size-7 rounded-full bg-accent/50 text-accent-foreground/50 flex justify-center items-center z-20 hover:bg-accent transition-colors">
              <EllipsisVertical width={15} height={15} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={handleEditData}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              <span>Edit Activity</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer">
              <Map className="mr-2 h-4 w-4" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURI(
                  address!
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Maps
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setDeleteAlert(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete Activity</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete Activity Alert Dialog */}
      {(userRole === "owner" || userRole === "edit") && (
        <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will delete the currently selected activity. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteActivity}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* [EDIT] Editing Screen */}
      {(userRole === "owner" || userRole === "edit") && (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="max-w-[940px]">
            <SheetHeader>
              <SheetTitle>Edit activity</SheetTitle>
              <SheetDescription>
                Make changes to this activity here. Click save when you&apos;re
                done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <Input
                  disabled={isSubmitting}
                  id="name"
                  className="col-span-3"
                  value={editData.name ?? ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Location</Label>
                <div className="col-span-3">
                  <GooglePlacesAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                    selectProps={{
                      isDisabled: isSubmitting,
                      defaultInputValue: editData.address ?? "",
                      onChange: (value) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: value!.label,
                        })),
                      styles: {
                        option: (provided) => ({
                          ...provided,
                          color: "black",
                        }),
                        input: (provided) => ({
                          ...provided,
                          color: darkMode ? "white" : "black",
                          fontSize: "0.875rem",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: darkMode ? "white" : "black",
                          fontSize: "0.875rem",
                        }),
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: darkMode
                            ? "hsl(74 58% 8%)"
                            : "hsl(74 56% 98%)",
                          borderColor: darkMode
                            ? "hsl(197.14 6.09% 22.55%)"
                            : "hsl(220 13% 91%)",
                        }),
                      },
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="col-span-1 text-right">Time</Label>

                {/* Hour */}
                <Select
                  disabled={isSubmitting}
                  value={editTime.hour}
                  onValueChange={(value) =>
                    setEditTime((prev) => ({
                      ...prev,
                      hour: value as HourType,
                    }))
                  }
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="00" />
                  </SelectTrigger>
                  <SelectContent className="col-span-1" position="popper">
                    {HOURS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Minute */}
                <Select
                  disabled={isSubmitting}
                  value={editTime.minute}
                  onValueChange={(value) =>
                    setEditTime((prev) => ({
                      ...prev,
                      minute: value as MinuteType,
                    }))
                  }
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="00" />
                  </SelectTrigger>
                  <SelectContent className="col-span-1" position="popper">
                    {MINUTE.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Period */}
                <Select
                  disabled={isSubmitting}
                  value={editTime.period}
                  onValueChange={(value) =>
                    setEditTime((prev) => ({
                      ...prev,
                      period: value as PeriodType,
                    }))
                  }
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="AM" />
                  </SelectTrigger>
                  <SelectContent className="col-span-1" position="popper">
                    {PERIOD.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-start  gap-4">
                <Label className="text-right mt-2">Description</Label>
                <Textarea
                  disabled={isSubmitting}
                  id="username"
                  className="col-span-3"
                  value={editData.description ?? ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <SheetFooter>
              <Button disabled={isSubmitting} onClick={handleEditSubmit}>
                {isSubmitting ? (
                  <div className="flex space-x-2 justify-center items-center">
                    <Loader width={12} height={12} className="animate-spin" />
                    <span>Updating..</span>
                  </div>
                ) : (
                  "Save changes"
                )}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default ActivityCard;
