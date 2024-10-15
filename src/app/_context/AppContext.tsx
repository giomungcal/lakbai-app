"use client";

import { toast } from "@/hooks/use-toast";
import {
  addActivity,
  addItinerary,
  updateActivity,
} from "@/utils/supabase/supabaseRequests";
import {
  EMOJIS,
  HourType,
  MinuteType,
  NUMBER_OF_PEOPLE,
  PeriodType,
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
import { Database } from "../../../database.types";

interface ContextProviderProps {
  children: ReactNode;
}

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Insert"];
type ActivitiesDetails = Database["public"]["Tables"]["activities"]["Row"];

interface GetTokenOptions {
  template?: string;
  organizationId?: string;
  leewayInSeconds?: number;
  skipCache?: boolean;
}

interface TripsContext {
  userId: string | null | undefined;
  getToken: (options?: GetTokenOptions) => Promise<string | null>;

  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;

  addTrip: () => Promise<ItineraryDetails[] | undefined>;
  itineraryDetails: ItineraryDetails;
  setItineraryDetails: Dispatch<SetStateAction<ItineraryDetails>>;
}

const TripsContext = createContext<TripsContext | null>(null);

export const TripsContextProvider = ({ children }: ContextProviderProps) => {
  const { userId, getToken } = useAuth();

  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails>(defaultItinerary);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  function validationForm() {
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
      return false;
    } else {
      return true;
    }
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
        return itinerary;
      } else {
        throw new Error("There has been an error getting a token from Clerk.");
      }
    } else {
      toast({
        title: "Form Incomplete ",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
  }

  return (
    <TripsContext.Provider
      value={{
        userId,
        getToken,

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

type EditData = Database["public"]["Tables"]["activities"]["Update"];

interface AddActivity {
  itineraryId: string | undefined;
  day: string;
}

interface ActivitiesContext {
  userId: string | null | undefined;
  getToken: (options?: GetTokenOptions) => Promise<string | null>;

  activityData: ActivityData;
  setActivityData: Dispatch<SetStateAction<ActivityData>>;
  submitTrip: ({
    itineraryId,
    day,
  }: AddActivity) => Promise<ActivitiesDetails[] | undefined>;
  isFormComplete: boolean | null;
  setIsFormComplete: Dispatch<SetStateAction<boolean | null>>;
  requestComplete: boolean;

  editData: EditData;
  setEditData: Dispatch<SetStateAction<EditData>>;
  editActivity: ({
    activityId,
  }: {
    activityId: number;
  }) => Promise<EditData[] | undefined>;
}

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

export interface ActivityData {
  name: string;
  address: string;
  hour: HourType;
  minute: MinuteType;
  period: PeriodType;
  description?: string;
}

export const defaultActivityData: ActivityData = {
  name: "",
  address: "",
  hour: "8",
  minute: "00",
  period: "AM",
  description: "",
};

export const defaultEditData: EditData = {
  name: "",
  address: "",
  time: "8:00 AM",
  description: "",
};

const ActivitiesContext = createContext<ActivitiesContext | null>(null);

export const ActivitiesContextProvider = ({
  children,
}: ContextProviderProps) => {
  const { userId, getToken } = useTripsContext();
  const [activityData, setActivityData] =
    useState<ActivityData>(defaultActivityData);
  const [editData, setEditData] = useState<EditData>(defaultEditData);
  const [isFormComplete, setIsFormComplete] = useState<boolean | null>(null);
  const [requestComplete, setRequestComplete] = useState(false);

  // useEffect(() => {
  //   console.log(editData);
  // }, [editData]);

  const validationForm = () => {
    const { name, address, hour, minute, period } = activityData;
    if (!name || !address || !hour || !minute || !period) {
      return false;
    } else {
      return true;
    }
  };

  const submitTrip = async ({ itineraryId, day }: AddActivity) => {
    if (!validationForm()) {
      setIsFormComplete(false);
      return;
    } else {
      const token = await getToken({ template: "lakbai-supabase" });
      const result = await addActivity({
        token,
        itineraryId,
        day,
        activityData,
      });
      if (result) {
        setActivityData(defaultActivityData);
        setRequestComplete((prev) => !prev);
        setIsFormComplete(null);
        return result;
      }
      return;
    }
  };

  const editActivity = async ({ activityId }: { activityId: number }) => {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updateActivity({
      token,
      activityId,
      editData,
    });
    if (result) {
      setEditData(defaultEditData);
      setRequestComplete((prev) => !prev);
      return result;
    }
    return;
  };

  return (
    <ActivitiesContext.Provider
      value={{
        userId,
        getToken,

        activityData,
        setActivityData,
        submitTrip,
        isFormComplete,
        setIsFormComplete,
        requestComplete,

        editData,
        setEditData,
        editActivity,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
};

export function useActivitiesContext() {
  const context = useContext(ActivitiesContext);

  if (!context) {
    throw new Error(
      "useActivitiesContext must be used within a ActivitiesContextProvider"
    );
  }

  return context;
}
