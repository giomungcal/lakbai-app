import {
  getSpecificActivity,
  getSpecificItinerary,
  getUserRoles,
} from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";
import { Database } from "../../../../database.types";

interface PageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

type UserRole = "view" | "edit" | "owner" | "none" | "public";

type Itineraries = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];

interface FetchTripData {
  itinerary: Itineraries[] | undefined;
  activities: Activities[] | undefined;
  userRole: UserRole;
}

const Page = async ({ searchParams }: PageProps) => {
  const { id: itineraryId } = searchParams;
  const { userId, getToken } = auth();

  async function fetchTripData(): Promise<FetchTripData> {
    if (!userId) {
      const itinerary = await getSpecificItinerary({ itineraryId });
      const activities = await getSpecificActivity({ itineraryId });

      //   itineraries.length !== 0
      //     ? console.log("User is able to see it because its Public!!")
      //     : console.log("Trip is PRIVATE!");

      return { itinerary, activities, userRole: "public" };
    } else {
      const token = await getToken({ template: "lakbai-supabase" });
      const itinerary = await getSpecificItinerary({ itineraryId, token });
      const activities = await getSpecificActivity({ itineraryId, token });

      //   itinerary?.map((i) => console.log("Auth User Trip: ", i.name));

      // To identify if the User is the Owner of the itinerary
      let userRole: UserRole = "none";

      if (itinerary) {
        const isOwner = itinerary.some((i) => i.owner_id === userId);
        const isPublic = itinerary.some((i) => i.is_public === true);

        if (isOwner) {
          userRole = "owner";
          console.log("Is User the owner of this Itinerary: ", isOwner);
        } else if (isPublic) {
          userRole = "public";
        } else {
          //   Check if user has Edit/View Role
          const userRoles = await getUserRoles({ userId, token });
          if (userRoles) {
            const roleForThisItinerary = userRoles.map(
              (i) => i.itinerary_id === itineraryId && i.role
            );

            // Sets userRole to edit in any chance that user has both view and edit in the same itinerary
            if (roleForThisItinerary.some((i) => i === "edit")) {
              userRole = "edit";
            } else if (roleForThisItinerary.some((i) => i === "view")) {
              userRole = "view";
            }
          }
        }
      }

      return { itinerary, activities, userRole };
    }
  }

  const { itinerary, activities, userRole } = await fetchTripData();

  console.log("Activities", activities);
  console.log("Itineraries", itinerary);
  console.log("User's Role:", userRole);

  //   IF NO Itinerary, meaning does not exist, or inaccessible, reach out to user

  //   const userPrivilege = id || "view";

  return <div>{itineraryId}</div>;
};

export default Page;
