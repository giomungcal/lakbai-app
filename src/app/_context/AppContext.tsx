"use client";

import { toast } from "@/hooks/use-toast";
import { geminiItineraryRun } from "@/utils/gemini/gemini";
import {
  addActivity,
  addItinerary,
  updateActivity,
  updateItinerary,
} from "@/utils/supabase/supabaseRequests";
import {
  EMOJIS,
  HourType,
  MinuteType,
  NUMBER_OF_PEOPLE,
  PeriodType,
} from "@/validators/options";
import { useAuth, useUser } from "@clerk/nextjs";
import { formatDistance } from "date-fns";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Database } from "../../../database.types";

interface ContextProviderProps {
  children: ReactNode;
}

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Insert"];
type ActivitiesDetails = Database["public"]["Tables"]["activities"]["Row"];
type UpdateItinerary = Database["public"]["Tables"]["itineraries"]["Update"];

interface GetTokenOptions {
  template?: string;
  organizationId?: string;
  leewayInSeconds?: number;
  skipCache?: boolean;
}

interface TripsContext {
  userId: string | null | undefined;
  getToken: (options?: GetTokenOptions) => Promise<string | null>;
  darkMode: boolean;
  setDarkMode: Dispatch<SetStateAction<boolean>>;

  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;

  addTrip: () => Promise<ItineraryDetails[] | undefined>;
  itineraryDetails: ItineraryDetails;
  setItineraryDetails: Dispatch<SetStateAction<ItineraryDetails>>;
  isAddingTrip: boolean;
  isAddingLakbaiTrip: boolean;

  editTripData: UpdateItinerary;
  setEditTripData: Dispatch<SetStateAction<UpdateItinerary>>;
  editTrip: (itineraryId: string) => Promise<UpdateItinerary[] | undefined>;
}

const defaultItinerary: ItineraryDetails = {
  id: "",
  name: "",
  address: "",
  days_count: 0,
  emoji: EMOJIS[0]["value"],
  start_date: new Date().toISOString(),
  end_date: new Date().toISOString(),
  num_of_people: NUMBER_OF_PEOPLE[1]["value"],
  owner_id: "",
  is_created_by_lakbai: false,
};

const defaultItineraryEdit: UpdateItinerary = {
  name: "",
  address: "",
  emoji: "",
  days_count: 0,
  start_date: "",
  end_date: "",
  num_of_people: "",
};

const TripsContext = createContext<TripsContext | null>(null);

export const TripsContextProvider = ({ children }: ContextProviderProps) => {
  const { userId, getToken } = useAuth();
  const [itineraryDetails, setItineraryDetails] =
    useState<ItineraryDetails>(defaultItinerary);
  const [editTripData, setEditTripData] =
    useState<UpdateItinerary>(defaultItineraryEdit);
  const [isAddingTrip, setIsAddingTrip] = useState<boolean>(false);
  const [isAddingLakbaiTrip, setIsAddingLakbaiTrip] = useState<boolean>(false);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const hasMounted = useRef(false);

  // Set theme on mount
  useEffect(() => {
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const localTheme = localStorage.getItem("theme");
    if (isDarkMode && !localTheme) {
      setDarkMode(true);
    }
    if (localTheme) {
      const dark_deserialized = JSON.parse(localTheme);
      if (dark_deserialized === "true") {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }
  }, []);

  // Update local storage on theme change
  useEffect(() => {
    if (hasMounted.current) {
      const dark_serialized = JSON.stringify(darkMode);
      if (darkMode) {
        document.body.classList.add("dark");
        document.body.classList.remove("grainy-light");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("grainy-light");
      }
      localStorage.setItem("theme", JSON.stringify(dark_serialized));
    }
    hasMounted.current = true;
  }, [darkMode]);

  // Calculate the days_count based on provided date.
  useEffect(() => {
    const distance = formatDistance(
      itineraryDetails.end_date,
      itineraryDetails.start_date
    );
    let numOfDays = 1;

    if (distance.includes("day")) {
      numOfDays = Number(distance.split(" ")[0]) + 1;

      if (numOfDays > 5) {
        numOfDays = 5;
      }
    } else if (!distance.includes("minute")) {
      numOfDays = 5;
    }
    setItineraryDetails((prev) => ({ ...prev, days_count: numOfDays }));
  }, [itineraryDetails.end_date, itineraryDetails.start_date]);

  function resetValues() {
    setItineraryDetails(defaultItinerary);
    setStartDate(new Date());
    setEndDate(new Date());
  }

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

  async function addTrip() {
    setIsAddingTrip(true);
    if (itineraryDetails.is_created_by_lakbai === true) {
      setIsAddingLakbaiTrip(true);
    }
    if (validationForm() && userId) {
      const token = await getToken({ template: "lakbai-supabase" });

      const itinerary = await addItinerary({
        userId,
        itineraryDetails,
        token,
      });

      if (itinerary) {
        // LakbAI / Gemini AI Trip Generation algorithm
        if (itineraryDetails.is_created_by_lakbai === true) {
          try {
            const geminiActivityArray = await geminiItineraryRun(itinerary[0]);
            if (!geminiActivityArray) {
              toast({
                title: "Uh oh! Something went wrong.",
                description:
                  "LakbAI trip generation is currently inactive. Trip created with incomplete details.",
                variant: "default",
              });
            }

            const result = await addActivity({ token, geminiActivityArray });

            if (result && result.length !== 0) {
              toast({
                title: "Trip created with LakbAI",
                description: "LakbAI has successfully created your trip.",
                variant: "default",
              });
            }
          } catch (error) {
            toast({
              title: "Uh oh! Something went wrong.",
              description:
                "LakbAI trip generation is currently inactive. Trip created with incomplete details.",
              variant: "default",
            });
            console.error("Something went wrong: ", error);
          }
        } else {
          toast({
            title: "Success!",
            description: "Itinerary added successfully!",
            variant: "default",
          });
        }
      }
      setIsAddingLakbaiTrip(false);
      setIsAddingTrip(false);
      resetValues();
      return itinerary;
    } else {
      setIsAddingLakbaiTrip(false);
      setIsAddingTrip(false);
      toast({
        title: "Form Incomplete ",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
  }

  async function editTrip(itineraryId: string) {
    const token = await getToken({ template: "lakbai-supabase" });
    const result = await updateItinerary({
      token,
      itineraryId,
      editTripData,
    });
    return result;
  }

  return (
    <TripsContext.Provider
      value={{
        userId,
        getToken,
        darkMode,
        setDarkMode,

        startDate,
        setStartDate,
        endDate,
        setEndDate,

        addTrip,
        itineraryDetails,
        setItineraryDetails,
        isAddingTrip,
        isAddingLakbaiTrip,

        editTripData,
        setEditTripData,
        editTrip,
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
  submitActivity: ({
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

export interface ActivityData {
  name: string;
  address: string;
  hour: HourType;
  minute: MinuteType;
  period: PeriodType;
  description?: string;
}

export const defaultActivityAdd: ActivityData = {
  name: "",
  address: "",
  hour: "8",
  minute: "00",
  period: "AM",
  description: "",
};

export const defaultActivityEdit: EditData = {
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
    useState<ActivityData>(defaultActivityAdd);
  const [editData, setEditData] = useState<EditData>(defaultActivityEdit);
  const [isFormComplete, setIsFormComplete] = useState<boolean | null>(null);
  const [requestComplete, setRequestComplete] = useState(false);

  const validationForm = () => {
    const { name, address, hour, minute, period } = activityData;
    if (!name || !address || !hour || !minute || !period) {
      return false;
    } else {
      return true;
    }
  };

  const submitActivity = async ({ itineraryId, day }: AddActivity) => {
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
        setActivityData(defaultActivityAdd);
        setRequestComplete((prev) => !prev);
        setIsFormComplete(null);
        return result;
      }
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Failed to add activity. Please try again.",
        variant: "default",
      });
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
      setEditData(defaultActivityEdit);
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
        submitActivity,
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
