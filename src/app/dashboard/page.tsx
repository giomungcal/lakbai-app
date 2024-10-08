import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import React from "react";
import DashboardPage from "./DashboardPage";

const Page = async () => {
  const user = await currentUser();

  if (!user) {
    return notFound();
  }

  return <DashboardPage userID={user.id} />;
};

export default Page;
