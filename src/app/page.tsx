"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

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

  return (
    <>
      {/* Hero Section */}
      <section>
        <h1>Hero Section</h1>
      </section>
    </>
  );
}
