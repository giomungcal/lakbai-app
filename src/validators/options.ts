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

export type ItineraryDetailsProps = {
  name: string | null;
  address: string | null;
  emoji: string;
  startDate: Date;
  endDate: Date;
  numOfPeople: string;
};
