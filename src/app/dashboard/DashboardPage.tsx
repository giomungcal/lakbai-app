import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EMOJIS, NUMBER_OF_PEOPLE } from "@/validators/options";
import { Label } from "@radix-ui/react-label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { format } from "path";
import { useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { useTripsContext } from "../_context/AppContext";

const DashboardPage = ({ userID }: { userID: string }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [openTripDetails, setOpenTripDetails] = useState(false);

  return (
    <div className="flex justify-center w-full min-h-screen ">
      <main className="flex w-full flex-col row-start-2 items-center sm:items-start p-8 pb-20 sm:p-20 max-w-[1250px]">
        {/* Title Section */}
        <section className="flex flex-col lg:flex-row space-y-2 justify-between w-full mb-14">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold">🌍 trips</h1>
            <p className="text-base">start planning your next trip!</p>
          </div>
          <div className="space-x-2">
            {isDesktop ? (
              <Dialog open={openTripDetails} onOpenChange={setOpenTripDetails}>
                <DialogTrigger asChild>
                  <Button className="font-xl dark:bg-white" size="lg">
                    + New Trip
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className=" text-xl font-semibold">
                      Add Trip
                    </DialogTitle>
                    <DialogDescription>
                      Input your trip details. Click save when you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <AddTripForm className="p-4" />
                  <DialogFooter className="pt-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Drawer open={openTripDetails} onOpenChange={setOpenTripDetails}>
                <DrawerTrigger asChild>
                  <Button className="font-xl dark:bg-white" size="lg">
                    + New Trip
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="text-left">
                    <DrawerTitle className="text-xl font-semibold">
                      Add Trip
                    </DrawerTitle>
                    <DrawerDescription>
                      Input your trip details. Click save when you&apos;re done.
                    </DrawerDescription>
                  </DrawerHeader>
                  <AddTripForm className="p-6" />
                  <DrawerFooter className="pt-2">
                    <DrawerClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button>Save</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}

            <Link
              href="/"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Home
            </Link>
          </div>
        </section>

        {/* Horizontal Separator */}
        {/* <div className="h-px w-full bg-slate-200"></div> */}

        {/* Trips Section */}

        {TRIPS.length === 0 ? (
          <div className="w-full h-full border-border border-2 bg-card rounded-3xl border-dashed text-center space-y-1 flex flex-col justify-center items-center">
            <span className="text-4xl">👻</span>
            <h2 className="text-2xl font-semibold text-card-foreground">
              No trips yet.
            </h2>
            <p className="text-muted-foreground text-sm">
              Let&apos;s craft your next trip!
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4 ">
            {TRIPS.map(
              ({ emoji, name, address, dateStart, dateEnd, number }, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-between h-52 bg-card border-border border-2 rounded-2xl p-5"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2 text-xl font-bold">
                        <span>{emoji}</span>
                        <h2 className="truncate">{name}</h2>
                      </div>

                      <div className="flex space-x-2">
                        <Badge
                          variant="outline"
                          className="text-xs space-x-2 truncate"
                        >
                          📍 {address}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs space-x-2 truncate"
                        >
                          🧍‍♂️ {number}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <p className="text-xs truncate font-semibold text-muted-foreground">
                        📆 {dateStart} - {dateEnd}
                      </p>
                      <Link
                        href="/"
                        className={buttonVariants({
                          size: "lg",
                          variant: "default",
                        })}
                      >
                        Open Itinerary
                      </Link>
                    </div>
                  </div>
                );
              }
            )}
            <Button
              onClick={() => {
                setOpenTripDetails(true);
              }}
              variant="outline"
              className="h-full min-h-[100px] flex items-center justify-center border-2 rounded-2xl border-dashed border-border cursor-pointer "
            >
              <p className="font-medium text-base text-foreground/60">
                + add trip
              </p>
            </Button>
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;

function AddTripForm({ className }) {
  const {
    emoji,
    setEmoji,
    setName,
    setAddress,
    startDate,
    setStartDate,
    setEndDate,
    endDate,
    numOfPeople,
    setNumOfPeople,
  } = useTripsContext();

  type NumberOfPeopleValue = (typeof NUMBER_OF_PEOPLE)[number]["value"];
  type EmojiValue = (typeof EMOJIS)[number]["value"];

  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div className="grid w-full items-center gap-4">
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Emoji</Label>
            <Select
              defaultValue={emoji}
              onValueChange={(value: EmojiValue) => setEmoji(value)}
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
          <div className="flex flex-col space-y-1.5 w-full">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              id="name"
              maxLength={25}
              placeholder="Trip description"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Destination</Label>
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
            placeholder="Enter location"
            selectProps={{
              onChange: (value) => setAddress(value.label),
            }}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Date Start</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
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
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">Date End</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="framework">Number of Travelers</Label>

          <Select
            defaultValue={numOfPeople}
            onValueChange={(value: NumberOfPeopleValue) =>
              setNumOfPeople(value)
            }
          >
            <SelectTrigger id="framework">
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
    </form>
  );
}
