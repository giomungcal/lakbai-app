import { ActivityData } from "@/app/_context/AppContext";
import { toast } from "@/hooks/use-toast";
import { EMOJIS } from "@/validators/options";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../../database.types";
import { supabaseClient } from "./supabaseClient";

type AddItineraryType = Database["public"]["Tables"]["itineraries"]["Insert"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];
type UpdateItineraryData =
  Database["public"]["Tables"]["itineraries"]["Update"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];
type UserRoles = Database["public"]["Tables"]["user_roles"]["Row"];
type UpdateActivityData = Database["public"]["Tables"]["activities"]["Update"];

interface AddItinerary {
  userId: string;
  itineraryDetails: AddItineraryType;
  token: string;
}

interface DeleteItinerary {
  token: string | null;
  itineraryId: string | undefined;
}

interface UpdateItinerary {
  token: string | null;
  itineraryId: string;
  editTripData: UpdateItineraryData;
}

interface GetSpecific {
  itineraryId: string | undefined;
  token?: string | null;
}

interface GetUserRoles {
  userId?: string;
  itineraryId?: string;
  token: string | null;
}

interface UpdateDay {
  token: string | null;
  action: "add" | "delete";
  day: number;
  itineraryId: string;
}

interface AddActivity {
  token: string | null;
  activityData: ActivityData;
  day: string;
  itineraryId: string | undefined;
}

interface UpdateActivity {
  token: string | null;
  activityId: number;
  editData: UpdateActivityData;
}

interface DeleteActivity {
  token: string | null;
  activityId: number;
}

interface UpdatePublic {
  token: string | null;
  itineraryId: string;
  isPublic: boolean;
}

type ItineraryType = Itinerary[];
type ActivitiesType = Activities[];

export const getUserRoles = async ({
  userId,
  itineraryId,
  token,
}: GetUserRoles) => {
  const supabase = await supabaseClient(token);

  if (userId) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user roles:", error.message);
      return;
    }

    return data as UserRoles[];
  } else if (itineraryId) {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("itinerary_id", itineraryId);

    if (error) {
      console.error("Error fetching user roles:", error.message);
      return;
    }
    console.log(data);

    return data as UserRoles[];
  }
};

export const getItineraries = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<Itinerary[] | undefined> => {
  const supabase = await supabaseClient(token);

  // Fetch user roles first
  const userRoles = await getUserRoles({ userId, token });

  let itineraryIds: string[] = [];

  if (userRoles) {
    itineraryIds = userRoles.map((data) => data.itinerary_id);
  }

  // Fetch itineraries that user owns or has edit/view access to
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*")
    .or(`owner_id.eq.${userId},id.in.(${itineraryIds.join(",")})`);

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error.message
    );
    return;
  }
  return itineraries;
};

export const deleteItinerary = async ({
  token,
  itineraryId,
}: DeleteItinerary) => {
  const supabase = await supabaseClient(token);
  const { error } = await supabase
    .from("itineraries")
    .delete()
    .eq("id", itineraryId);

  if (error) {
    console.error(
      "There has been an error deleting the itinerary in Supabase: ",
      error.message
    );
    return error;
  }
};

export const getSpecificItinerary = async ({
  itineraryId,
  token,
}: GetSpecific): Promise<ItineraryType | undefined> => {
  const supabase = await supabaseClient(token);

  // Will return error if itinerary is not public
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", itineraryId);

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error.message
    );
    return;
  }

  return itineraries as ItineraryType;
};

export const getSpecificActivity = async ({
  itineraryId,
  token,
}: GetSpecific): Promise<ActivitiesType | undefined> => {
  const supabase = await supabaseClient(token);

  // Will return error if itinerary is not public
  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .eq("itinerary_id", itineraryId);

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error.message
    );
    return;
  }

  return activities;
};

export const addItinerary = async ({
  userId,
  itineraryDetails,
  token,
}: AddItinerary): Promise<ItineraryType | undefined> => {
  const { name, address, emoji, start_date, end_date, num_of_people } =
    itineraryDetails;

  const uuidString: string = uuidv4();

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("itineraries")
    .insert([
      {
        id: uuidString,
        name,
        address,
        emoji,
        start_date,
        end_date,
        is_created_by_lakbai: false,
        owner_id: userId,
        num_of_people,
      },
    ])
    .select();

  if (error) {
    toast({
      title: "Insertion Error. Try again later.",
      description: `Failed to create itinerary: ${error.message}`,
      variant: "destructive",
    });
    return;
  }

  return data;
};

export const updateItinerary = async ({
  token,
  itineraryId,
  editTripData,
}: UpdateItinerary): Promise<UpdateItineraryData[] | undefined> => {
  const {
    name,
    address,
    emoji,
    days_count,
    num_of_people,
    start_date,
    end_date,
  } = editTripData;

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("itineraries")
    .update({
      name,
      address,
      emoji,
      days_count,
      num_of_people,
      start_date,
      end_date,
    })
    .eq("id", itineraryId)
    .select();

  if (error) {
    console.error(
      "There has been an error updating the itinerary: ",
      error.message
    );
    return;
  }
  return data;
};

export const updateDay = async ({
  token,
  action,
  day,
  itineraryId,
}: UpdateDay): Promise<ItineraryType | undefined> => {
  const supabase = await supabaseClient(token);

  if (action === "add") {
    const { data, error } = await supabase
      .from("itineraries")
      .update({ days_count: day })
      .eq("id", itineraryId)
      .select();
    if (error) {
      console.error("Insertion Error. Try again later.");
      return;
    }
    return data;
  } else if (action === "delete") {
    const { data, error } = await supabase
      .from("itineraries")
      .update({ days_count: day })
      .eq("id", itineraryId)
      .select();

    if (error) {
      console.error("Deletion Error. Try again later.");
      return;
    }
    return data;
  }
};

export const addActivity = async ({
  token,
  itineraryId,
  day,
  activityData,
}: AddActivity): Promise<ActivitiesType | undefined> => {
  const { name, address, hour, minute, period, description } = activityData;

  const time = `${hour}:${minute} ${period}`;

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("activities")
    .insert([
      { itinerary_id: itineraryId, day, name, address, time, description },
    ])
    .select();

  if (error) {
    console.error(
      "There has been an error inserting the data from Supabase: ",
      error.message
    );
    return;
  }

  return data;
};

export const updateActivity = async ({
  token,
  activityId,
  editData,
}: UpdateActivity): Promise<UpdateActivityData[] | undefined> => {
  const { name, time, address, description } = editData;

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("activities")
    .update({ name, time, address, description })
    .eq("id", activityId)
    .select();

  if (error) {
    console.error(
      "There has been an error updating the data in Supabase: ",
      error.message
    );
    return;
  }

  return data;
};

export const deleteActivity = async ({ token, activityId }: DeleteActivity) => {
  const supabase = await supabaseClient(token);
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    console.error(
      "There has been an error deleting the activity in Supabase: ",
      error.message
    );
    return error;
  }
};

export const updatePublic = async ({
  token,
  itineraryId,
  isPublic,
}: UpdatePublic) => {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("itineraries")
    .update({ is_public: isPublic })
    .eq("id", itineraryId)
    .select();

  if (error) {
    console.error(
      "There has been an error updating the data in Supabase: ",
      error.message
    );
    return;
  }

  return data;
};
