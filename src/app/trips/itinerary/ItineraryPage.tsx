"use client";

import {
  defaultActivityData,
  useActivitiesContext,
  useTripsContext,
} from "@/app/_context/AppContext";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  deleteActivity,
  deleteItinerary,
  getSpecificActivity,
  updateDay,
} from "@/utils/supabase/supabaseRequests";
import {
  HOURS,
  HourType,
  MAX_DAYS,
  MINUTE,
  MinuteType,
  NUMBER_OF_PEOPLE,
  PERIOD,
  PeriodType,
  UserRole,
} from "@/validators/options";
import { format } from "date-fns";
import {
  EllipsisVertical,
  Info,
  Loader,
  Map,
  Minus,
  Notebook,
  Plus,
  Printer,
  Share,
  SquarePen,
  Trash,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useMediaQuery } from "usehooks-ts";
import { Database } from "../../../../database.types";
import { FetchTripData } from "./page";

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];

const ItineraryPage: FC<FetchTripData> = ({
  activities,
  itinerary,
  userRole,
}) => {
  const router = useRouter();
  const { getToken } = useTripsContext();
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails | null>(itinerary?.[0] ?? null);
  const [tripActivities, setTripActivities] = useState<Activities[] | null>(
    activities
  );
  const numOfPeople = NUMBER_OF_PEOPLE.find(
    ({ value }) => value === itineraryDetails?.num_of_people
  );
  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<string | null>();
  const [filteredActivities, setFilteredActivities] = useState<
    Activities[] | null
  >([]);

  //   Alert/Dialog/Modal Screen handling
  const [isAddActivityOpen, setIsAddActivityOpen] = useState<boolean>(false);
  const [deleteTripOpen, setDeleteTripOpen] = useState<boolean>(false);

  const { requestComplete } = useActivitiesContext();

  const [startYear, startMonth, startDay] = itineraryDetails!.start_date
    .split("-")
    .map((i) => Number(i));
  const [endYear, endMonth, endDay] = itineraryDetails!.end_date
    .split("-")
    .map((i) => Number(i));

  const startDate = format(new Date(startYear, startMonth, startDay), "PP");
  const endDate = format(new Date(endYear, endMonth, endDay), "PP");

  // Set selectedDay based on URL on mount
  useEffect(() => {
    const dayParam = searchParams.get("day");

    if (
      dayParam &&
      Number(dayParam) <= MAX_DAYS &&
      Number(dayParam) <= (itineraryDetails?.days_count || 1)
    ) {
      setSelectedDay(String(dayParam));
    } else if (itineraryDetails && itineraryDetails?.days_count >= 1) {
      setSelectedDay("1");
    }
  }, []);

  // Set URL & filter activities on state change
  useEffect(() => {
    // Set URL on state change
    if (selectedDay) {
      window.history.pushState(
        null,
        "",
        `?id=${itineraryDetails?.id}&day=${selectedDay}`
      );
    }

    // Filter activities on state change
    if (selectedDay) {
      const activities = tripActivities?.filter((i) => i.day === +selectedDay);

      activities?.sort((a, b) => {
        return (
          new Date(`2024/10/${a.day} ${a.time}`).getTime() -
          new Date(`2024/10/${a.day} ${b.time}`).getTime()
        );
      });

      if (activities && activities.length > 0) {
        setFilteredActivities(activities);
      } else {
        setFilteredActivities([]);
      }
    }
  }, [selectedDay, tripActivities, itineraryDetails?.id]);

  const syncWithDatabase = async () => {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await getSpecificActivity({
      token,
      itineraryId: itineraryDetails?.id,
    });
    if (result) {
      setTripActivities(result);
    }
  };

  useEffect(() => {
    syncWithDatabase();
  }, [requestComplete]);

  const handleAddDay = async () => {
    setItineraryDetails((prev) => {
      if (prev) {
        const dayNum = prev.days_count + 1;

        if (dayNum === 1) {
          setSelectedDay("1");
        }

        if (prev.days_count >= 14) {
          toast({
            title: "Day count exceeded",
            description: `Maximum number of days is ${MAX_DAYS}`,
            variant: "destructive",
          });

          return prev;
        }
        return { ...prev, days_count: dayNum };
      }
      return null;
    });

    const token = await getToken({ template: "lakbai-supabase" });
    await updateDay({
      token,
      action: "add",
      day: itineraryDetails!.days_count + 1,
      itineraryId: itineraryDetails!.id,
    });
  };

  const handleDeleteDay = async () => {
    setItineraryDetails((prev) => {
      if (prev) {
        const dayNum = prev.days_count - 1;

        if (prev.days_count === 0) {
          toast({
            title: "Day count at 0",
            description: `You cannot remove any more days.`,
            variant: "default",
          });

          return prev;
        }
        return { ...prev, days_count: dayNum };
      }
      return null;
    });

    if (itineraryDetails!.days_count === 0) {
      return;
    }

    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updateDay({
      token,
      action: "delete",
      day: itineraryDetails!.days_count - 1,
      itineraryId: itineraryDetails!.id,
    });
    console.log(result);
  };

  const handleDeleteTrip = async () => {
    const token = await getToken({ template: "lakbai-supabase" });
    const error = await deleteItinerary({
      token,
      itineraryId: itineraryDetails?.id,
    });

    if (error) {
      toast({
        title: "Deletion failed.",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }
    // Re-route to Trips page on success
    router.push("/trips");
    return;
  };

  return (
    <MaxWidthWrapper className="flex w-full flex-col py-14 md:py-20">
      <div className="list-inside list-decimal text-sm text-center sm:text-left">
        {/* Title Section */}
        <section className="flex flex-row space-y-4 justify-between w-full mb-14">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row text-5xl md:text-6xl font-bold text-left space-y-4 md:space-y-0 mr-4">
              <h1 className="text-title dark:text-title-foreground text">
                {itineraryDetails?.name ?? "Gio's Crazy Party"}
                <span className="ml-2">{itineraryDetails?.emoji ?? "🦜"}</span>
              </h1>
            </div>
            <div className="flex flex-row flex-wrap gap-2 text-base">
              <Badge variant="outline">
                📍 {itineraryDetails?.address ?? "Brat House 👽"}
              </Badge>
              <Badge variant="outline">
                {numOfPeople?.display ?? "👹 69 Bachelors"}
              </Badge>
              <Badge variant="outline">
                📅 {startDate} to {endDate}
              </Badge>
            </div>
            <div className="flex space-x-2 space-y-0">
              <Button variant="secondary" className="">
                <Notebook className="mr-2 h-4 w-4" />
                <span>Notes</span>
              </Button>
              <Button variant="default" className="">
                <Share className="mr-2 h-4 w-4" />
                <span>Share Itinerary</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-start space-y-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="">
                  <EllipsisVertical
                    width={17}
                    height={17}
                    className="shrink-0"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {userRole === "owner" && (
                  <DropdownMenuItem className="cursor-pointer">
                    <SquarePen className="mr-2 h-4 w-4" />
                    <span>Edit Trip Details</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="cursor-pointer">
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Print Itinerary</span>
                </DropdownMenuItem>
                {userRole === "owner" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteTripOpen(true)}
                      className="cursor-pointer"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete Trip</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* [OWNER] Deleting Trip */}

        {(userRole === "edit" || userRole === "owner") &&
          itineraryDetails?.days_count !== 0 && (
            <AlertDialog open={deleteTripOpen} onOpenChange={setDeleteTripOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the trip: {itineraryDetails?.name} and all
                    of its activities. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteTrip}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

        {/* Horizontal Separator */}
        <div className="h-px w-full bg-slate-200"></div>

        {/* Itinerary Section */}
        <section className="flex flex-col space-y-10 mt-8  w-full">
          <div className="flex flex-col sm:flex-row space-y-2 justify-between">
            <div className="space-y-2 text-left">
              <h1 className="text-4xl font-bold">Itinerary</h1>
              <p className="text-sm opacity-80">
                Overview of your trip to {itineraryDetails?.address}
              </p>
            </div>

            {/* Selecting/Adding Day in Itenerary */}
            <div className="flex flex-col space-y-1">
              <p className="opacity-80 hidden md:block">Select day to view</p>
              <Select
                value={selectedDay || undefined}
                onValueChange={(value) => setSelectedDay(value)}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue
                    placeholder={
                      userRole === "edit" || userRole === "owner"
                        ? "Add Day"
                        : "Select Day"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: itineraryDetails?.days_count || 0 },
                    (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        Day {i + 1}
                      </SelectItem>
                    )
                  )}
                  <div className="flex space-x-1 mt-1">
                    {/* Adding Day */}
                    {(userRole === "edit" || userRole === "owner") &&
                      itineraryDetails!.days_count < MAX_DAYS && (
                        <Button
                          className={`text-sm font-normal w-full justify-center space-x-1 flex`}
                          variant="default"
                          onClick={handleAddDay}
                        >
                          <Plus width={13} height={13} />
                        </Button>
                      )}

                    {/* Removing Days */}
                    {(userRole === "edit" || userRole === "owner") &&
                      itineraryDetails?.days_count !== 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className={`text-sm font-normal w-full justify-center space-x-1 flex`}
                              variant="secondary"
                            >
                              <Minus width={13} height={13} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the latest day which is Day{" "}
                                {itineraryDetails?.days_count}. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteDay}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px w-full bg-slate-200"></div>

          {/* Activities Display Section  */}
          {itineraryDetails!.days_count === 0 && (
            <div className="w-full flex flex-col justify-center items-center min-h-56 space-y-1 bg-card border-border border-2 border-dashed rounded-xl transition-all">
              <span className="text-2xl">👻</span>
              <h3 className="text-lg">
                {userRole === "owner" || userRole === "edit"
                  ? "Start planning your trip!"
                  : "Boo! "}
              </h3>
              {userRole === "owner" || userRole === "edit" ? (
                <p className="text-sm opacity-60">
                  Click the <span className="font-semibold">Add Day</span>{" "}
                  button.
                </p>
              ) : (
                <p className="text-sm opacity-60">It&apos;s empty in here..</p>
              )}
            </div>
          )}

          {itineraryDetails!.days_count === 0 ||
            (selectedDay && selectedDay !== "0" && (
              <section className="flex flex-col space-y-6 p-8 bg-accent/70 rounded-2xl shadow-md">
                <div className="flex justify-between">
                  <h3 className="text-3xl font-bold">Day {selectedDay}</h3>
                  {(userRole === "owner" || userRole === "edit") && (
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        className="ring-1 ring-gray-400/30"
                        onClick={() => setIsAddActivityOpen(true)}
                      >
                        <Plus width={14} height={14} />{" "}
                        <span className="ml-2 hidden sm:block">
                          Add activity
                        </span>
                      </Button>

                      {/* Add Activity Sheet Screen */}
                      <AddActivitySheet
                        isAddActivityOpen={isAddActivityOpen}
                        setIsAddActivityOpen={setIsAddActivityOpen}
                        itineraryId={itineraryDetails?.id}
                        selectedDay={selectedDay}
                      />
                    </div>
                  )}
                </div>

                {/* Check if there are activities in the DB for the selected day */}
                {!filteredActivities || filteredActivities.length === 0 ? (
                  <div className="w-full flex flex-col justify-center items-center min-h-56 space-y-1 bg-card border-border border-2 border-dashed rounded-xl transition-all">
                    <span className="text-2xl">👻</span>
                    <h3 className="text-lg">Add activities to your trip!</h3>
                    <p className="text-sm opacity-60">
                      Click the{" "}
                      <span className="font-semibold">Add activity</span>{" "}
                      button.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredActivities.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activities={a}
                        userRole={userRole}
                        onSuccess={() => syncWithDatabase()}
                      />
                    ))}
                    {(userRole === "owner" || userRole === "edit") && (
                      <Button
                        variant="outline"
                        className="h-full min-h-[100px] flex items-center justify-center border-2 rounded-2xl border-dashed border-border cursor-pointer "
                        onClick={() => setIsAddActivityOpen(true)}
                      >
                        <p className="font-medium text-base text-foreground/60">
                          + add activity
                        </p>
                      </Button>
                    )}
                  </div>
                )}

                {/* Reminder Message */}
                <div className="flex flex-col md:flex-row items-center space-x-2 p-4 rounded-xl border-ring border-1 border-dashed bg-primary">
                  <div className="flex items-center space-x-2">
                    <Info
                      width={15}
                      height={15}
                      className="shrink-0 text-title/70"
                    />
                    <span className="text-title/80 font-semibold">
                      Reminder:{" "}
                    </span>
                  </div>
                  <p className="text-title/60">
                    Click on each activity to display its full details.
                  </p>
                </div>
              </section>
            ))}
        </section>
      </div>
    </MaxWidthWrapper>
  );
};

export default ItineraryPage;

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
      setEditData({ name, time, address, description });

      toast({
        title: "Update Error",
        description:
          "There has been an error updating the activity. Please try again.",
        variant: "destructive",
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
        variant: "destructive",
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
      className={`relative w-full h-full flex items-center space-x-4 bg-card border-accent border-2 rounded-2xl p-6 hover:bg-primary/50 transition-all cursor-pointer`}
    >
      {/* Card Details */}
      <div className=" flex-grow text-left space-y-1 pr-6">
        <p className="text-sm text-muted-foreground font-semibold">{time}</p>
        <h2 className="text-title text-xl font-extrabold">{name}</h2>
        <p className="text-xs text-muted-foreground font-medium line-clamp-2">
          {address}
        </p>
        <p className="text-sm text-card-foreground line-clamp-2">
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
              <Label htmlFor="name" className="text-left">
                Name
              </Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{name}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username" className="text-left">
                Location
              </Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{address}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username" className="text-left">
                Time
              </Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>{time}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username" className="text-left">
                Description
              </Label>
              <div className="flex items-center justify-start text-sm col-span-3 bg-card/35 border-border border-2 p-3 rounded-lg">
                <p>
                  {description || description!.length >= 1
                    ? description
                    : "No description for this activity."}
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
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
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
                <Label htmlFor="username" className="text-right">
                  Location
                </Label>
                <div className="col-span-3">
                  <GooglePlacesAutocomplete
                    apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                    selectProps={{
                      isDisabled: isSubmitting,

                      placeholder: editData.address ?? "",
                      onChange: (value) =>
                        setEditData((prev) => ({
                          ...prev,
                          address: value!.label,
                        })),
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="framework" className="col-span-1 text-right">
                  Time
                </Label>

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
                <Label htmlFor="username" className="text-right mt-2">
                  Description
                </Label>
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

interface AddActivitySheet {
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: Dispatch<SetStateAction<boolean>>;
  itineraryId: string | undefined;
  selectedDay: string;
}

const AddActivitySheet = ({
  isAddActivityOpen,
  setIsAddActivityOpen,
  itineraryId,
  selectedDay: day,
}: AddActivitySheet) => {
  const {
    activityData,
    setActivityData,
    submitTrip,
    isFormComplete,
    setIsFormComplete,
  } = useActivitiesContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAddActivityOpen) {
      setActivityData(defaultActivityData);
      setIsFormComplete(null);
    }
  }, [isAddActivityOpen, setActivityData, setIsFormComplete]);

  async function handleSubmitActivity() {
    setIsSubmitting(true);
    const result = await submitTrip({ itineraryId, day });
    if (!result) {
      setIsSubmitting(false);
      toast({
        title: "Insertion failed.",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }

    if (result.length !== 0) {
      setIsAddActivityOpen(false);
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
      <SheetContent className="max-w-[940px]">
        <SheetHeader>
          <SheetTitle>Add activity</SheetTitle>
          <SheetDescription>
            Add details to your activity here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              disabled={isSubmitting}
              id="title"
              className="col-span-3"
              placeholder="Trekking at.."
              value={activityData.name}
              onChange={(e) =>
                setActivityData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Location
            </Label>
            <div className="col-span-3">
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  isDisabled: isSubmitting,
                  onChange: (value) =>
                    setActivityData((prev) => ({
                      ...prev,
                      address: value!.label,
                    })),
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="framework" className="col-span-1 text-right">
              Time
            </Label>

            <Select
              disabled={isSubmitting}
              defaultValue={activityData.hour}
              onValueChange={(value) =>
                setActivityData((prev) => ({
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

            <Select
              disabled={isSubmitting}
              defaultValue={activityData.minute}
              onValueChange={(value) =>
                setActivityData((prev) => ({
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
            <Select
              disabled={isSubmitting}
              defaultValue={activityData.period}
              onValueChange={(value) =>
                setActivityData((prev) => ({
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
            <Label htmlFor="description" className="text-right mt-2">
              Description
            </Label>
            <Textarea
              disabled={isSubmitting}
              id="description"
              className="col-span-3"
              placeholder="Ride a tricycle to.."
              onChange={(e) =>
                setActivityData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          {isFormComplete === false && (
            <div className="flex text-xs items-center justify-center text-left space-x-2 p-2 rounded-md border-destructive/40 border-2 border-dashed bg-red-200/80 ">
              <div className="flex items-center text-left space-x-2">
                <TriangleAlert
                  width={12}
                  height={12}
                  className="shrink-0 text-foreground"
                />
              </div>
              <p className="text-foreground">Please fill up missing fields.</p>
            </div>
          )}
          <div className="flex text-xs items-center justify-center text-left space-x-2 p-2 rounded-md border-ring border-1 border-dashed bg-secondary/70">
            <div className="flex items-center text-left space-x-2">
              <Info width={12} height={12} className="shrink-0 text-title/70" />
              {/* <span className="text-title/80 font-semibold">Note: </span> */}
            </div>
            <p className="text-title">
              Activities are automatically sorted based on time.
            </p>
          </div>
        </div>
        <SheetFooter>
          <Button disabled={isSubmitting} onClick={handleSubmitActivity}>
            {isSubmitting ? (
              <div className="flex space-x-2 justify-center items-center">
                <Loader width={12} height={12} className="animate-spin" />
                <span>Submitting..</span>
              </div>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
