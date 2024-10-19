import { clerkClient } from "@clerk/nextjs/server";

export async function getFullNameByUserId(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    } else {
      return "User not found";
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return "Error fetching user";
  }
}
