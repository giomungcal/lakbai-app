import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data } = await axios.get(
      "https://api.clerk.dev/v1/users?limit=10&offset=0&order_by=-created_at",
      {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const newData = data.map((user) => {
      const email_address = user.email_addresses[0].email_address;
      const user_id = user.id;
      const first_name = user.first_name;
      const last_name = user.last_name;
      const image_url = user.image_url;

      return { email_address, user_id, first_name, last_name, image_url };
    });

    return NextResponse.json(newData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users from Clerk" });
  }
}
