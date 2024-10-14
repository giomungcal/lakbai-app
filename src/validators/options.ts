export type UserRole = "view" | "edit" | "owner" | "public" | "none";

export type EmojiEntry = {
  value: string;
  emoji: string;
};

export const EMOJIS = [
  { value: "Beach", emoji: "🏖️" },
  { value: "Mountains", emoji: "🏔️" },
  { value: "City", emoji: "🏙️" },
  { value: "Island", emoji: "🏝️" },
  { value: "Camping", emoji: "🏕️" },
  { value: "Cruise", emoji: "🛳️" },
  { value: "Transit", emoji: "🚎" },
  { value: "Theme Park", emoji: "🎢" },
  { value: "Lake", emoji: "🛶" },
  { value: "Desert", emoji: "🏜️" },
] as const;

export type EmojiValue = (typeof EMOJIS)[number]["value"];

// ---------------------------------------

export type NumberOfPeopleEntry = {
  value: string;
  display: string;
};

export const NUMBER_OF_PEOPLE = [
  { value: "1", display: "🙋‍♂️ Solo Traveling (1 person)" },
  { value: "2", display: "👨‍❤️‍👨 With a Partner/Friend (2 people)" },
  { value: "3", display: "👨‍👨‍👧 Family/Friend Group (3-8 people)" },
  { value: "8", display: "🤹‍♀️ Big Group (8 or more)" },
] as const;

export type NumberOfPeopleValue = (typeof NUMBER_OF_PEOPLE)[number]["value"];

// ---------------------------------------

export const MAX_DAYS = 14 as const;

export const HOURS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;
export type HourType = (typeof HOURS)[number];

export const MINUTE = ["00", "15", "30", "45"] as const;
export type MinuteType = (typeof MINUTE)[number];

export const PERIOD = ["AM", "PM"] as const;
export type PeriodType = (typeof PERIOD)[number];
