import { Gavel, FileText, CheckSquare, Receipt } from "lucide-react";
import GravityCards from "./GravityCards";
import FloatingCard from "./FloatingCard";
import ThemeToggle from "./ThemeToggle";

// Static, non-physics fallback shown on small screens where a full
// matter-js simulation would be wasted CPU / risk overflow.
const MOBILE_CARDS = [
  {
    color: "billing" as const,
    label: "Billing",
    rotation: -4,
    icon: <Receipt size={18} strokeWidth={2.25} />,
  },
  {
    color: "matters" as const,
    label: "Matters",
    rotation: 3,
    icon: <Gavel size={18} strokeWidth={2.25} />,
  },
  {
    color: "dark" as const,
    label: "Tasks",
    rotation: -2,
    icon: <CheckSquare size={18} strokeWidth={2.25} />,
  },
  {
    color: "dark" as const,
    label: "Documents",
    rotation: 4,
    icon: <FileText size={18} strokeWidth={2.25} />,
  },
];

export default function Hero() {
  return (
    <main className="relative w-full bg-canvas transition-colors duration-500 dark:bg-canvasDark md:h-screen md:overflow-hidden">
      {/* Added: dark/light mode toggle, purely additive, doesn't affect any existing element */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 md:right-10 md:top-8">
        <ThemeToggle />
      </div>

      {/* Decorative blurred/rounded background shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-[54%] h-16 w-72 rounded-full bg-blob animate-blobFloat dark:bg-blobDark" />
        <div className="absolute -left-4 bottom-0 h-28 w-[440px] rounded-[64px] bg-blob animate-blobFloat [animation-delay:-2.4s] dark:bg-blobDark" />
        <div className="absolute -right-16 top-6 h-32 w-[440px] rounded-[70px] bg-blob animate-blobFloat [animation-delay:-4.6s] dark:bg-blobDark" />
        <div className="absolute -right-10 top-[40%] h-24 w-[380px] rounded-[60px] bg-blob animate-blobFloat [animation-delay:-1.2s] dark:bg-blobDark" />
        <div className="absolute -right-6 bottom-[-30px] h-24 w-24 rounded-full bg-blob animate-blobFloat [animation-delay:-3.4s] dark:bg-blobDark" />
      </div>
{/* 
      <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col items-center gap-10 px-6 py-14 sm:px-10 md:flex-row md:items-center md:gap-6 md:px-16 md:py-0"> */}
<div className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] flex-col items-center gap-8 px-5 py-12 sm:px-10 md:flex-row md:items-center md:gap-6 md:px-16 md:py-0">

        {/* Left: headline + copy */}
        <div className="w-full animate-fadeUp md:w-[46%]">
          <h1 className="text-[2.1rem] font-normal leading-[1.1] text-headline transition-colors duration-500 dark:text-headlineDark sm:text-[2.6rem] md:text-[3.15rem] lg:text-[3.4rem]">
            A single platform to{" "}
            <span className="font-bold text-headlineStrong transition-colors duration-500 dark:text-headlineStrongDark">manage</span>{" "}
            every part of your{" "}
            <span className="font-bold text-headlineStrong transition-colors duration-500 dark:text-headlineStrongDark">legal work</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-body transition-colors duration-500 dark:text-bodyDark sm:text-lg">
            Track matters, coordinate schedules, manage clients, centralize
            documents, and handle communication – all in one system.
          </p>
        </div>

        {/* Right: floating-card visualization */}
        {/* <div className="relative h-[360px] w-full sm:h-[440px] md:h-[560px] md:w-[54%]"> */}


        <div className="relative h-auto w-full sm:h-[440px] md:h-[560px] md:w-[54%]">
          {/* Desktop / tablet: physics-driven rain of cards */}
          <div className="hidden h-full w-full sm:block">
            <GravityCards />
          </div>

          {/* Mobile: simplified static stack, no physics */}
          <div className="flex flex-col items-center justify-center gap-3 py-2 sm:hidden">
            {MOBILE_CARDS.map((card, i) => (
              <div
                key={card.label}
                // className="w-full max-w-xs animate-gentleFloat"


                className="w-full max-w-[320px] animate-gentleFloat"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <FloatingCard
                  color={card.color}
                  label={card.label}
                  icon={card.icon}
                  rotation={card.rotation}
                  className="w-full animate-fadeUp"
                />
              </div>
            ))}
            <div className="w-full max-w-[320px] animate-gentleFloat" 
            style={{ animationDelay: "1.6s" }}>
              <FloatingCard
                color="portal"
                variant="portal"
                label="John Doe - Portal"
                message="Hey! Could you please review a document for me?"
                meta="MAT-2233 - 2h ago"
                rotation={-1}
                className="w-full animate-fadeUp"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
