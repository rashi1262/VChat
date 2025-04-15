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
      className={`relative border rounded-md p-4 hover:bg-white cursor-pointer ${bgColor}`}
      onClick={() => setPrompt(prompt)}
    >
      <div className="w-10 h-10 mb-2">
        <img
          src={image}
          alt="Card image"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-gray-500 text-sm">{prompt}</p>
    </div>
  );
};