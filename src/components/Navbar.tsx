/* eslint-disable @next/next/no-img-element */
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Switch } from "./ui/switch";

async function Navbar() {
  const user = await currentUser();

  return (
    <header className="sticky h-14 z-40 inset-x-0 top-0 w-full border border-t-0 border-x-0 backdrop-blur-md transition-all">
      <MaxWidthWrapper>
        <nav className="h-14 flex justify-between items-center">
          <div className="h-full flex items-center">
            <Link href="/" className="font-bold text-title py-3 pr-3">
              🐸 LakbAI
            </Link>
          </div>
          <div className="flex space-x-2 items-center justify-center">
            <SignedOut>
              <SignInButton forceRedirectUrl={"/trips"}>
                <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="size-9 cursor-pointer">
                      <img
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                        src={user?.imageUrl}
                        alt="User Avatar"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>
                      {user.firstName} {user.lastName}
                    </DropdownMenuLabel>
                    <DropdownMenuLabel className="text-xs font-light -mt-3">
                      {user.emailAddresses[0].emailAddress}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/trips">Trips</Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <SignOutButton>
                        <Link href="/">Logout</Link>
                      </SignOutButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </SignedIn>
          </div>
        </nav>
      </MaxWidthWrapper>
    </header>
  );
}

export default Navbar;
