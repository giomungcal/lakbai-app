import { toast } from "@/hooks/use-toast";
import { EMOJIS } from "@/validators/options";
import { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../../database.types";
import { supabaseClient } from "./supabaseClient";

type AddItineraryType = Database["public"]["Tables"]["itineraries"]["Insert"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];
type UserRoles = Database["public"]["Tables"]["user_roles"]["Row"];

interface AddItinerary {
  userId: string;
  itineraryDetails: AddItineraryType;
  token: string;
}

interface GetSpecific {
  itineraryId: string | undefined;
  token?: string | null;
}

interface GetUserRoles {
  userId: string;
  token: string | null;
  supabase?: SupabaseClient;
}

type ItineraryType = Itinerary[];
type ActivitiesType = Activities[];

// User Roles Fetching
// Gets all the entries where userId has wither "view" or "edit" access

export const getUserRoles = async ({
  userId,
  token,
  supabase,
}: GetUserRoles): Promise<UserRoles[] | undefined> => {
  if (!supabase) {
    supabase = await supabaseClient(token);
  }

  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", userId);

  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
    return;
  }

  return userRoles;
};

// Itinerary Requests

export const getItineraries = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) => {
  const supabase = await supabaseClient(token);

  // Fetch user roles first
  const userRoles = await getUserRoles({ userId, token, supabase });

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
}: AddItinerary) => {
  const { name, address, emoji, start_date, end_date, num_of_people } =
    itineraryDetails;
  const emojiObject = EMOJIS.find((e) => e.value === emoji);
  const emojiDisplay = emojiObject ? emojiObject.emoji : "👽";
  const uuidString: string = uuidv4();

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("itineraries")
    .insert([
      {
        id: uuidString,
        name,
        address,
        emoji: emojiDisplay,
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

interface UpdateDay {
  token: string;
  action: "add" | "delete";
  day: number;
  itineraryId: string;
}

export const updateDay = async ({ token, action, day, itineraryId }) => {
  const supabase = await supabaseClient(token);

  if (action === "add") {
    const { data, error } = await supabase
      .from("itineraries")
      .update({ days_count: day })
      .eq("id", itineraryId)
      .select();
    if (error) {
      toast({
        title: "Insertion Error. Try again later.",
        description: `Failed to add new day: ${error.message}`,
        variant: "destructive",
      });
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
      toast({
        title: "Insertion Error. Try again later.",
        description: `Failed to remove latest day: ${error.message}`,
        variant: "destructive",
      });
      return;
    }
    return data;
  }
};
