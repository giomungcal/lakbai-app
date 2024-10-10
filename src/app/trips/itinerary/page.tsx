interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = ({ searchParams }: PageProps) => {
  const { id } = searchParams;

  return <div>{id}</div>;
};

export default Page;
