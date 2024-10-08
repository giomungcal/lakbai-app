"use client";

import { useEffect } from "react";
import { createClient } from "./utils/supabase/client";

export default function Home() {
  const supabase = createClient();

  async function fetchData() {
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("itinerary_id", "itineraryid_1");
    if (error) {
      console.error("There has been an error fetching the data: ", error);
    } else {
      console.log(activities);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return <h1>hey</h1>;
}
