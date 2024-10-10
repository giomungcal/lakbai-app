import { useParams } from "next/navigation";

const Page = () => {
  const pathname = useParams();

  console.log(pathname);

  return <div></div>;
};

export default Page;
