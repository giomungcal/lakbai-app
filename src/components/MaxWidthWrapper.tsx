import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

const MaxWidthWrapper = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("mx-auto w-full max-w-screen-xl px-8 md:px-20 ", className)}
    >
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
