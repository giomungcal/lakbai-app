/* eslint-disable @next/next/no-img-element */
import LandingButton from "@/components/LandingButton";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <MaxWidthWrapper className="pt-24 sm:pt-44">
        {/* Hero Section */}
        <section className="flex flex-col justify-end space-y-4">
          <div className="flex flex-col md:flex-row justify-between space-y-4">
            <div className="flex flex-col space-y-4">
              <div className="flex">
                <div className="py-1 px-7 flex items-center rounded-full border-black border bg-[#FFFBF1] dark:bg-primary w-fit">
                  <p className="text-xs">lak*bai is live</p>
                </div>
              </div>
              <h1 className="font-ZT text-4xl sm:text-6xl lg:text-7xl font-semibold max-w-[650px] text-[#5e975c] dark:text-[#e4e48d] ">
                plan your next adventure with ease
                <span className="text-[#EB9B08]">*</span>
              </h1>
              <div className="hidden sm:flex flex-col sm:flex-row justify-start gap-1 sm:space-x-1">
                <div className="py-1 px-6 flex items-center rounded-full border-black border bg-[#DAFBFF] dark:bg-primary w-44 justify-center sm:w-fit">
                  <p className="text-xs">
                    <span className="text-[#56B9C8]">✦</span> powered by gemini
                  </p>
                </div>
                <div className="py-1 px-6 flex items-center rounded-full border-black border bg-[#DAFFE1] dark:bg-primary w-44 justify-center sm:w-fit">
                  <p className="text-xs">💸 free-of-charge</p>
                </div>
              </div>
              <p className="max-w-[300px] md:max-w-[475px] text-sm">
                Plan your perfect trip effortlessly.{" "}
                <span className="font-bold">Create</span>,{" "}
                <span className="font-bold">share</span>, and
                <span className="font-bold"> collaborate</span> on travel
                itineraries with friends—all in one place. Also, let{" "}
                <span className="font-bold">AI plan the entire trip</span> for
                you, for{" "}
                <span className="font-bold text-[#20753c] dark:text-[#d9b730] underline">
                  free!
                </span>
              </p>
            </div>
            <div className="flex items-end md:justify-center">
              <SignedOut>
                <SignInButton>
                  <LandingButton className="text-xs sm:text-sm">
                    start planning your next trip --&gt;
                  </LandingButton>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href={"/trips"}>
                  <LandingButton className="text-xs sm:text-sm">
                    start planning your next trip --&gt;
                  </LandingButton>
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="w-full flex justify-center ">
            <Image
              priority
              width={1152}
              height={187}
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
              width={80}
              height={80}
              src="/feature-icon-2.png"
              alt="Art Icon"
            />
          </div>

          {/* Feature Cards */}
          <div className="border-black border bg-[#BCFFC4] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl tracking-tighter leading-7 font-ZT">
              Effortlessly Create Itineraries
            </h2>
            <p className="text-sm">
              Design and customize your travel itineraries with ease,
              incorporating destinations, activities, and schedules all in one
              place.
            </p>
          </div>
          <div className="border-black border bg-[#CEDDFF] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl tracking-tighter leading-7 font-ZT max-w-[180px]">
              Collaborate with Friends
            </h2>
            <p className="text-sm">
              Share your itineraries with friends, allowing them to contribute
              ideas, suggestions, and changes in real time for a more enjoyable
              travel planning experience.
            </p>
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-1 border-black border bg-[#FEFE9A] dark:bg-accent p-6 flex flex-col items-center justify-center space-y-1 ">
            <h2 className="text-2xl tracking-tighter leading-7 font-ZT max-w-[180px]">
              Lak*bai Trip Planning
            </h2>
            <p className="text-sm max-w-[380px]">
              Utilize our AI feature to automatically generate personalized
              itineraries based on your preferences, making trip planning fast,
              simple, and hassle-free.
            </p>
          </div>
        </section>

        {/* Showcase Section */}
        <section className="py-16 space-y-10 w-full flex flex-col items-center justify-center">
          <h2 className="text-semibold font-ZT text-3xl tracking-tighter leading-7 text-center px-16">
            design your travel itinerary with your{" "}
            <span className="text-[#579D36]">friends</span> 🍍
          </h2>
          <div className="lg:mx-4 p-2 md:p-4 border rounded-xl bg-gray-900/5 dark:bg-accent/20">
            <img
              className="block dark:hidden rounded-lg border ]"
              src="https://imgur.com/AU0aZBG.png"
              alt="LakbAI Screenshot Dark Mode"
            />
            <img
              className="hidden dark:block rounded-lg border "
              src="https://i.imgur.com/cOU6KFl.png"
              alt="LakbAI Screenshot Light Mode"
            />
          </div>
        </section>

        {/* AI Showcase Section */}
        <section className="py-16 space-y-10 w-full flex flex-col items-center justify-center">
          <h2 className="text-semibold font-ZT text-3xl tracking-tighter leading-7 text-center px-16">
            or let AI craft one in as fast as{" "}
            <span className="text-[#2AB3C2]">8 seconds</span> 💡
          </h2>
          <div className="lg:mx-4 p-2 md:p-4 border rounded-xl bg-gray-900/5 dark:bg-accent/20 ">
            <img
              className="block dark:hidden rounded-lg border "
              src="https://imgur.com/ib10QIP.png"
              alt="LakbAI Screenshot Dark Mode"
            />
            <img
              className="hidden dark:block rounded-lg border"
              src="https://i.imgur.com/oX8BKpZ.png"
              alt="LakbAI Screenshot Light Mode"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex flex-col items-center justify-center py-28 space-y-6 mb-8">
          <h2 className="text-4xl sm:text-5xl tracking-tighter max-w-[480px] font-ZT text-center">
            begin your journey with Lakb
            <span className="text-[#5e975c] ">AI</span> now 🌴
          </h2>
          <SignedOut>
            <SignInButton>
              <LandingButton>get started for free --&gt;</LandingButton>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href={"/trips"}>
              <LandingButton>get started for free --&gt;</LandingButton>
            </Link>
          </SignedIn>
        </section>
      </MaxWidthWrapper>
    </>
  );
}
