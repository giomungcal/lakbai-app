import { toast } from "@/hooks/use-toast";
import { EMOJIS } from "@/validators/options";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../../database.types";
import { supabaseClient } from "./supabaseClient";

type AddItineraryType = Database["public"]["Tables"]["itineraries"]["Insert"];
type Itinerary = Database["public"]["Tables"]["itineraries"]["Row"];

interface AddItinerary {
  userId: string;
  itineraryDetails: AddItineraryType;
  token: string;
}

type ItineraryType = Itinerary[];

// Itinerary Requests

export const getItineraries = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) => {
  const supabase = await supabaseClient(token);

  // Fetch all the itineraries where user has edit/view access
  const { data: userRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("itinerary_id")
    .eq("user_id", userId);

  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
  } else {
    const itineraryIds = userRoles.map((data) => data.itinerary_id);

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
  }
};

export const getSpecificItinerary = async ({
  itineraryId,
  token,
}: {
  itineraryId: string | undefined;
  token?: string;
}): Promise<ItineraryType | undefined> => {
  const supabase = await supabaseClient(token);

  // Will return error if itinerary is not public
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", itineraryId);

  console.log(itineraries);

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
}: {
  itineraryId: string | undefined;
  token?: string;
}) => {
  const supabase = await supabaseClient(token);

  // Will return error if itinerary is not public
  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .eq("itinerary_id", itineraryId);

  console.log(activities);

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

// Activity Requests

export const getActivities = async ({ token, id }) => {
  const supabase = await supabaseClient(token);
  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .eq("itinerary_id", id);

  if (!error) {
    console.log(activities);
  } else {
    console.log(error.message);
  }
};
