"use client";

import { useEffect, useRef, useState } from "react";
import { Gavel, FileText, CheckSquare, Receipt } from "lucide-react";
import Gravity, { MatterBody, useGravity } from "./Gravity";
import FloatingCard, { FloatingCardColor, FloatingCardVariant } from "./FloatingCard";

interface CardConfig {
  id: string;
  label: string;
  color: FloatingCardColor;
  variant?: FloatingCardVariant;
  message?: string;
  meta?: string;
  icon?: React.ReactNode;
  width: number;
  height: number;
  angle: number;
  /** Horizontal spawn position as a fraction (0-1) of the container width. */
  xFraction: number;
  restitution: number;
  friction: number;
  density: number;
}

const CARD_CONFIGS: CardConfig[] = [
  {
    id: "billing",
    label: "Billing",
    color: "billing",
    icon: <Receipt size={18} strokeWidth={2.25} />,
    width: 230,
    height: 76,
    angle: -10,
    xFraction: 0.64,
    restitution: 0.55,
    friction: 0.15,
    density: 0.0015,
  },
  {
    id: "matters",
    label: "Matters",
    color: "matters",
    icon: <Gavel size={18} strokeWidth={2.25} />,
    width: 220,
    height: 96,
    angle: -14,
    xFraction: 0.2,
    restitution: 0.5,
    friction: 0.16,
    density: 0.0017,
  },
  {
    id: "tasks",
    label: "Tasks",
    color: "dark",
    icon: <CheckSquare size={18} strokeWidth={2.25} />,
    width: 208,
    height: 76,
    angle: -3,
    xFraction: 0.42,
    restitution: 0.52,
    friction: 0.15,
    density: 0.0016,
  },
  {
    id: "documents",
    label: "Documents",
    color: "dark",
    icon: <FileText size={18} strokeWidth={2.25} />,
    width: 228,
    height: 78,
    angle: 7,
    xFraction: 0.82,
    restitution: 0.52,
    friction: 0.15,
    density: 0.0016,
  },
  {
    id: "portal",
    label: "John Doe - Portal",
    color: "portal",
    variant: "portal",
    message: "Hey! Could you please review a document for me?",
    meta: "MAT-2233 - 2h ago",
    width: 270,
    height: 104,
    angle: -3,
    xFraction: 0.5,
    restitution: 0.42,
    friction: 0.22,
    density: 0.002,
  },
];

const SPAWN_STAGGER_MS = 380;
const HOLD_AFTER_SPAWN_MS = 6000; // time to fall + settle + sit in the pile
const FADE_MS = 500;

/** Lives inside <Gravity>, so it can read the container size and manage
 *  the spawn / settle / reset loop that makes cards continuously "rain"
 *  in and pile up, then restart. Dragging a card (see `postponeRef`)
 *  pushes the reset further out so the loop never yanks a card away
 *  mid-interaction. */
function CardRain({
  postponeRef,
}: {
  postponeRef: React.MutableRefObject<() => void>;
}) {
  const { containerRef } = useGravity();
  const [containerWidth, setContainerWidth] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [visibleIds, setVisibleIds] = useState<string[]>([]);
  const [fading, setFading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const endTimersRef = useRef<{ fade: ReturnType<typeof setTimeout> | null; reset: ReturnType<typeof setTimeout> | null }>(
    { fade: null, reset: null }
  );

  // Track container size so spawn x-positions stay proportional.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  // Schedules (or re-schedules) the fade + reset that ends this cycle,
  // HOLD_AFTER_SPAWN_MS from whenever it's called. Re-calling this (e.g.
  // from a drag interaction) pushes the reset further into the future
  // instead of interrupting whatever the user is doing.
  const scheduleEnd = () => {
    if (fading) return; // already mid fade-out, let it finish
    if (endTimersRef.current.fade) clearTimeout(endTimersRef.current.fade);
    if (endTimersRef.current.reset) clearTimeout(endTimersRef.current.reset);

    const fade = setTimeout(() => setFading(true), HOLD_AFTER_SPAWN_MS);
    const reset = setTimeout(
      () => setCycle((c) => c + 1),
      HOLD_AFTER_SPAWN_MS + FADE_MS
    );
    endTimersRef.current = { fade, reset };
    timers.current.push(fade, reset);
  };

  // Spawn -> settle -> fade -> reset loop.
  useEffect(() => {
    if (!containerWidth) return;

    timers.current.forEach(clearTimeout);
    timers.current = [];
    setVisibleIds([]);
    setFading(false);

    CARD_CONFIGS.forEach((card, i) => {
      const t = setTimeout(() => {
        setVisibleIds((prev) => [...prev, card.id]);
      }, i * SPAWN_STAGGER_MS + Math.random() * 180);
      timers.current.push(t);
    });

    const totalSpawnTime = CARD_CONFIGS.length * SPAWN_STAGGER_MS;
    const initialEnd = setTimeout(scheduleEnd, totalSpawnTime);
    timers.current.push(initialEnd);

    return () => timers.current.forEach(clearTimeout);
    // Re-run every cycle to restart the falling sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerWidth, cycle]);

  // Let the parent <Gravity> tell us to push the reset back whenever the
  // user actively interacts (grabs/drags a card).
  useEffect(() => {
    postponeRef.current = scheduleEnd;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  if (!containerWidth) return null;

  return (
    <div
      className="absolute inset-0 transition-opacity ease-in-out"
      style={{ transitionDuration: `${FADE_MS}ms`, opacity: fading ? 0 : 1 }}
    >
      {CARD_CONFIGS.map((card) => {
        if (!visibleIds.includes(card.id)) return null;
        return (
          <MatterBody
            key={`${card.id}-${cycle}`}
            x={card.xFraction * containerWidth}
         y={100}
         
            width={card.width}
            height={card.height}
            angle={card.angle}
            matterBodyOptions={{
              restitution: card.restitution,
              friction: card.friction,
              density: card.density,
            }}
          >
            <FloatingCard
              color={card.color}
              variant={card.variant}
              icon={card.icon}
              label={card.label}
              message={card.message}
              meta={card.meta}
              rotation={0}
              className="h-full w-full"
            />
          </MatterBody>
        );
      })}
    </div>
  );
}

/**
 * Physics-driven "rain" of floating cards. Wraps the Gravity engine and
 * a static floor/walls so cards fall from the top of the visualization,
 * collide, and pile up naturally, then reset and repeat.
 */
export default function GravityCards() {
  const postponeRef = useRef<() => void>(() => {});

  return (
    <Gravity
      className="h-full w-full"
      gravity={{ x: 0, y: 1 }}
      addTopWall
      grabCursor
      onInteract={() => postponeRef.current()}
    >
      <CardRain postponeRef={postponeRef} />
    </Gravity>
  );
}

export { CARD_CONFIGS };
