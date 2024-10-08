"use server";

import { getItineraries } from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";
import DashboardPage from "./DashboardPage";

const Page = async () => {
  const { userId, getToken } = auth();
  console.log("Dashboard page mounted here!");

  async function fetchItineraries() {
    try {
      const token = await getToken({ template: "lakbai-supabase" });

      if (!token) {
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

  return <DashboardPage userId={userId} trips={trips} />;
};

export default Page;
