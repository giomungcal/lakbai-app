"use server";

import { getItineraries } from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import TripsPage from "./TripsPage";

const Page = async () => {
  const { userId, getToken } = auth();

  if (!userId) {
    return notFound();
  }

  async function fetchItineraries() {
    try {
      const token = await getToken({ template: "lakbai-supabase" });

      if (!token || !userId) {
        console.error("No token received from Clerk.");
        return null;
      }
      const trips = await getItineraries({ userId, token });
      return trips;
    } catch (error) {
      console.error("Error fetching token or itineraries:", error);
      return null;
    }
  }

  const trips = await fetchItineraries();

  return <TripsPage userId={userId} serverTrips={trips ?? []} />;
};

export default Page;
