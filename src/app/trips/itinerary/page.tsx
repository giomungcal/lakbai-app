import {
  getActivities,
  getSpecificActivity,
  getSpecificItinerary,
} from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";
import { Database } from "../../../../database.types";

interface PageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

type Itineraries = Database["public"]["Tables"]["itineraries"]["Row"];

const Page = async ({ searchParams }: PageProps) => {
  const { id: itineraryId } = searchParams;
  const { userId, getToken } = auth();

  async function fetchTripData() {
    if (!userId) {
      const itinerary = await getSpecificItinerary({ itineraryId });
      const activities = await getSpecificActivity({ itineraryId });

      //   itineraries.length !== 0
      //     ? console.log("User is able to see it because its Public!!")
      //     : console.log("Trip is PRIVATE!");

      return { itinerary, activities };
    } else {
      const token = await getToken({ template: "lakbai-supabase" });
      const itinerary = await getSpecificItinerary({ itineraryId, token });

      console.log("Authenticated: ", itinerary);

      let isOwner = false;

      if (itinerary) {
        const isOwner = itinerary.some((i) => i.owner_id === userId);
      }

      //   Check if Edit or View Privilege by fetching user roles
      //   async function getUserRole() {
      //     return "user";
      //   }

      return { itinerary, activities, isOwner, isEditor, isViewer };
    }
  }

  const { itinerary, activities, isOwner, isEditor, isViewer } =
    fetchTripData();

  //   const userPrivilege = id || "view";

  return <div>{itineraryId}</div>;
};

export default Page;
