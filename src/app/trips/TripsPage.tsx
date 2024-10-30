"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
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
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getItineraries } from "@/utils/supabase/supabaseRequests";
import { isBefore } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { Database } from "../../../database.types";
import { useTripsContext } from "../_context/AppContext";
import { AddTripForm } from "./components/AddTripForm";
import LakbAILoader from "./components/LakbAILoader";
import TripCard from "./components/TripCard";

interface TripsPage {
  userId?: string;
  serverTrips?: TripsProps[];
}

type TripsProps = Database["public"]["Tables"]["itineraries"]["Row"];

const TripsPage = ({ userId, serverTrips }: TripsPage) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [trips, setTrips] = useState<TripsProps[]>(serverTrips || []);
  const [openAddTrip, setOpenAddTrip] = useState<boolean>(false);
  // const [isTripsLoading, setIsTripsLoading] = useState<boolean>(false);

  const { addTrip, getToken, isAddingTrip, isAddingLakbaiTrip } =
    useTripsContext();

  useEffect(() => {
    syncTripsWithDatabase();
  }, []);

  const sortedTrips = useMemo(() => {
    const tempTrips = [...trips];
    tempTrips.sort((a, b) => {
      return (
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
    });

    const completedTrips: TripsProps[] = [];

    const sortedTrips = tempTrips.filter((t) => {
      const tripIsDone = isBefore(t.start_date, new Date());
      if (tripIsDone) {
        completedTrips.push(t);
        return false;
      }
      return true;
    });

    sortedTrips.push(...completedTrips);

    return sortedTrips;
  }, [trips]);

  async function handleTripSave() {
    const result = await addTrip();
    if (result && result.length !== 0) setOpenAddTrip(false);

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
  }

  return (
    <MaxWidthWrapper className="flex w-full flex-col py-8 md:py-20">
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
          {/* LakbAI Submitting Loading Screen */}
          {isAddingLakbaiTrip && <LakbAILoader />}

          {/* Add Trip Form */}
          {isDesktop ? (
            <Dialog open={openAddTrip} onOpenChange={setOpenAddTrip}>
              <DialogTrigger asChild>
                <Button size="lg">+ New Trip</Button>
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
                    <Button disabled={isAddingTrip} variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button disabled={isAddingTrip} onClick={handleTripSave}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={openAddTrip} onOpenChange={setOpenAddTrip}>
              <DrawerTrigger asChild>
                <Button size="lg">+ New Trip</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left"></DrawerHeader>
                <AddTripForm className="p-6" />
                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button disabled={isAddingTrip} variant="outline">
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button disabled={isAddingTrip} onClick={handleTripSave}>
                    {isAddingTrip ? "Saving.." : "Save"}
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </div>
      </section>

      {/* Trips Section */}

      {trips.length === 0 ? (
        <div className="w-full h-80 border-border border-2 bg-card rounded-3xl border-dashed text-center space-y-1 flex flex-col justify-center items-center">
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
          {sortedTrips.map((trip, index) => {
            return <TripCard key={index} tripDetails={trip} />;
          })}
        </section>
      )}
    </MaxWidthWrapper>
  );
};

export default TripsPage;
