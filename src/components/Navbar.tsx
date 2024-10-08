"use client";

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const path = usePathname();

  const isDashboard = path === "/dashboard";

  return (
    <header className=" h-14 z-[100] inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <nav className="h-14 flex justify-between items-center">
          <div>
            <Link href="/">LakbAI</Link>
          </div>
          <div className="space-x-2">
            <SignedOut>
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {!isDashboard && (
                <Link
                  href={"/dashboard"}
                  className={buttonVariants({ variant: "default" })}
                >
                  Dashboard
                </Link>
              )}
              <SignOutButton>
                <Button variant="secondary">Logout</Button>
              </SignOutButton>
            </SignedIn>
          </div>
        </nav>
      </MaxWidthWrapper>
    </header>
  );
};

export default Navbar;
