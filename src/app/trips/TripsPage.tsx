"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
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
import { Input } from "@/components/ui/input";
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
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { getItineraries } from "@/utils/supabase/supabaseRequests";
import {
  EMOJIS,
  EmojiValue,
  NUMBER_OF_PEOPLE,
  NumberOfPeopleValue,
} from "@/validators/options";
import { useAuth } from "@clerk/nextjs";
import { Label } from "@radix-ui/react-label";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useMediaQuery } from "usehooks-ts";
import { Database } from "../../../database.types";
import { useTripsContext } from "../_context/AppContext";
import { AddTripForm } from "./components/AddTripForm";
import TripCard from "./components/TripCard";

interface TripsPage {
  userId?: string;
  serverTrips?: TripsProps[];
}

type TripsProps = Database["public"]["Tables"]["itineraries"]["Row"];

const TripsPage = ({ userId, serverTrips }: TripsPage) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { getToken } = useAuth();

  const [trips, setTrips] = useState<TripsProps[]>([]);
  const [openTripDetails, setOpenTripDetails] = useState<boolean>(false);
  const [isTripsLoading, setIsTripsLoading] = useState<boolean>(true);

  const { addTrip } = useTripsContext();

  useEffect(() => {
    const subscribeToRealtime = async () => {
      const supabaseToken = await getToken({
        template: "lakbai-supabase",
      });
      const supabase = await supabaseClient(supabaseToken);
      supabase.realtime.setAuth(supabaseToken);

      const channel = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "itineraries",
          },
          (payload) => {
            if (trips?.some((t) => t.id === payload.old.id)) {
              toast({
                title: "A trip has been deleted.",
                variant: "default",
              });
              syncTripsWithDatabase();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "itineraries",
          },
          (payload) => {
            if (trips?.some((t) => t.owner_id === payload.new.owner_id)) {
              toast({
                title: "A trip has been updated.",
                description: `Trip: ${payload.new.name} has been updated.`,
                variant: "default",
              });
              syncTripsWithDatabase();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    subscribeToRealtime();
  }, [trips]);

  useEffect(() => {
    setIsTripsLoading(true);
    syncTripsWithDatabase();
  }, []);

  async function handleTripSave() {
    const result = await addTrip();
    if (result && result.length !== 0) setOpenTripDetails(false);

    // Update list when a new trip is added
    syncTripsWithDatabase();
  }

  async function syncTripsWithDatabase() {
    const token = await getToken({ template: "lakbai-supabase" });
    if (!token || !userId) {
      console.error("No token received from Clerk");
      return;
    }
    const updatedItineraries = await getItineraries({ userId, token });
    if (updatedItineraries) setTrips(updatedItineraries);
    setIsTripsLoading(false);
  }

  return (
    <MaxWidthWrapper className="flex w-full flex-col md:py-20">
      {/* Title Section */}
      <section className="flex flex-col lg:flex-row space-y-4 justify-between w-full my-14 md:mb-14 md:my-0">
        <div className="space-y-2">
          <h1 className="flex text-7xl font-bold text-title dark:text-title-foreground">
            Travel Plans<span className="hidden md:block ml-2">🐸</span>
          </h1>
          <p className="text-base text-muted-foreground">
            Let&apos;s map out your next journey.
          </p>
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
                  <Button onClick={handleTripSave}>Save</Button>
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
                  <Button onClick={handleTripSave}>Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </section>

      {/* Trips Section */}

      {isTripsLoading ? (
        <div className="animate-pulse flex flex-col justify-between w-[35%] h-52 bg-secondary/30 rounded-2xl p-5">
          <div></div>
          <div className="w-full h-12 rounded-lg bg-secondary/60" />
        </div>
      ) : trips.length === 0 ? (
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
          {trips.map((trip, index) => {
            return <TripCard key={index} tripDetails={trip} />;
          })}
        </section>
      )}
    </MaxWidthWrapper>
  );
};

export default TripsPage;
