"use client";

import {
  defaultActivityAdd,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  deleteActivity,
  deleteItinerary,
  getSpecificActivity,
  getSpecificItinerary,
  updateDay,
  updatePublic,
} from "@/utils/supabase/supabaseRequests";
import {
  EMOJIS,
  EmojiValue,
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
  CalendarIcon,
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
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Database } from "../../../../database.types";
import CollaborationDialog from "./components/CollaborationDialog";
import ShareItineraryDialog from "./components/ShareItineraryDialog";
import { FetchTripData } from "./page";

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];

const ItineraryPage: FC<FetchTripData> = ({
  activities,
  itinerary,
  userRole,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails | null>(itinerary?.[0] ?? null);
  const [tripActivities, setTripActivities] = useState<Activities[] | null>(
    activities
  );
  const numOfPeople = NUMBER_OF_PEOPLE.find(
    ({ value }) => value === itineraryDetails?.num_of_people
  );

  const [selectedDay, setSelectedDay] = useState<string | null>();
  const [filteredActivities, setFilteredActivities] = useState<
    Activities[] | null
  >([]);

  //   Alert/Dialog/Modal Screen handling
  const [isAddActivityOpen, setIsAddActivityOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    getToken,
    editTrip,
    editTripData,
    setEditTripData,
    startDate,
    setStartDate,
    setEndDate,
    endDate,
  } = useTripsContext();
  const { requestComplete } = useActivitiesContext();

  const { dateStartFormatted, dateEndFormatted } = useMemo(() => {
    const dateStartFormatted = format(
      new Date(itineraryDetails!.start_date),
      "PP"
    );

    const dateEndFormatted = format(new Date(itineraryDetails!.end_date), "PP");

    return { dateStartFormatted, dateEndFormatted };
  }, [itineraryDetails]);

  const emojiObject = EMOJIS.find((i) => i.value === itineraryDetails?.emoji);

  // Set selectedDay based on URL on mount
  useEffect(() => {
    const dayParam = searchParams.get("day");

    if (
      dayParam &&
      Number(dayParam) <= MAX_DAYS &&
      Number(dayParam) <= (itineraryDetails?.days_count || 1)
    ) {
      setSelectedDay(String(dayParam));
    } else if (itineraryDetails && itineraryDetails.days_count > 0) {
      setSelectedDay("1");
    }

    syncActivitiesWithDb();
    syncTripsWithDb();
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

  useEffect(() => {
    syncActivitiesWithDb();
  }, [requestComplete]);

  const syncActivitiesWithDb = async () => {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await getSpecificActivity({
      token,
      itineraryId: itineraryDetails?.id,
    });
    if (result) {
      setTripActivities(result);
    }
  };

  const syncTripsWithDb = async () => {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await getSpecificItinerary({
      token,
      itineraryId: itineraryDetails?.id,
    });
    if (result) {
      setItineraryDetails(result[0]);
    }
  };

  const handleAddDay = async () => {
    if (itineraryDetails!.days_count >= MAX_DAYS) {
      toast({
        title: "Day count exceeded",
        description: `Maximum number of days is ${MAX_DAYS}`,
        variant: "default",
      });
      return;
    }

    setItineraryDetails((prev) => {
      if (prev) {
        const dayNum = prev.days_count + 1;

        if (dayNum === 1) {
          setSelectedDay("1");
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
    if (itineraryDetails!.days_count === 0) {
      toast({
        title: "Day count at 0",
        description: `You cannot remove any more days.`,
        variant: "default",
      });
      return;
    }

    setItineraryDetails((prev) => {
      if (prev) {
        const dayNum = prev.days_count - 1;

        return { ...prev, days_count: dayNum };
      }
      return null;
    });

    if (selectedDay === String(itineraryDetails!.days_count)) {
      setSelectedDay((prev) => String(Number(prev) - 1));
    }

    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updateDay({
      token,
      action: "delete",
      day: itineraryDetails!.days_count - 1,
      itineraryId: itineraryDetails!.id,
    });

    if (result && result.length !== 0) {
      console.log("Syncing..");
      syncActivitiesWithDb();
    }
  };

  const handleEditOpen = () => {
    const {
      name,
      address,
      days_count,
      emoji,
      start_date,
      end_date,
      num_of_people,
    } = itineraryDetails!;

    setStartDate(new Date(start_date));
    setEndDate(new Date(end_date));
    setEditTripData({
      name,
      address,
      days_count,
      emoji,
      start_date,
      end_date,
      num_of_people,
    });
    setIsEditOpen(true);
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
        variant: "default",
      });
      return;
    }
    // Re-route to Trips page on success
    router.push("/trips");
    return;
  };

  const handleEditTrip = async () => {
    const {
      name,
      address,
      days_count,
      emoji,
      start_date,
      end_date,
      num_of_people,
    } = itineraryDetails!;

    if (
      name === editTripData.name &&
      address === editTripData.address &&
      days_count === editTripData.days_count &&
      start_date === editTripData.start_date &&
      end_date === editTripData.end_date &&
      num_of_people === editTripData.num_of_people &&
      emoji === editTripData.emoji
    ) {
      toast({
        title: "No changes were made",
        description: "Your activity details remain the same.",
        variant: "default",
      });
      setIsEditOpen(false);
      setIsSubmitting(false);
      setStartDate(new Date());
      setEndDate(new Date());
      return;
    }

    const result = await editTrip(itineraryDetails!.id);
    if (!result) {
      setIsSubmitting(false);
      setStartDate(new Date());
      setEndDate(new Date());
      toast({
        title: "Update Error",
        description:
          "There has been an error updating the trip. Please try again.",
        variant: "default",
      });
      return;
    }
    setIsEditOpen(false);
    setIsSubmitting(false);
    setStartDate(new Date());
    setEndDate(new Date());
    syncTripsWithDb();
  };

  const handlePublicChange = async () => {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updatePublic({
      token,
      itineraryId: itineraryDetails!.id,
      isPublic: !itineraryDetails?.is_public,
    });

    if (result && result.length !== 0) {
      setItineraryDetails((prev) => {
        if (prev) {
          return { ...prev, is_public: !prev.is_public };
        }
        return prev;
      });
      toast({
        title: "Public Access updated.",
        description: "Successfully updated the public access.",
        variant: "default",
      });
      return;
    }

    toast({
      title: "Uh oh! Something went wrong.",
      description:
        "There has been an error updating the public access. Try again.",
      variant: "default",
    });
    syncTripsWithDb();
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
                <span className="ml-2">{emojiObject?.emoji ?? "🦜"}</span>
              </h1>
            </div>

            {/* Trip Details */}
            <div className="flex flex-row flex-wrap gap-2 text-base">
              <Badge
                variant="outline"
                className="max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap"
              >
                📍 {itineraryDetails?.address ?? "Brat House 👽"}
              </Badge>

              <Badge variant="outline">
                {numOfPeople?.display.split("(")[0] ?? "👹 69 Bachelors"}
              </Badge>
              <Badge variant="outline">
                📅 {dateStartFormatted} to {dateEndFormatted}
              </Badge>
            </div>

            {(userRole === "edit" || userRole === "owner") && (
              <div className="flex space-x-2 space-y-0">
                {userRole === "owner" && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setIsCollabDialogOpen(true)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      <span>Collaboration</span>
                    </Button>

                    {isCollabDialogOpen && (
                      <CollaborationDialog
                        isOpen={isCollabDialogOpen}
                        onClose={() => setIsCollabDialogOpen(false)}
                        itineraryId={itineraryDetails!.id}
                        ownerId={itineraryDetails!.owner_id}
                      />
                    )}
                  </>
                )}

                <Button
                  variant="default"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share className="mr-2 h-4 w-4" />
                  <span>Share Itinerary</span>
                </Button>

                {isShareDialogOpen && (
                  <ShareItineraryDialog
                    isOpen={isShareDialogOpen}
                    onClose={() => {
                      setIsShareDialogOpen(false);
                    }}
                    isPublic={itineraryDetails?.is_public ?? false}
                    onPublicChange={handlePublicChange}
                    isOwner={userRole === "owner"}
                  />
                )}
              </div>
            )}
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
                {(userRole === "owner" || userRole === "edit") && (
                  <DropdownMenuItem
                    onClick={handleEditOpen}
                    className="cursor-pointer"
                  >
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
                      onClick={() => setIsDeleteOpen(true)}
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

        {/* [OWNER] DeleteTripDialog - Deleting Trip */}
        {userRole === "owner" && (
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the trip: {itineraryDetails?.name} and all of
                  its activities. This action cannot be undone.
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

        {/* [EDIT] EditTripSheet - Edit Trip Screen */}
        {(userRole === "owner" || userRole === "edit") && (
          <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
            <SheetContent className="max-w-[940px]">
              <SheetHeader>
                <SheetTitle>Edit trip</SheetTitle>
                <SheetDescription>
                  Make changes to the trip details here. Click save when
                  you&apos;re done.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Emoji</Label>
                  <Select
                    value={editTripData.emoji}
                    onValueChange={(value) =>
                      setEditTripData((prev) => {
                        return { ...prev, emoji: value as EmojiValue };
                      })
                    }
                  >
                    <SelectTrigger id="framework">
                      <SelectValue placeholder="00" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {EMOJIS.map(({ value, emoji }, index) => (
                        <SelectItem key={index} value={value}>
                          {emoji}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Name</Label>
                  <Input
                    disabled={isSubmitting}
                    id="name"
                    className="col-span-3 "
                    value={editTripData.name ?? ""}
                    onChange={(e) =>
                      setEditTripData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Destination</Label>
                  <div className="col-span-3">
                    <GooglePlacesAutocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                      selectProps={{
                        isDisabled: isSubmitting,
                        defaultInputValue: itineraryDetails!.address,
                        onChange: (value) =>
                          setEditTripData((prev) => ({
                            ...prev,
                            address: value!.label,
                          })),
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Date Start</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          " justify-start text-left font-normal col-span-3",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(value) => {
                          if (value) {
                            setStartDate(value);
                            setEditTripData((prev) => ({
                              ...prev,
                              start_date: value.toLocaleDateString(),
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Date End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          " justify-start text-left font-normal col-span-3",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(value) => {
                          if (value) {
                            setEndDate(value);
                            setEditTripData((prev) => ({
                              ...prev,
                              end_date: value.toLocaleDateString(),
                            }));
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label>Number of Travelers</Label>

                  <Select
                    value={editTripData.num_of_people}
                    onValueChange={(value) =>
                      setEditTripData((prev) => ({
                        ...prev,
                        num_of_people: value,
                      }))
                    }
                  >
                    <SelectTrigger id="framework" className="col-span-3">
                      <SelectValue placeholder="Are you travelling alone?" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {NUMBER_OF_PEOPLE.map(({ value, display }) => {
                        return (
                          <SelectItem key={value} value={value}>
                            {display}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button disabled={isSubmitting} onClick={handleEditTrip}>
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

        {/* Horizontal Separator */}
        <div className="h-px w-full bg-slate-200"></div>

        {/* Itinerary Section */}
        <section className="flex flex-col space-y-10 mt-8 w-full">
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
                                {itineraryDetails?.days_count} and all of its
                                activities. This action cannot be undone.
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

          {/* Days Count === 0 */}
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
                    <h3 className="text-lg">
                      {userRole == "edit" || userRole === "owner"
                        ? "Add activities to your trip!"
                        : "No activities yet."}
                    </h3>
                    {userRole == "edit" || userRole === "owner" ? (
                      <p className="text-sm opacity-60">
                        Click the{" "}
                        <span className="font-semibold">Add activity</span>{" "}
                        button.
                      </p>
                    ) : (
                      <p className="text-sm opacity-60">
                        No activities added for this day yet.
                      </p>
                    )}
                  </div>
                ) : (
                  // Display all activity cards
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredActivities.map((a) => (
                      <ActivityCard
                        key={a.id}
                        activities={a}
                        userRole={userRole}
                        onSuccess={() => syncActivitiesWithDb()}
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
                <div className="flex flex-col md:flex-row items-center space-x-2 p-4 rounded-xl border-ring border-1 border-dashed bg-primary select-none">
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
    submitActivity,
    isFormComplete,
    setIsFormComplete,
  } = useActivitiesContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAddActivityOpen) {
      setActivityData(defaultActivityAdd);
      setIsFormComplete(null);
    }
  }, [isAddActivityOpen, setActivityData, setIsFormComplete]);

  async function handleSubmitActivity() {
    setIsSubmitting(true);
    const result = await submitActivity({ itineraryId, day });
    if (!result) {
      setIsSubmitting(false);

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
            <Label className="text-right">Title</Label>
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
            <Label className="text-right">Location</Label>
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
            <Label className="col-span-1 text-right">Time</Label>

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
            <Label className="text-right mt-2">Description</Label>
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
