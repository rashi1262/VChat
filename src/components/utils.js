export const cards = [
  {
    prompt: "Solve a debate: is a hot dog a sandwich?",
    image: "/assests/icon1.svg",
  },
  {
    prompt:
      "I'm thinking about moving to a new city. Can you help me plan the move?",
    image: "/assests/icon2.svg",
  },
  {
    prompt: "Can you help me write a bedtime story?",
    image: "/assests/icon3.svg",
  },
  {
    prompt: "Get advice on preparing for a job interview.",
    image: "/assests/icon4.svg",
  },
];
export const Card = ({ prompt, image, bgColor, setPrompt }) => {
  return (
    <div
      className={`relative rounded-xl p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:bg-white cursor-pointer ${bgColor}`}
      onClick={() => setPrompt(prompt)}
    >
      <div className="w-12 h-12 mb-3 flex items-center justify-center bg-white rounded-full shadow-inner mx-auto">
        <img src={image} alt="Card icon" className="w-6 h-6 object-contain" />
      </div>
      <p className="text-center text-gray-700 text-sm font-medium">{prompt}</p>
    </div>
  );
};
