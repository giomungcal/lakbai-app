"use server";

import { NUMBER_OF_PEOPLE } from "@/validators/options";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Database } from "../../../database.types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

type ItineraryDetails = Database["public"]["Tables"]["itineraries"]["Insert"];

export async function geminiItineraryRun(itineraryDetails: ItineraryDetails) {
  const { id, address, num_of_people, days_count } = itineraryDetails;

  const companionType = NUMBER_OF_PEOPLE.find((n) => n.value === num_of_people);

  const prompt = `Generate Travel Plan for Location : ${address}, for ${days_count} Days for ${
    companionType!.display
  }. Suggest itinerary with places: time, day (number), name (make it descriptive), address (make it specific to the location of the name), description, and all with the same itinerary_id: ${id}. Make sure they are relatively near each other, and that they will travel the whole day at least 7 destinations per day for ${days_count} days, do not repeat destinations too. Everything should within one array in JSON format.`;

  const chatSession = model.startChat({
    generationConfig,
    // safetySettings: Adjust safety settings
    // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {
            text: '"Generate Travel Plan for Location : Boracay, for 3 Days for Friends. Suggest itinerary with places: time, day (number), name, address, description, and all with the same itinerary_id: 32323232. Make sure they are relatively near each other, and that they will travel the whole day at least 7 destinations per day for 5 days. Everything should within one array in JSON format, no other response."',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '[\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "8:00 AM",\n    "name": "D\'Mall",\n    "address": "Station 1, Boracay Island",\n    "description": "Start your day with a visit to D\'Mall, the bustling hub of Boracay, filled with shops, restaurants, and bars. Grab breakfast at one of the many cafes or try a local delicacy."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "9:30 AM",\n    "name": "White Beach",\n    "address": "Station 1, Boracay Island",\n    "description": "Head to White Beach, Boracay\'s most famous stretch of sand. Relax, swim, soak up the sun, or try some watersports."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "12:00 PM",\n    "name": "D\'Talipapa",\n    "address": "Station 3, Boracay Island",\n    "description": "Enjoy a delicious and affordable lunch at D\'Talipapa, a bustling seafood market where you can choose your fresh catch and have it cooked to your liking."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "2:00 PM",\n    "name": "Willy\'s Rock",\n    "address": "Station 1, Boracay Island",\n    "description": "Take a short walk to Willy\'s Rock, a popular landmark at the northern end of White Beach, offering picturesque views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "3:00 PM",\n    "name": "Boracay Public Market",\n    "address": "Station 3, Boracay Island",\n    "description": "Explore the Boracay Public Market for souvenirs, local crafts, and fresh produce."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "5:00 PM",\n    "name": "D\'Mall",\n    "address": "Station 1, Boracay Island",\n    "description": "Head back to D\'Mall for some shopping, browsing, and enjoying the lively atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "7:00 PM",\n    "name": "Sunset at White Beach",\n    "address": "Station 1, Boracay Island",\n    "description": "Witness the stunning sunset over the horizon at White Beach, enjoying a romantic dinner or drinks at a beachside restaurant."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 AM",\n    "name": "Bulabog Beach",\n    "address": "Station 3, Boracay Island",\n    "description": "Start your day at Bulabog Beach, known for its strong winds, perfect for windsurfing and kitesurfing. You can also simply relax on the beach and watch the action."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "10:00 AM",\n    "name": "Diniwid Beach",\n    "address": "Station 1, Boracay Island",\n    "description": "Take a short tricycle ride to Diniwid Beach, a secluded and tranquil beach with crystal-clear waters, perfect for snorkeling and swimming."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "12:00 PM",\n    "name": "The Lind Boracay",\n    "address": "Station 1, Boracay Island",\n    "description": "Enjoy a delicious lunch at the beachfront restaurant of The Lind Boracay, with stunning views of the ocean."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "2:00 PM",\n    "name": "Puka Beach",\n    "address": "Station 1, Boracay Island",\n    "description": "Explore Puka Beach, famous for its unique white seashells. It\'s a great place to relax, swim, and enjoy the scenic views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "4:00 PM",\n    "name": "Boracay Ecovillage",\n    "address": "Station 3, Boracay Island",\n    "description": "Visit the Boracay Ecovillage, a sustainable community promoting environmental awareness and eco-friendly living. Learn about their initiatives and enjoy the peaceful atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "6:00 PM",\n    "name": "Ariel\'s Point",\n    "address": "Station 3, Boracay Island",\n    "description": "Experience the thrill of cliff diving at Ariel\'s Point, a breathtaking location with multiple platforms for jumping into the turquoise waters. Enjoy the panoramic views and the exhilarating experience."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 PM",\n    "name": "Station 3",\n    "address": "Station 3, Boracay Island",\n    "description": "Enjoy dinner at one of the many restaurants in Station 3, savoring delicious seafood and enjoying the vibrant nightlife."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "9:00 AM",\n    "name": "Boracay Island Tour",\n    "address": "Station 1, Boracay Island",\n    "description": "Embark on a guided island tour, visiting the iconic landmarks of Boracay, such as the Church of the Holy Rosary, the Japanese Tunnel, and the Old Lighthouse."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "12:00 PM",\n    "name": "Shangri-La Boracay",\n    "address": "Station 1, Boracay Island",\n    "description": "Enjoy a delicious lunch at Shangri-La Boracay, a luxurious resort with a variety of dining options and breathtaking ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "2:00 PM",\n    "name": "Manoc-Manoc Island",\n    "address": "Station 1, Boracay Island",\n    "description": "Take a boat trip to Manoc-Manoc Island, a small island with stunning beaches, clear waters, and a relaxed atmosphere. Enjoy swimming, snorkeling, and picnicking."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "5:00 PM",\n    "name": "D\'Mall",\n    "address": "Station 1, Boracay Island",\n    "description": "Spend the evening exploring D\'Mall, enjoying some last-minute shopping, trying local street food, and savoring the lively atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "7:00 PM",\n    "name": "Paradise Garden",\n    "address": "Station 3, Boracay Island",\n    "description": "Indulge in a delicious dinner at Paradise Garden, a well-known restaurant offering a variety of cuisines and breathtaking views of the ocean."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "9:00 PM",\n    "name": "Station 1",\n    "address": "Station 1, Boracay Island",\n    "description": "Enjoy a relaxing evening stroll along Station 1, taking in the sights, sounds, and vibrant atmosphere of Boracay\'s nightlife."\n  }\n]',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Generate Travel Plan for Location : Boracay, for 3 Days for Friends. Suggest itinerary with places: time, day (number), name (make it descriptive), address (make it as specific as if searching the address in google maps will point me there exactly), description, and all with the same itinerary_id: 32323232. Make sure they are relatively near each other, and that they will travel the whole day at least 7 destinations per day for 5 days, do not repeat destinations too. Everything should within one array in JSON format.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '[\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "8:00 AM",\n    "name": "Breakfast at The Sunny Side Cafe",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Start your day with a delicious breakfast at The Sunny Side Cafe, known for its fresh and flavorful dishes, perfect for fueling up for a day of exploration."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "9:30 AM",\n    "name": "White Beach Stroll & Relaxation",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Take a relaxing stroll along the famous White Beach, enjoying the soft white sand, turquoise waters, and the vibrant atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "11:00 AM",\n    "name": "Island Hopping Adventure to Crystal Cove Island",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Embark on an exciting island hopping adventure to Crystal Cove Island, known for its pristine beaches, clear waters, and stunning coral reefs, perfect for snorkeling and swimming."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "1:00 PM",\n    "name": "Lunch at The Halong Restaurant",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Halong Restaurant, offering a wide variety of Filipino and international cuisines with stunning ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "2:30 PM",\n    "name": "Exploring D\'Mall",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Dive into the vibrant atmosphere of D\'Mall, browsing through shops, cafes, and souvenir stalls, finding unique treasures and local delicacies."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "4:00 PM",\n    "name": "Sunset at D\'Mall",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Witness the breathtaking sunset over the horizon from D\'Mall, enjoying the romantic atmosphere and colorful sky."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "6:00 PM",\n    "name": "Dinner at The Bamboo House",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a delicious dinner at The Bamboo House, a popular restaurant known for its fresh seafood and cozy ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 AM",\n    "name": "Sunrise Yoga at Bulabog Beach",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Start your day with a revitalizing sunrise yoga session at Bulabog Beach, enjoying the peaceful atmosphere and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "10:00 AM",\n    "name": "Exploring the Japanese Tunnel",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Step back in time and discover the historical Japanese Tunnel, a fascinating remnant of World War II, offering a glimpse into the past."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "12:00 PM",\n    "name": "Lunch at The Real Coffee & Tea Cafe",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Real Coffee & Tea Cafe, known for its aromatic coffee, fresh sandwiches, and delectable desserts."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "2:00 PM",\n    "name": "Relaxation at Diniwid Beach",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Escape to the secluded and tranquil Diniwid Beach, known for its pristine white sand, crystal-clear waters, and peaceful atmosphere, perfect for swimming and sunbathing."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "4:00 PM",\n    "name": "Sunset Cruise along the Coast",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Embark on a romantic sunset cruise along the stunning coastline of Boracay, enjoying the picturesque views and gentle sea breeze."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "6:00 PM",\n    "name": "Dinner at The  Talipapa Seafood Market",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Experience the lively atmosphere of The Talipapa Seafood Market, selecting fresh seafood and having it cooked to perfection, a true culinary adventure."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 PM",\n    "name": "Live Music at The  Lime & Basil",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a lively evening with live music at The  Lime & Basil, a popular bar known for its vibrant atmosphere and talented musicians."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "9:00 AM",\n    "name": "Exploring the Boracay Ecovillage",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Visit the Boracay Ecovillage, a sustainable community promoting environmental awareness and eco-friendly living, learning about their initiatives and enjoying the peaceful atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "11:00 AM",\n    "name": "Island Hopping to  Puka Beach",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Embark on another island hopping adventure to Puka Beach, known for its unique white seashells, serene atmosphere, and stunning views, perfect for swimming and snorkeling."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "1:00 PM",\n    "name": "Lunch at  The  Kawayan Restaurant",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The  Kawayan Restaurant, known for its authentic Filipino cuisine,  fresh ingredients, and beautiful ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "2:30 PM",\n    "name": "Relaxing at The  Shangri-La Boracay",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Indulge in relaxation at The  Shangri-La Boracay, enjoying the luxurious amenities, pristine beach, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "4:00 PM",\n    "name": "Sunset at Willy\'s Rock",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Experience a breathtaking sunset from the iconic Willy\'s Rock, a popular landmark at the northern end of White Beach, offering stunning views and a memorable photo opportunity."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "6:00 PM",\n    "name": "Dinner at  The  7 Stones",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a memorable dinner at  The  7 Stones, a beachfront restaurant known for its exquisite cuisine, romantic ambiance, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "8:00 PM",\n    "name": "Final Night at Station 1",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a final night in the lively atmosphere of Station 1, browsing through shops, enjoying live music, and reminiscing about your memorable trip."\n  }\n]\n',
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Generate Travel Plan for Location : Boracay, for 3 Days for Friends. Suggest itinerary with places: time, day (number), name (make it descriptive), address (make it specific to the location of the name), description, and all with the same itinerary_id: 32323232. Make sure they are relatively near each other, and that they will travel the whole day at least 7 destinations per day for 5 days, do not repeat destinations too. Everything should within one array in JSON format.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: '[\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "8:00 AM",\n    "name": "Sunrise Yoga at D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Start your day with a refreshing sunrise yoga session at D\'Mall, enjoying the peaceful atmosphere and stunning views of the beach."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "9:30 AM",\n    "name": "Breakfast at The Sunny Side Cafe",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Fuel up for the day with a delicious breakfast at The Sunny Side Cafe, known for its fresh and flavorful dishes, perfect for starting your adventure."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "11:00 AM",\n    "name": "White Beach Relaxation",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Spend some time relaxing on the world-famous White Beach, soaking up the sun, swimming in the crystal-clear waters, and enjoying the vibrant atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "1:00 PM",\n    "name": "Lunch at The Halong Restaurant",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Halong Restaurant, offering a wide variety of Filipino and international cuisines with stunning ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "2:30 PM",\n    "name": "Exploring D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Dive into the vibrant atmosphere of D\'Mall, browsing through shops, cafes, and souvenir stalls, finding unique treasures and local delicacies."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "4:00 PM",\n    "name": "Island Hopping to Crystal Cove Island",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Embark on an exciting island hopping adventure to Crystal Cove Island, known for its pristine beaches, clear waters, and stunning coral reefs, perfect for snorkeling and swimming."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "6:00 PM",\n    "name": "Dinner at The Bamboo House",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a delicious dinner at The Bamboo House, a popular restaurant known for its fresh seafood and cozy ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 AM",\n    "name": "Breakfast at The Real Coffee & Tea Cafe",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Start your day with a delicious breakfast at The Real Coffee & Tea Cafe, known for its aromatic coffee, fresh sandwiches, and delectable desserts."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "9:30 AM",\n    "name": "Exploring the Japanese Tunnel",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Step back in time and discover the historical Japanese Tunnel, a fascinating remnant of World War II, offering a glimpse into the past."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "11:00 AM",\n    "name": "Relaxation at Diniwid Beach",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Escape to the secluded and tranquil Diniwid Beach, known for its pristine white sand, crystal-clear waters, and peaceful atmosphere, perfect for swimming and sunbathing."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "1:00 PM",\n    "name": "Lunch at The Kawayan Restaurant",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Kawayan Restaurant, known for its authentic Filipino cuisine,  fresh ingredients, and beautiful ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "2:30 PM",\n    "name": "Exploring the Boracay Ecovillage",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Visit the Boracay Ecovillage, a sustainable community promoting environmental awareness and eco-friendly living, learning about their initiatives and enjoying the peaceful atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "4:00 PM",\n    "name": "Sunset Cruise along the Coast",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Embark on a romantic sunset cruise along the stunning coastline of Boracay, enjoying the picturesque views and gentle sea breeze."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "6:00 PM",\n    "name": "Dinner at The  Talipapa Seafood Market",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Experience the lively atmosphere of The Talipapa Seafood Market, selecting fresh seafood and having it cooked to perfection, a true culinary adventure."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "8:00 AM",\n    "name": "Sunrise at Willy\'s Rock",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Witness a breathtaking sunrise from the iconic Willy\'s Rock, a popular landmark at the northern end of White Beach, offering stunning views and a memorable photo opportunity."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "9:30 AM",\n    "name": "Breakfast at Shangri-La Boracay",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious breakfast at Shangri-La Boracay, a luxurious resort with a variety of dining options and breathtaking ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "11:00 AM",\n    "name": "Island Hopping to Puka Beach",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Embark on another island hopping adventure to Puka Beach, known for its unique white seashells, serene atmosphere, and stunning views, perfect for swimming and snorkeling."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "1:00 PM",\n    "name": "Lunch at  The  7 Stones",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a memorable lunch at  The  7 Stones, a beachfront restaurant known for its exquisite cuisine, romantic ambiance, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "2:30 PM",\n    "name": "Relaxing at The  Shangri-La Boracay",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Indulge in relaxation at The  Shangri-La Boracay, enjoying the luxurious amenities, pristine beach, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "4:00 PM",\n    "name": "Sunset at  D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Witness a breathtaking sunset from D\'Mall, enjoying the romantic atmosphere and colorful sky."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "6:00 PM",\n    "name": "Dinner at  The  Lime & Basil",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a final delicious dinner at  The  Lime & Basil, a popular bar known for its vibrant atmosphere and talented musicians."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "8:00 PM",\n    "name": "Final Night at Station 1",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a final night in the lively atmosphere of Station 1, browsing through shops, enjoying live music, and reminiscing about your memorable trip."\n  }\n]\n',
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "the address is not exact yet?\n" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "You are absolutely right!  I apologize for the inaccurate addresses. I am still under development and learning to provide the most accurate information.  \n\nI will try my best to give you more specific addresses. Can you please tell me:\n\n1. **Which specific area of D'Mall** are you interested in (e.g., the entrance near the beach, the center of the mall, the area near a particular shop)? \n2. **For the restaurants** (e.g., The Sunny Side Cafe, The Halong Restaurant, The Bamboo House), do you want the address of a specific branch or the main location?\n\nOnce I have this information, I can generate a more accurate itinerary with specific addresses. \n",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: 'say for example, The Sunny Side Cafe should have an address of "The Sunny Side Cafe Station 1, Boracay" so that if i put this into google maps, it directs me to that exact location, you\'re giving me more generic addresses\n',
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: 'You are absolutely right, I need to be more specific! I will try my best to provide accurate addresses that work in Google Maps. \n\nHere\'s the revised itinerary with more specific addresses:\n\n```json\n[\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "8:00 AM",\n    "name": "Sunrise Yoga at D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Start your day with a refreshing sunrise yoga session at D\'Mall, enjoying the peaceful atmosphere and stunning views of the beach."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "9:30 AM",\n    "name": "Breakfast at The Sunny Side Cafe",\n    "address": "The Sunny Side Cafe, Station 1, Malay, Aklan, Philippines",\n    "description": "Fuel up for the day with a delicious breakfast at The Sunny Side Cafe, known for its fresh and flavorful dishes, perfect for starting your adventure."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "11:00 AM",\n    "name": "White Beach Relaxation",\n    "address": "White Beach, Station 1, Malay, Aklan, Philippines",\n    "description": "Spend some time relaxing on the world-famous White Beach, soaking up the sun, swimming in the crystal-clear waters, and enjoying the vibrant atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "1:00 PM",\n    "name": "Lunch at The Halong Restaurant",\n    "address": "The Halong Restaurant, Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Halong Restaurant, offering a wide variety of Filipino and international cuisines with stunning ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "2:30 PM",\n    "name": "Exploring D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Dive into the vibrant atmosphere of D\'Mall, browsing through shops, cafes, and souvenir stalls, finding unique treasures and local delicacies."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "4:00 PM",\n    "name": "Island Hopping to Crystal Cove Island",\n    "address": "Station 3, Malay, Aklan, Philippines",\n    "description": "Embark on an exciting island hopping adventure to Crystal Cove Island, known for its pristine beaches, clear waters, and stunning coral reefs, perfect for snorkeling and swimming."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 1,\n    "time": "6:00 PM",\n    "name": "Dinner at The Bamboo House",\n    "address": "The Bamboo House, Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a delicious dinner at The Bamboo House, a popular restaurant known for its fresh seafood and cozy ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "8:00 AM",\n    "name": "Breakfast at The Real Coffee & Tea Cafe",\n    "address": "The Real Coffee & Tea Cafe, Station 3, Malay, Aklan, Philippines",\n    "description": "Start your day with a delicious breakfast at The Real Coffee & Tea Cafe, known for its aromatic coffee, fresh sandwiches, and delectable desserts."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "9:30 AM",\n    "name": "Exploring the Japanese Tunnel",\n    "address": "Japanese Tunnel, Station 3, Malay, Aklan, Philippines",\n    "description": "Step back in time and discover the historical Japanese Tunnel, a fascinating remnant of World War II, offering a glimpse into the past."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "11:00 AM",\n    "name": "Relaxation at Diniwid Beach",\n    "address": "Diniwid Beach, Station 1, Malay, Aklan, Philippines",\n    "description": "Escape to the secluded and tranquil Diniwid Beach, known for its pristine white sand, crystal-clear waters, and peaceful atmosphere, perfect for swimming and sunbathing."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "1:00 PM",\n    "name": "Lunch at The Kawayan Restaurant",\n    "address": "The Kawayan Restaurant, Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious lunch at The Kawayan Restaurant, known for its authentic Filipino cuisine,  fresh ingredients, and beautiful ambiance."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "2:30 PM",\n    "name": "Exploring the Boracay Ecovillage",\n    "address": "Boracay Ecovillage, Station 3, Malay, Aklan, Philippines",\n    "description": "Visit the Boracay Ecovillage, a sustainable community promoting environmental awareness and eco-friendly living, learning about their initiatives and enjoying the peaceful atmosphere."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "4:00 PM",\n    "name": "Sunset Cruise along the Coast",\n    "address": "Station 1, Malay, Aklan, Philippines (Boat Tours Depart From Various Locations)",\n    "description": "Embark on a romantic sunset cruise along the stunning coastline of Boracay, enjoying the picturesque views and gentle sea breeze."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 2,\n    "time": "6:00 PM",\n    "name": "Dinner at The  Talipapa Seafood Market",\n    "address": "The Talipapa Seafood Market, Station 3, Malay, Aklan, Philippines",\n    "description": "Experience the lively atmosphere of The Talipapa Seafood Market, selecting fresh seafood and having it cooked to perfection, a true culinary adventure."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "8:00 AM",\n    "name": "Sunrise at Willy\'s Rock",\n    "address": "Willy\'s Rock, Station 1, Malay, Aklan, Philippines",\n    "description": "Witness a breathtaking sunrise from the iconic Willy\'s Rock, a popular landmark at the northern end of White Beach, offering stunning views and a memorable photo opportunity."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "9:30 AM",\n    "name": "Breakfast at Shangri-La Boracay",\n    "address": "Shangri-La Boracay, Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a delicious breakfast at Shangri-La Boracay, a luxurious resort with a variety of dining options and breathtaking ocean views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "11:00 AM",\n    "name": "Island Hopping to Puka Beach",\n    "address": "Puka Beach, Station 1, Malay, Aklan, Philippines",\n    "description": "Embark on another island hopping adventure to Puka Beach, known for its unique white seashells, serene atmosphere, and stunning views, perfect for swimming and snorkeling."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "1:00 PM",\n    "name": "Lunch at  The  7 Stones",\n    "address": "The 7 Stones, Station 1, Malay, Aklan, Philippines",\n    "description": "Savor a memorable lunch at  The  7 Stones, a beachfront restaurant known for its exquisite cuisine, romantic ambiance, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "2:30 PM",\n    "name": "Relaxing at The  Shangri-La Boracay",\n    "address": "Shangri-La Boracay, Station 1, Malay, Aklan, Philippines",\n    "description": "Indulge in relaxation at The  Shangri-La Boracay, enjoying the luxurious amenities, pristine beach, and stunning views."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "4:00 PM",\n    "name": "Sunset at  D\'Mall",\n    "address": "D\'Mall, Station 1, Malay, Aklan, Philippines",\n    "description": "Witness a breathtaking sunset from D\'Mall, enjoying the romantic atmosphere and colorful sky."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "6:00 PM",\n    "name": "Dinner at  The  Lime & Basil",\n    "address": "The Lime & Basil, Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a final delicious dinner at  The  Lime & Basil, a popular bar known for its vibrant atmosphere and talented musicians."\n  },\n  {\n    "itinerary_id": 32323232,\n    "day": 3,\n    "time": "8:00 PM",\n    "name": "Final Night at Station 1",\n    "address": "Station 1, Malay, Aklan, Philippines",\n    "description": "Enjoy a final night in the lively atmosphere of Station 1, browsing through shops, enjoying live music, and reminiscing about your memorable trip."\n  }\n]\n```\n\nI am continually learning and improving! Please let me know if you have any further requests or if you would like more specific addresses for other locations in your itinerary. \n',
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(prompt);

  const data = result.response.text();
  const parsedData = JSON.parse(data);

  return parsedData;
}
