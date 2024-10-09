"use client";

import { toast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { supabaseClient } from "@/utils/supabase/supabaseClient";
import { addItinerary } from "@/utils/supabase/supabaseRequests";
import {
  EMOJIS,
  EmojiValue,
  ItineraryDetailsProps,
  NUMBER_OF_PEOPLE,
  NumberOfPeopleValue,
} from "@/validators/options";
import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
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
  addTrip: () => void;
}

interface TripsContextProviderProps {
  children: ReactNode;
}

const TripsContext = createContext<TripsContext | null>(null);

export const TripsContextProvider = ({
  children,
}: TripsContextProviderProps) => {
  const { userId, getToken } = useAuth();

  const [name, setName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<EmojiValue>(EMOJIS[0]["value"]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [numOfPeople, setNumOfPeople] = useState<NumberOfPeopleValue>(
    NUMBER_OF_PEOPLE[0]["value"]
  );

  function validationForm() {
    const validationErrors: string[] = [];

    if (!name) validationErrors.push("Name is required.");
    if (!address) validationErrors.push("Address is required.");
    if (!emoji) validationErrors.push("Emoji selection is required.");
    if (!startDate) validationErrors.push("Start date is required.");
    if (!endDate) validationErrors.push("End date is required.");
    if (!numOfPeople) validationErrors.push("Number of people is required.");

    return validationErrors.length === 0;
  }

  function resetValues() {
    setName(null);
    setAddress(null);
    setEmoji(EMOJIS[0]["value"]);
    setStartDate(new Date());
    setEndDate(new Date());
    setNumOfPeople(NUMBER_OF_PEOPLE[0]["value"]);
  }

  async function addTrip() {
    if (validationForm() && userId) {
      const itineraryDetails: ItineraryDetailsProps = {
        name,
        address,
        emoji,
        startDate,
        endDate,
        numOfPeople,
      };
      const token = await getToken({ template: "lakbai-supabase" });

      if (token) {
        const itinerary = await addItinerary(userId, itineraryDetails, token);
        resetValues();
        if (itinerary) {
          toast({
            title: "Success!",
            description: "Itinerary added successfully!",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "Token Error",
          description: "There has been an error getting a token from Clerk",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
    }
  }

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
        addTrip,
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
