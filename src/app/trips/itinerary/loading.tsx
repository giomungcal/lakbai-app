import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import React from "react";

const loading = () => {
  return (
    <MaxWidthWrapper className="flex w-full flex-col py-14 md:py-20">
      <div className="w-full list-inside list-decimal text-sm text-center sm:text-left">
        {/* Title Section */}
        <section className=" w-full flex flex-row space-y-4 justify-between mb-14">
          <div className="w-full flex flex-col space-y-2">
            <div className="w-full flex flex-col space-y-4 mr-4">
              <div className="h-24 w-[50%] bg-secondary/50 rounded-xl animate-pulse" />
              <div className="h-8 w-[20%] bg-accent/60 rounded-xl animate-pulse" />
            </div>
          </div>
        </section>
      </div>
    </MaxWidthWrapper>
  );
};

export default loading;
