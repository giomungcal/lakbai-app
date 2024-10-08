"use client";

import { createClient } from "@/utils/supabase/client";
import { EMOJIS, NUMBER_OF_PEOPLE } from "@/validators/options";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface TripsContext {
  name?: string;
  setName: Dispatch<SetStateAction<string>>;
  address?: string;
  setAddress: Dispatch<SetStateAction<string>>;
  emoji: (typeof EMOJIS)[number]["value"];
  setEmoji: Dispatch<SetStateAction<(typeof EMOJIS)[number]["value"]>>;
  startDate: string;
  setStartDate: Dispatch<SetStateAction<string>>;
  endDate: string;
  setEndDate: Dispatch<SetStateAction<string>>;
  numOfPeople: (typeof NUMBER_OF_PEOPLE)[number]["value"];
  setNumOfPeople: Dispatch<
    SetStateAction<(typeof NUMBER_OF_PEOPLE)[number]["value"]>
  >;
}

interface TripsContextProviderProps {
  children: ReactNode;
}

const TripsContext = createContext<TripsContext | null>(null);

export const TripsContextProvider = ({
  children,
}: TripsContextProviderProps) => {
  const [name, setName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<(typeof EMOJIS)[number]["value"]>(
    EMOJIS[0]["value"]
  );
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [numOfPeople, setNumOfPeople] = useState<
    (typeof NUMBER_OF_PEOPLE)[number]["value"]
  >(NUMBER_OF_PEOPLE[0]["value"]);
  const [isFormComplete, setIsFormComplete] = useState<boolean>(false);
  const [tripDetails, setTripDetails] = useState({
    itineraryID31342: {
      name,
      address,
      emoji,
      startDate,
      endDate,
      numOfPeople,
    },
  });
  // For testing only
  // useEffect(() => {
  //   const tripDetails = {
  //     itineraryID31342: {
  //       name,
  //       address,
  //       emoji,
  //       startDate,
  //       endDate,
  //       numOfPeople,
  //     },
  //   };
  //   console.log(tripDetails);

  //   console.log(Object.keys(tripDetails["itineraryID31342"]));

  //   if (
  //     Object.keys(tripDetails["itineraryID31342"]).every(
  //       (key) => tripDetails["itineraryID31342"][key] !== null
  //     )
  //   ) {
  //     console.log("Form is complete!");
  //     setIsFormComplete(true);
  //   }
  // }, [name, address, emoji, startDate, endDate, numOfPeople]);

  // function saveTrip(params: type) {}

  const supabase = createClient();

  async function fetchUserData() {
    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("itinerary_id", "itineraryid_2");
    console.log(activities);
  }

  useEffect(() => {
    console.log("hey");
    fetchUserData();
  }, []);

  return (
    <TripsContext.Provider
      value={{
        setName,
        setAddress,
        emoji,
        setEmoji,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        numOfPeople,
        setNumOfPeople,
      }}
    >
      {children}
    </TripsContext.Provider>
  );
};

export function useTripsContext() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error(
      "useTripsContext must be used within a TripsContextProvider"
    );
  }
  return context;
}
