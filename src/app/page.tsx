import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <MaxWidthWrapper className="">
        {/* Hero Section */}
        <section className="min-h-[730px] flex flex-col justify-end space-y-4">
          <div className="flex flex-col md:flex-row justify-between space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-center sm:justify-start">
                <div className="py-1 px-7 flex items-center rounded-full border-black border bg-[#FFFBF1] dark:bg-primary w-fit">
                  <p className="text-xs">lak*bai is live</p>
                </div>
              </div>
              <h1 className="font-ZT text-4xl sm:text-6xl lg:text-7xl font-semibold max-w-[650px] text-[#71AA6F] text-center sm:text-left ">
                plan your next adventure with ease
                <span className="text-[#EB9B08]">*</span>
              </h1>
              <div className="flex flex-col sm:flex-row justify-start items-center gap-1 sm:space-x-1">
                <div className="py-1 px-6 flex items-center rounded-full border-black border bg-[#DAFBFF] dark:bg-primary w-44 justify-center sm:w-fit">
                  <p className="text-xs">
                    <span className="text-[#56B9C8]">✦</span> powered by gemini
                  </p>
                </div>
                <div className="py-1 px-6 flex items-center rounded-full border-black border bg-[#DAFFE1] dark:bg-primary w-44 justify-center sm:w-fit">
                  <p className="text-xs">💸 free-of-charge</p>
                </div>
              </div>
              <p className="max-w-[475px] text-sm text-center sm:text-left">
                Plan your perfect trip effortlessly. Create, share, and
                collaborate on travel itineraries with friends—all in one place.
                Also, let AI plan the entire trip for you, for free!
              </p>
            </div>
            <div className="flex items-end justify-center">
              <LandingButton className="text-xs sm:text-sm">
                start planning your next trip --&gt;
              </LandingButton>
            </div>
          </div>
          <div className="w-full flex justify-center ">
            <img
              className="h-[186px] w-[1140px] object-cover"
              src="/hero-peeps.png"
              alt="Hero Section Peeps Illustration"
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center max-w-[1150px] mx-auto">
          {/* Art */}
          <div aria-hidden className="absolute top-24 -left-7 ">
            <Image
              height={80}
              width={80}
              src="/feature-icon-1.png"
              alt="Art Icon"
            />
          </div>
          <div aria-hidden className="absolute bottom-24 -right-10 ">
            <Image
              height={81}
              width={80}
              src="/feature-icon-2.png"
              alt="Art Icon"
            />
          </div>

          {/* Feature Cards */}
          <div className="border-black border bg-[#BCFFC4] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl font-ZT">
              Effortlessly Create Itineraries
            </h2>
            <p className="text-sm">
              Design and customize your travel itineraries with ease,
              incorporating destinations, activities, and schedules all in one
              place.
            </p>
          </div>
          <div className="border-black border bg-[#CEDDFF] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl font-ZT max-w-[180px]">
              Collaborate with Friends
            </h2>
            <p className="text-sm">
              Share your itineraries with friends, allowing them to contribute
              ideas, suggestions, and changes in real time for a more enjoyable
              travel planning experience.
            </p>
          </div>
          <div className="border-black border bg-[#FEFE9A] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl font-ZT max-w-[180px]">
              Lak*bai Trip Planning
            </h2>
            <p className="text-sm">
              Utilize our AI feature to automatically generate personalized
              itineraries based on your preferences, making trip planning fast,
              simple, and hassle-free.
            </p>
          </div>
        </section>
      </MaxWidthWrapper>
    </>
  );
}

function LandingButton({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  return (
    <button
      className={cn("text-sm px-6 py-2 bg-[#FFD11B] text-black", className)}
    >
      {children}
    </button>
  );
}
