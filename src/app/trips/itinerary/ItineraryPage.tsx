"use client";

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  EMOJIS,
  MAX_DAYS,
  NUMBER_OF_PEOPLE,
  UserRole,
} from "@/validators/options";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CircleEllipsis,
  CircleEllipsisIcon,
  EllipsisVertical,
  Info,
  Map,
  Plus,
  Settings,
  Settings2,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { FC, Fragment, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useMediaQuery } from "usehooks-ts";
import { Database } from "../../../../database.types";
import { geminiItineraryRun } from "./api/gemini/gemini";
import { FetchTripData } from "./page";

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];

const ItineraryPage: FC<FetchTripData> = ({
  activities,
  itinerary,
  userRole,
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails | null>(itinerary?.[0] ?? null);
  const [tripActivities, setTripActivities] = useState(activities);
  const emoji = EMOJIS.find(({ value }) => value === itineraryDetails?.emoji);
  const numOfPeople = NUMBER_OF_PEOPLE.find(
    ({ value }) => value === itineraryDetails?.num_of_people
  );

  const [openTripDetails, setOpenTripDetails] = useState(false);

  const searchParams = useSearchParams();
  const [selectedDay, setSelectedDay] = useState<string | null>();
  const [filteredActivities, setFilteredActivities] = useState<
    Activities[] | null
  >([]);

  useEffect(() => {
    let dayParam = searchParams.get("day");

    if (
      dayParam &&
      Number(dayParam) <= MAX_DAYS &&
      Number(dayParam) <= (itineraryDetails?.days_count || 1)
    ) {
      console.log("Assigned this ", String(dayParam));

      setSelectedDay(String(dayParam));
    } else if (itineraryDetails && itineraryDetails?.days_count >= 1) {
      setSelectedDay("1");
    }
  }, []);

  useEffect(() => {
    // Set URL
    if (selectedDay) {
      window.history.pushState(
        null,
        "",
        `?id=${itineraryDetails?.id}&day=${selectedDay}`
      );
    }

    if (selectedDay) {
      const activities = tripActivities?.filter((i) => i.day === +selectedDay);
      console.log(activities);

      if (activities && activities.length > 0) {
        setFilteredActivities(activities);
      } else {
        setFilteredActivities([]);
      }
    }
  }, [selectedDay]);

  const handleAddDay = () => {
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
  };

  return (
    <MaxWidthWrapper className="flex w-full flex-col py-14 md:py-20">
      {/* <h1>Gemini Testing by Gio</h1>
            <Button
              onClick={() => {
                console.log("Fetching data...");
    
                geminiItineraryRun()
                  .then((data) => {
                    setItinerary(data);
                    console.log(data);
                  })
                  .then(() => setIsGeminiLoading(false));
              }}
            >
              Fetch Data
            </Button> */}

      <div className="list-inside list-decimal text-sm text-center sm:text-left">
        {/* <Dialog>
                <DialogTrigger asChild>
                  <Button>Add new activity</Button>
                </DialogTrigger>
    
                <DialogContent className="max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Add new destination
                    </DialogTitle>
                    <DialogDescription>Fill up details below</DialogDescription>
                  </DialogHeader>
                  <form>
                    <div className="grid w-full items-center gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary">💡 Ask lak*bai</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                              Make changes to your profile here. Click save when
                              you&apos;re done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="name" className="text-right">
                                Name
                              </Label>
                              <Input
                                id="name"
                                defaultValue="Pedro Duarte"
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="username" className="text-right">
                                Username
                              </Label>
                              <Input
                                id="username"
                                defaultValue="@peduarte"
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Name of the destination" />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Destination</Label>
    
                        <GooglePlacesAutocomplete
                          apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                          placeholder="Enter location"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="framework">Time</Label>
                        <div className="flex space-x-2">
                          <Select defaultValue="8">
                            <SelectTrigger id="framework">
                              <SelectValue placeholder="00" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4">4</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="6">6</SelectItem>
                              <SelectItem value="7">7</SelectItem>
                              <SelectItem value="8">8</SelectItem>
                              <SelectItem value="9">9</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="11">11</SelectItem>
                              <SelectItem value="12">12</SelectItem>
                            </SelectContent>
                          </Select>
                          <div>:</div>
                          <Select defaultValue="00">
                            <SelectTrigger id="framework">
                              <SelectValue placeholder="00" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="00">00</SelectItem>
                              <SelectItem value="15">15</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="45">45</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="am">
                            <SelectTrigger id="framework">
                              <SelectValue placeholder="AM" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              <SelectItem value="am">AM</SelectItem>
                              <SelectItem value="pm">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Description</Label>
                        <Textarea style={{ maxHeight: "100px" }} />
                      </div>
                    </div>
                  </form>
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button>Deploy</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> */}

        {/* Title Section */}
        <section className="flex flex-col md:flex-row space-y-4 justify-between w-full mb-14">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row text-5xl font-bold text-left space-y-4 md:space-y-0">
              <h1 className="text-title dark:text-title-foreground text">
                {itineraryDetails?.name ?? "Gio's Crazy Party"}
              </h1>
              <span className="ml-2 hidden md:block">
                {emoji?.emoji ?? "🦜"}
              </span>
            </div>
            <div className="flex flex-row flex-wrap gap-2 text-base">
              <Badge variant="default">
                📍 {itineraryDetails?.address ?? "Brat House 👽"}
              </Badge>
              <Badge variant="secondary">
                {numOfPeople?.display ?? "👹 69 Bachelors"}
              </Badge>
              <Badge variant="secondary">
                📅 {itineraryDetails?.start_date ?? "May 79, 2092"} to{" "}
                {itineraryDetails?.end_date ?? "1932"}
              </Badge>
            </div>
            <div className="md:flex md:space-x-2 space-y-2 md:space-y-0  w-full">
              <Button className="md:w-auto w-full">Explore Nearby</Button>
              {/* {isDesktop ? (
                <Dialog
                  open={openTripDetails}
                  onOpenChange={setOpenTripDetails}
                >
                  <DialogTrigger asChild>
                    <Button className="md:w-auto w-full" variant="secondary">
                      Edit Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] p-8">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-bold">
                        Edit Trip
                      </DialogTitle>
                      <DialogDescription>
                        Modify trip details. Click save when you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <EditTripForm
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                      />
                    <DialogFooter className="pt-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Drawer
                  open={openTripDetails}
                  onOpenChange={setOpenTripDetails}
                >
                  <DrawerTrigger asChild>
                    <Button className="md:w-auto w-full" variant="secondary">
                      Edit Details
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle className="text-xl font-semibold">
                        Edit Trip
                      </DrawerTitle>
                      <DrawerDescription>
                        Modify trip details. Click save when you&apos;re done.
                      </DrawerDescription>
                    </DrawerHeader>
                    <EditTripForm
                        className="px-4"
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                      />
                    <DrawerFooter className="pt-2">
                      <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                      <Button>Save</Button>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )} */}
            </div>
          </div>
          <div className="flex flex-col justify-start space-y-2">
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="print:hidden"
            >
              Download Itinerary
            </Button>
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: "default" })}
            >
              Trips Dashboard
            </Link>
            <Button
              variant="destructive"
              onClick={() => window.print()}
              className="print:hidden"
            >
              Delete Trip
            </Button>
          </div>
        </section>

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
                    { length: itineraryDetails?.days_count },
                    (_, i) => (
                      <SelectItem key={i + 1} value={`${i + 1}`}>
                        Day {i + 1}
                      </SelectItem>
                    )
                  )}
                  <Button
                    className={`w-full hidden ${
                      (userRole === "edit" || userRole === "owner") && "block"
                    }`}
                    variant="ghost"
                    onClick={handleAddDay}
                  >
                    + New day
                  </Button>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px w-full bg-slate-200"></div>

          {/* Activities Display Section  */}
          {itineraryDetails!.days_count === 0 && (
            <div className="w-full flex flex-col justify-center items-center min-h-56 space-y-1 bg-card border-border border-2 border-dashed rounded-xl transition-all">
              <span className="text-2xl">👻</span>
              <h3 className="text-lg">Start planning your trip!</h3>
              <p className="text-sm opacity-60">
                Click the <span className="font-semibold">Add New Day</span>{" "}
                button.
              </p>
            </div>
          )}

          {selectedDay && selectedDay !== "0" && (
            <section className="flex flex-col space-y-6 p-8 bg-accent/70 rounded-2xl shadow-md">
              <div className="flex justify-between">
                <h3 className="text-3xl font-bold">Day {selectedDay}</h3>
                {(userRole === "owner" || userRole === "edit") && (
                  <div className="flex space-x-2">
                    <Button>
                      <Plus width={14} height={14} />{" "}
                      <span className="ml-2 hidden sm:block">Add activity</span>
                    </Button>
                    <Button variant="secondary">
                      <Trash width={14} height={14} />
                      <span className="ml-2 hidden sm:block">Delete</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Check if there are activities in the DB for the selected day */}
              {!filteredActivities || filteredActivities.length === 0 ? (
                <div className="w-full flex flex-col justify-center items-center min-h-56 space-y-1 bg-card border-border border-2 border-dashed rounded-xl transition-all">
                  <span className="text-2xl">👻</span>
                  <h3 className="text-lg">
                    Start adding activities to your trip!
                  </h3>
                  <p className="text-sm opacity-60">
                    Click the{" "}
                    <span className="font-semibold">Add activity</span> button.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredActivities.map((a) => (
                    <ActivityCard
                      key={a.id}
                      activities={a}
                      userRole={userRole}
                    />
                  ))}
                  {(userRole === "owner" || userRole === "edit") && (
                    <Button
                      variant="outline"
                      className="h-full min-h-[100px] flex items-center justify-center border-2 rounded-2xl border-dashed border-border cursor-pointer "
                    >
                      <p className="font-medium text-base text-foreground/60">
                        + add activity
                      </p>
                    </Button>
                  )}
                </div>
              )}

              {/* Reminder */}
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
                  Clicking the activity opens its location on Google Maps in a
                  new tab.
                </p>
              </div>
            </section>
          )}
        </section>
      </div>
    </MaxWidthWrapper>
  );
};

export default ItineraryPage;

function ActivityCard({
  activities,
  userRole,
}: {
  activities: Activities;
  userRole: UserRole;
}) {
  const { name, time, address, description } = activities;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);

  return (
    <div
      className={`relative w-full h-full flex items-center space-x-4 bg-card border-accent border-2 rounded-2xl p-6 hover:bg-primary/60 transition-all cursor-pointer `}
      // ${(userRole === "public" || userRole === "view") && "pointer-events-none"}
    >
      {/* Link to Google Maps */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURI(
          address!
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
      />
      <div className=" flex-grow text-left space-y-1 pr-6">
        <p className="text-sm text-muted-foreground font-semibold">{time}</p>
        <h2 className="text-title text-xl font-extrabold">{name}</h2>
        <p className="text-xs text-muted-foreground font-medium">{address}</p>
        <p className="text-sm text-card-foreground line-clamp-1">
          {description}
        </p>
      </div>

      {(userRole === "owner" || userRole === "edit") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="absolute top-5 right-5 size-8 rounded-full bg-accent/60 text-accent-foreground/50 flex justify-center items-center z-20 hover:bg-accent transition-colors">
              <Settings width={17} height={17} />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
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

            <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Edit Activity</span>
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => setDeleteAlert(true)}>
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete Activity</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Editing Screen */}
      {(userRole === "owner" || userRole === "edit") && (
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="max-w-[940px]">
            <SheetHeader>
              <SheetTitle>Edit activity</SheetTitle>
              <SheetDescription>
                Make changes to this activity here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={name ?? ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Location
                </Label>
                <Input
                  id="username"
                  value={address ?? ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Time
                </Label>
                <Input id="username" value="10:00 AM" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-start  gap-4">
                <Label htmlFor="username" className="text-right mt-2">
                  Description
                </Label>
                <Textarea
                  id="username"
                  value={description ?? ""}
                  className="col-span-3"
                />
              </div>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Save changes</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Alert Dialog */}
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
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

function NewActivityProfileForm() {}
