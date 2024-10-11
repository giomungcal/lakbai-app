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

type UserRole = "view" | "edit" | "owner";

type Itineraries = Database["public"]["Tables"]["itineraries"]["Row"];

const Page = async ({ searchParams }: PageProps) => {
  const { id: itineraryId } = searchParams;
  const { userId, getToken } = auth();

  async function fetchTripData() {
    if (!userId) {
      const itinerary = await getSpecificItinerary({ itineraryId });
      const activities = await getSpecificActivity({ itineraryId });

      console.log(activities);

      //   itineraries.length !== 0
      //     ? console.log("User is able to see it because its Public!!")
      //     : console.log("Trip is PRIVATE!");

      return { itinerary, activities };
    } else {
      const token = await getToken({ template: "lakbai-supabase" });
      const itinerary = await getSpecificItinerary({ itineraryId, token });
      const activities = await getSpecificActivity({ itineraryId, token });

      //   itinerary?.map((i) => console.log("Auth User Trip: ", i.name));

      // To identify if the User is the owner of the itinerary
      let userRole: UserRole = "view";

      if (itinerary) {
        const isOwner = itinerary.some((i) => i.owner_id === userId);
        if (isOwner) {
          userRole = "owner";
        }
        console.log("Is User the owner of this Itinerary: ", isOwner);
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
