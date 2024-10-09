import { toast } from "@/hooks/use-toast";
import { EMOJIS, ItineraryDetailsProps } from "@/validators/options";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseClient } from "./supabaseClient";

export const getUsers = async ({ token }) => {
  const supaabse = await supabaseClient(token);
  const { data: users, error } = await supaabse.from("users").select("*");

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error
    );
  } else {
    return users;
  }
};

export const getItineraries = async ({ token }) => {
  const supabase = await supabaseClient(token);
  const { data: itineraries, error } = await supabase
    .from("itineraries")
    .select("*");

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error
    );
    return;
  }
  return itineraries;
};

export const addItinerary = async (
  userId: string,
  {
    name,
    address,
    emoji,
    startDate,
    endDate,
    numOfPeople,
  }: ItineraryDetailsProps,
  token: string
) => {
  const emojiObject = EMOJIS.find((e) => e.value === emoji);
  const emojiDisplay = emojiObject ? emojiObject.emoji : null;

  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("itineraries")
    .insert([
      {
        id: uuidv4(),
        name: name,
        address: address,
        start_date: startDate,
        end_date: endDate,
        num_of_people: numOfPeople,
        is_created_by_lakbai: false,
        owner_id: userId,
        emoji: emojiDisplay,
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
