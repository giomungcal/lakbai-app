"use server";

import ErrorPage from "@/components/ErrorPage";
import { getItineraries } from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";
import { Database } from "../../../database.types";
import TripsPage from "./TripsPage";

type Itineraries = Database["public"]["Tables"]["itineraries"]["Row"];

const Page = async () => {
  const { userId, getToken } = auth();

  if (!userId) {
    return <ErrorPage />;
  }

  async function fetchItineraries(): Promise<Itineraries[] | undefined> {
    try {
      const token = await getToken({ template: "lakbai-supabase" });

      if (!token || !userId) {
        console.error("No token received from Clerk.");
        return undefined;
      }
      const trips = await getItineraries({ userId, token });
      trips?.sort((a, b) => {
        return (
          new Date(`${a.start_date}`).getTime() -
          new Date(`${b.start_date}`).getTime()
        );
      });
      return trips;
    } catch (error) {
      console.error("Error fetching token or itineraries:", error);
      return undefined;
    }
  }

  const trips = await fetchItineraries();

  return <TripsPage userId={userId} serverTrips={trips ?? []} />;
};

export default Page;
