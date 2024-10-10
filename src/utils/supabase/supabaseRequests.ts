import { toast } from "@/hooks/use-toast";
import { EMOJIS } from "@/validators/options";
import { v4 as uuidv4 } from "uuid";
import { Database } from "../../../database.types";
import { supabaseClient } from "./supabaseClient";

type AddItineraryType = Database["public"]["Tables"]["itineraries"]["Insert"];

interface AddItinerary {
  userId: string;
  itineraryDetails: AddItineraryType;
  token: string;
}

export const getItineraries = async ({ token }: { token: string }) => {
  const supabase = await supabaseClient(token);
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*");

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error.message
    );
    return;
  }
  return itineraries;
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
