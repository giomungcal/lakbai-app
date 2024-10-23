"use client";

import { useTripsContext } from "@/app/_context/AppContext";
import { Moon, Sun } from "lucide-react";
import React from "react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Switch } from "./ui/switch";

const Footer = () => {
  const { darkMode, setDarkMode } = useTripsContext();

  return (
    <footer className="bg-background py-8 border border-x-0 border-b-0">
      <MaxWidthWrapper className="min-h-20 space-y-4 flex flex-col md:flex-row space justify-around md:justify-between items-center text-xs text-card-foreground/60 transition-colors">
        <div className="">
          <h4>
            made by <span className="text-title">★ gio mungcal ★</span>
          </h4>
          <p>
            ai powered by{" "}
            <a
              href="https://gemini.google.com/app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#56b9c8]"
            >
              ✦ gemini
            </a>
          </p>
        </div>
        <div className="hidden md:flex space-x-4">
          <a
            href="https://yogi-space.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            my space
          </a>
          <span>•</span>
          <a
            href="https://github.com/giomungcal/"
            target="_blank"
            rel="noopener noreferrer"
          >
            github
          </a>
          <span>•</span>
          <a
            href="https://www.linkedin.com/in/giomungcal"
            target="_blank"
            rel="noopener noreferrer"
          >
            linked in
          </a>
        </div>
        <div className="min-w-36 flex items-center text-title justify-center md:justify-end space-x-3">
          {darkMode ? (
            <Moon width={17} height={17} />
          ) : (
            <Sun width={17} height={17} />
          )}
          <Switch
            checked={darkMode}
            onCheckedChange={() => setDarkMode((prev) => !prev)}
          ></Switch>
        </div>
      </MaxWidthWrapper>
    </footer>
  );
};

export default Footer;
