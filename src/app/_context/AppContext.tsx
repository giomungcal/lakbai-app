"use client";

import { toast } from "@/hooks/use-toast";
import { addItinerary } from "@/utils/supabase/supabaseRequests";
import { EMOJIS, NUMBER_OF_PEOPLE } from "@/validators/options";
import { useAuth } from "@clerk/nextjs";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Database } from "../../../database.types";

interface TripsContext {
  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;

  addTrip: () => Promise<boolean>;
  itineraryDetails: ItineraryDetails;
  setItineraryDetails: Dispatch<SetStateAction<ItineraryDetails>>;
}

interface TripsContextProviderProps {
  children: ReactNode;
}

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Insert"];

const defaultItinerary: ItineraryDetails = {
  address: "",
  emoji: EMOJIS[0]["value"],
  end_date: new Date().toISOString(),
  id: "",
  is_created_by_lakbai: false,
  name: "",
  num_of_people: NUMBER_OF_PEOPLE[1]["value"],
  owner_id: "",
  start_date: new Date().toISOString(),
};

const TripsContext = createContext<TripsContext | null>(null);

export const TripsContextProvider = ({
  children,
}: TripsContextProviderProps) => {
  const { userId, getToken } = useAuth();

  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails>(defaultItinerary);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  function validationForm() {
    let areDetailsComplete = false;

    const { name, address, emoji, start_date, end_date, num_of_people } =
      itineraryDetails;

    if (
      !name ||
      !address ||
      !emoji ||
      !start_date ||
      !end_date ||
      !num_of_people
    ) {
      areDetailsComplete = false;
    } else {
      areDetailsComplete = true;
    }
    console.log(areDetailsComplete);

    return areDetailsComplete;
  }

  function resetValues() {
    setItineraryDetails(defaultItinerary);
    setStartDate(new Date());
    setEndDate(new Date());
  }

  async function addTrip() {
    if (validationForm() && userId) {
      const token = await getToken({ template: "lakbai-supabase" });

      if (token) {
        const itinerary = await addItinerary({
          userId,
          itineraryDetails,
          token,
        });
        resetValues();
        if (itinerary) {
          toast({
            title: "Success!",
            description: "Itinerary added successfully!",
            variant: "default",
          });
        }
        return true;
      } else {
        toast({
          title: "Token Error",
          description: "There has been an error getting a token from Clerk",
          variant: "destructive",
        });
        return false;
      }
    } else {
      toast({
        title: "Form Incomplete ",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return false;
    }
  }

  return (
    <TripsContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,

        addTrip,
        itineraryDetails,
        setItineraryDetails,
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
