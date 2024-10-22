import { useTripsContext } from "@/app/_context/AppContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  EMOJIS,
  EmojiValue,
  NUMBER_OF_PEOPLE,
  NumberOfPeopleValue,
} from "@/validators/options";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

export const AddTripForm = ({ className }: { className: string }) => {
  const {
    startDate,
    setStartDate,
    setEndDate,
    endDate,

    isAddingTrip,
    isAddingLakbaiTrip,

    itineraryDetails,
    setItineraryDetails,
  } = useTripsContext();

  return (
    <div className={cn("grid items-start gap-4", className)}>
      <div className="grid w-full items-center gap-4">
        <div className="flex space-x-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="emoji">Emoji</Label>
            <Select
              disabled={isAddingTrip}
              defaultValue={itineraryDetails.emoji}
              onValueChange={(value: EmojiValue) =>
                setItineraryDetails((prev) => {
                  return { ...prev, emoji: value };
                })
              }
            >
              <SelectTrigger id="emoji">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent position="popper">
                {EMOJIS.map(({ value, emoji }, index) => (
                  <SelectItem key={index} value={value}>
                    {emoji}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5 w-full">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              disabled={isAddingTrip}
              id="name"
              maxLength={25}
              placeholder="Trip description"
              onChange={(e) =>
                setItineraryDetails((prev) => {
                  return { ...prev, name: e.target.value };
                })
              }
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="destination">Destination</Label>
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
            selectProps={{
              isDisabled: isAddingTrip,
              onChange: (value) =>
                setItineraryDetails((prev) => {
                  return { ...prev, address: value!.label };
                }),
            }}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="dateStart">Date Start</Label>

          <Popover>
            <PopoverTrigger disabled={isAddingTrip} id="dateStart" asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(value) => {
                  if (value) {
                    setStartDate(value);
                    setItineraryDetails((prev) => ({
                      ...prev,
                      start_date: value.toLocaleDateString(),
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="dateEnd">Date End</Label>
          <Popover>
            <PopoverTrigger disabled={isAddingTrip} id="dateEnd" asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(value) => {
                  if (value) {
                    setEndDate(value);
                    setItineraryDetails((prev) => ({
                      ...prev,
                      end_date: value.toLocaleDateString(),
                    }));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="number">Number of Travelers</Label>

          <Select
            disabled={isAddingTrip}
            defaultValue={itineraryDetails.num_of_people}
            onValueChange={(value: NumberOfPeopleValue) =>
              setItineraryDetails((prev) => ({
                ...prev,
                num_of_people: value,
              }))
            }
          >
            <SelectTrigger id="number">
              <SelectValue placeholder="Are you travelling alone?" />
            </SelectTrigger>
            <SelectContent position="popper">
              {NUMBER_OF_PEOPLE.map(({ value, display }) => {
                return (
                  <SelectItem key={value} value={value}>
                    {display}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* LakbAI Switch */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-row items-center justify-between bg-accent/50 border rounded-lg p-3">
                <div className="space-y-0.5 p-1">
                  <Label>Generate Trip with LakbAI 🐸</Label>
                  <p className="text-card-foreground/80 text-xs">
                    Let LakbAI create the whole trip for you.
                  </p>
                </div>
                <Switch
                  disabled={isAddingTrip}
                  checked={itineraryDetails.is_created_by_lakbai}
                  onCheckedChange={() =>
                    setItineraryDetails((prev) => ({
                      ...prev,
                      is_created_by_lakbai: !prev.is_created_by_lakbai,
                    }))
                  }
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Note: LakbAI can only generate up to 5 days of itinerary</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
