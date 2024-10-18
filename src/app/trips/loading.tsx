import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import React from "react";

const loading = () => {
  return (
    <MaxWidthWrapper className="flex w-full flex-col md:py-20">
      <section className="flex flex-col lg:flex-row space-y-4 justify-between w-full my-14 md:mb-14 md:my-0">
        <div className="space-y-2">
          <h1 className="flex text-7xl font-bold text-title dark:text-title-foreground">
            Travel Plans<span className="hidden md:block ml-2">🐸</span>
          </h1>
          <p className="text-base text-muted-foreground">
            Let&apos;s map out your next journey.
          </p>
        </div>
        <div></div>
      </section>
      <div className="animate-pulse flex flex-col justify-between w-[35%] h-52 bg-secondary/30 rounded-2xl p-5">
        <div></div>
        <div className="w-full h-12 rounded-lg bg-secondary/60" />
      </div>
    </MaxWidthWrapper>
  );
};

export default loading;
