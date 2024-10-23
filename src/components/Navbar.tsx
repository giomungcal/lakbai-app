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

  const isTripsPage = path === "/trips";

  return (
    <header className="sticky h-14 z-40 inset-x-0 top-0 w-full border border-t-0 border-x-0 backdrop-blur-md transition-all">
      <MaxWidthWrapper>
        <nav className="h-14 flex justify-between items-center">
          <div>
            <Link href="/" className="font-bold text-title">
              LakbAI
            </Link>
          </div>
          <div className="space-x-2">
            <SignedOut>
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {!isTripsPage && (
                <Link
                  href={"/trips"}
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Trips
                </Link>
              )}
              <SignOutButton>
                <Link href="/" className={buttonVariants({ variant: "ghost" })}>
                  Logout
                </Link>
              </SignOutButton>
            </SignedIn>
          </div>
        </nav>
      </MaxWidthWrapper>
    </header>
  );
};

export default Navbar;
