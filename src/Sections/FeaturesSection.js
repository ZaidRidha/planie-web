// src/components/FeaturesSection.js
import AiIcon from "../Assets/Images/AIRow.png";
import ItineraryIcon from "../Assets/Images/ItenRow.png";
import RecommendationsIcon from "../Assets/Images/PersonalisedRow.png";
import CalendarIcon from "../Assets/Images/CalendarRow.png";
import GroupIcon from "../Assets/Images/GroupRow.png";
import UpdatesIcon from "../Assets/Images/UpdatesRow.png";

export default function FeaturesSection() {
  const features = [
    {
      image: AiIcon,
      title: "AI Intelligence",
      text:
        "Leverage the power of AI to intelligently design personalized experiences, effortlessly planning the perfect itinerary.",
    },
    {
      image: ItineraryIcon,
      title: "Generate itineraries",
      text:
        "Instantly build smart, customized travel plans with AI-powered suggestions tailored to your interests and schedule.",
    },
    {
      image: RecommendationsIcon,
      title: "Personalized Recommendations",
      text:
        "Get curated activity and destination suggestions based on your preferences, location, weather, and budget.",
    },
    {
      image: CalendarIcon,
      title: "Calendar View Planning",
      text:
        "Visually manage your trips and activities with an intuitive calendar layout that makes staying organized effortless.",
    },
    {
      image: GroupIcon,
      title: "Group Planning",
      text:
        "Plan unforgettable trips together. Easily collaborate, share itineraries, and vote on activities with your group in one place.",
    },
    {
      image: UpdatesIcon,
      title: "Real-time Updates",
      text:
        "Stay ahead with live weather forecasts and travel updates that instantly adjust your plans for a seamless journey.",
    },
  ];

  return (
    <div className="w-full py-20 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {features.map(({ image, title, text }) => (
          <div
            key={title}
            className="flex flex-col items-center text-center max-w-xs mx-auto"
          >
            <img
              src={image}
              alt={title}
              className="h-32 w-32 mb-6 object-contain" 
            />
            <h3 className="text-xl font-semibold mb-3">{title}</h3>
            <p className="text-gray-600 text-base leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}