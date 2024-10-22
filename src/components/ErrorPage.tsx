import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";

const ErrorPage = () => {
  return (
    <MaxWidthWrapper className="min-h-[95vh] flex items-center justify-center space-x-4">
      <span className="text-9xl">👻</span>
      <div className="space-y-3">
        <h1 className="text-6xl font-bold">Boo!</h1>
        <p className="text-muted-foreground text-sm font-semibold">
          We cannot find the page you were looking for.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft width={21} height={21} className="mr-1" /> Go Home
          </Link>
        </Button>
      </div>
    </MaxWidthWrapper>
  );
};

export default ErrorPage;
