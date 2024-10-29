import { cn } from "@/lib/utils";

function LandingButton({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  return (
    <button
      className={cn(
        "dropbox-effect border-black border text-sm px-6 py-2 bg-[#FFD11B] text-black",
        className
      )}
    >
      {children}
    </button>
  );
}

export default LandingButton;
