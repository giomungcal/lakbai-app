import {
  defaultActivityAdd,
  useActivitiesContext,
  useTripsContext,
} from "@/app/_context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  HOURS,
  HourType,
  MINUTE,
  MinuteType,
  PERIOD,
  PeriodType,
} from "@/validators/options";
import { Info, Loader, TriangleAlert } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

interface AddActivitySheet {
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: Dispatch<SetStateAction<boolean>>;
  itineraryId: string | undefined;
  selectedDay: string;
}

const AddActivitySheet = ({
  isAddActivityOpen,
  setIsAddActivityOpen,
  itineraryId,
  selectedDay: day,
}: AddActivitySheet) => {
  const { darkMode } = useTripsContext();
  const {
    activityData,
    setActivityData,
    submitActivity,
    isFormComplete,
    setIsFormComplete,
  } = useActivitiesContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAddActivityOpen) {
      setActivityData(defaultActivityAdd);
      setIsFormComplete(null);
    }
  }, [isAddActivityOpen, setActivityData, setIsFormComplete]);

  async function handleSubmitActivity() {
    setIsSubmitting(true);
    const result = await submitActivity({ itineraryId, day });
    if (!result) {
      setIsSubmitting(false);
      return;
    }

    if (result.length !== 0) {
      setIsAddActivityOpen(false);
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
      <SheetContent className="max-w-[940px]">
        <SheetHeader>
          <SheetTitle>Add activity</SheetTitle>
          <SheetDescription>
            Add details to your activity here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Title</Label>
            <Input
              disabled={isSubmitting}
              id="title"
              className="col-span-3"
              placeholder="Trekking at.."
              value={activityData.name}
              onChange={(e) =>
                setActivityData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Location</Label>
            <div className="col-span-3">
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                selectProps={{
                  isDisabled: isSubmitting,
                  onChange: (value) =>
                    setActivityData((prev) => ({
                      ...prev,
                      address: value!.label,
                    })),
                  styles: {
                    option: (provided) => ({
                      ...provided,
                      color: "black",
                    }),
                    input: (provided) => ({
                      ...provided,
                      color: darkMode ? "white" : "black",
                      fontSize: "0.875rem",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: darkMode ? "white" : "black",
                      fontSize: "0.875rem",
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: darkMode
                        ? "hsl(74 58% 8%)"
                        : "hsl(74 56% 98%)",
                      borderColor: darkMode
                        ? "hsl(197.14 6.09% 22.55%)"
                        : "hsl(220 13% 91%)",
                    }),
                  },
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="col-span-1 text-right">Time</Label>

            <Select
              disabled={isSubmitting}
              defaultValue={activityData.hour}
              onValueChange={(value) =>
                setActivityData((prev) => ({
                  ...prev,
                  hour: value as HourType,
                }))
              }
            >
              <SelectTrigger id="framework">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent className="col-span-1" position="popper">
                {HOURS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              disabled={isSubmitting}
              defaultValue={activityData.minute}
              onValueChange={(value) =>
                setActivityData((prev) => ({
                  ...prev,
                  minute: value as MinuteType,
                }))
              }
            >
              <SelectTrigger id="framework">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent className="col-span-1" position="popper">
                {MINUTE.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              disabled={isSubmitting}
              defaultValue={activityData.period}
              onValueChange={(value) =>
                setActivityData((prev) => ({
                  ...prev,
                  period: value as PeriodType,
                }))
              }
            >
              <SelectTrigger id="framework">
                <SelectValue placeholder="AM" />
              </SelectTrigger>
              <SelectContent className="col-span-1" position="popper">
                {PERIOD.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start  gap-4">
            <Label className="text-right mt-2">Description</Label>
            <Textarea
              disabled={isSubmitting}
              id="description"
              className="col-span-3"
              placeholder="Ride a tricycle to.."
              onChange={(e) =>
                setActivityData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          {isFormComplete === false && (
            <div className="flex text-xs items-center justify-center text-left space-x-2 p-2 rounded-md border-destructive/40 border-2 border-dashed bg-red-200/80 dark:bg-[#500202cc]">
              <div className="flex items-center text-left space-x-2">
                <TriangleAlert
                  width={12}
                  height={12}
                  className="shrink-0 text-foreground"
                />
              </div>
              <p className="text-foreground">Please fill up missing fields.</p>
            </div>
          )}
          <div className="flex text-xs items-center justify-center text-left space-x-2 p-2 rounded-md border-ring border-1 border-dashed bg-secondary/70">
            <div className="flex items-center text-left space-x-2">
              <Info width={12} height={12} className="shrink-0 text-title/70" />
              {/* <span className="text-title/80 font-semibold">Note: </span> */}
            </div>
            <p className="text-title">
              Activities are automatically sorted based on time.
            </p>
          </div>
        </div>
        <SheetFooter>
          <Button disabled={isSubmitting} onClick={handleSubmitActivity}>
            {isSubmitting ? (
              <div className="flex space-x-2 justify-center items-center">
                <Loader width={12} height={12} className="animate-spin" />
                <span>Submitting..</span>
              </div>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddActivitySheet;
