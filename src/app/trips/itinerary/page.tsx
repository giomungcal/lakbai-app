import { getActivities } from "@/utils/supabase/supabaseRequests";
import { auth } from "@clerk/nextjs/server";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const { id } = searchParams;
  const { getToken } = auth();

  async function fetchActivities() {
    try {
      const token = await getToken({ template: "lakbai-supabase" });
      if (!token) {
        console.error("No token received from Clerk.");
        return null;
      }
      const activities = await getActivities({ token, id });
      return activities;
    } catch (error) {
      console.error("Error fetching token or itineraries:", error);
      return null;
    }
  }

  async function getUserRole() {
    return "user";
  }

  async function fetchItineraries() {
    return "user";
  }

  //   Check from itineraries if itinerary is 1. isPublic and 2. isUser the owner?
  const isOwner = false;

  //   const [activities, userRole] = await Promise.all([
  //     fetchActivities(),
  //     getUserRole(),
  //   ]);

  //   const userPrivilege = id || "view";

  return <div>{id}</div>;
};

export default Page;
