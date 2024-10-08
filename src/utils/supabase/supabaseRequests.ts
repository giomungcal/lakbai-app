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

export const getItineraries = async ({ userId, token }) => {
  const supaabse = await supabaseClient(token);
  const { data: itineraries, error } = await supaabse
    .from("itineraries")
    .select("*")
    .eq("owner_id", userId);

  if (error) {
    console.error(
      "There has been an error fetching the data from Supabase: ",
      error
    );
  } else {
    return itineraries;
  }
};
