import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EMOJIS, NUMBER_OF_PEOPLE } from "@/validators/options";
import { format } from "date-fns";
import Link from "next/link";

const TripCard = ({ tripDetails }) => {
  const {
    id,
    emoji,
    name,
    address,
    start_date: dateStart,
    end_date: dateEnd,
    num_of_people: number,
  } = tripDetails;

  const numOfPeople = NUMBER_OF_PEOPLE.find((i) => i.value === number);

  const dateStartFormatted = format(new Date(dateStart), "PP");
  const dateEndFormatted = format(new Date(dateEnd), "PP");
  const emojiObject = EMOJIS.find((i) => i.value === emoji);

  return (
    <div className="relative flex flex-col justify-between h-52 bg-secondary/30 border-border border-2 rounded-2xl p-5 hover:bg-secondary/50 transition-all">
      <Link
        className="absolute inset-0 z-10"
        href={`/trips/itinerary?id=${id}`}
      />
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2 text-xl font-bold">
          <span>{emojiObject?.emoji ?? "🧛‍♀️"}</span>
          <h2 className="truncate">{name}</h2>
        </div>

        <div className="flex space-x-2">
          <Badge variant="outline" className="text-xs space-x-2 truncate">
            📍 {address}
          </Badge>
          <Badge variant="outline" className="text-xs space-x-2 truncate">
            {numOfPeople
              ? numOfPeople.display!.split("(").shift()
              : "👽 Maybe solo?"}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <p className="text-xs truncate font-semibold text-muted-foreground">
          📆 {dateStartFormatted} to {dateEndFormatted}
        </p>
        <Link
          href={`/trips/itinerary?id=${id}`}
          className={buttonVariants({
            size: "lg",
            variant: "secondary",
          })}
          style={{ zIndex: "20" }}
        >
          Open Itinerary
        </Link>
      </div>
    </div>
  );
};

export default TripCard;
