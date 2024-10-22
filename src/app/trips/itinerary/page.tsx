import ErrorPage from "@/components/ErrorPage";
import {
  getSpecificActivity,
  getSpecificItinerary,
  getUserRoles,
} from "@/utils/supabase/supabaseRequests";
import { UserRole } from "@/validators/options";
import { users } from "@clerk/clerk-sdk-node";
import { auth, currentUser, User } from "@clerk/nextjs/server";
import axios from "axios";
import { Database } from "../../../../database.types";
import ItineraryPage from "./ItineraryPage";

interface PageProps {
  searchParams: {
    [key: string]: string | undefined;
  };
}

type Itineraries = Database["public"]["Tables"]["itineraries"]["Row"];
type Activities = Database["public"]["Tables"]["activities"]["Row"];

export interface FetchTripData {
  itinerary: Itineraries[] | null;
  activities: Activities[] | null;
  userRole: UserRole;
}

const Page = async ({ searchParams }: PageProps) => {
  const { id: itineraryId } = searchParams;
  const { userId, getToken } = auth();

  async function fetchTripData(): Promise<FetchTripData> {
    if (!userId) {
      const itinerary = await getSpecificItinerary({ itineraryId });
      const activities = await getSpecificActivity({ itineraryId });

      return {
        itinerary: itinerary ?? null,
        activities: activities ?? null,
        userRole: "public",
      };
    } else {
      const token = await getToken({ template: "lakbai-supabase" });

      const itinerary = await getSpecificItinerary({ itineraryId, token });
      const activities = await getSpecificActivity({ itineraryId, token });

      // Identify the User Role: owner, viewer, editor, anonymous
      let userRole: UserRole = "none";

      if (itinerary) {
        const isOwner = itinerary.some((i) => i.owner_id === userId);
        const isPublic = itinerary.some((i) => i.is_public === true);

        // Get email address
        const User = await currentUser();
        const emailAddress = User?.emailAddresses[0].emailAddress;

        if (isOwner) {
          userRole = "owner";
        } else if (isPublic) {
          userRole = "public";
        } else {
          // Check if user has Edit/View Role
          const userRoles = await getUserRoles({
            userId,
            token,
          });
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

      return {
        itinerary: itinerary ?? null,
        activities: activities ?? null,
        userRole,
      };
    }
  }

  const { itinerary, activities, userRole } = await fetchTripData();

  // Error 404 Page
  if (!itinerary || itinerary.length === 0) {
    return <ErrorPage />;
  }

  return (
    <ItineraryPage
      activities={activities}
      itinerary={itinerary}
      userRole={userRole}
    />
  );
};

export default Page;
