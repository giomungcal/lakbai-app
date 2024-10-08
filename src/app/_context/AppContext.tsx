"use client";

import { createClient } from "@/utils/supabase/client";
import {
  EMOJIS,
  EmojiValue,
  NUMBER_OF_PEOPLE,
  NumberOfPeopleValue,
} from "@/validators/options";
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
  setName: Dispatch<SetStateAction<string | null>>;
  address?: string;
  setAddress: Dispatch<SetStateAction<string | null>>;
  emoji: EmojiValue;
  setEmoji: Dispatch<SetStateAction<EmojiValue>>;
  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;
  numOfPeople: NumberOfPeopleValue;
  setNumOfPeople: Dispatch<SetStateAction<NumberOfPeopleValue>>;
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
  const [emoji, setEmoji] = useState<EmojiValue>(EMOJIS[0]["value"]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [numOfPeople, setNumOfPeople] = useState<NumberOfPeopleValue>(
    NUMBER_OF_PEOPLE[0]["value"]
  );
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
