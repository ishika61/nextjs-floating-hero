"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import Matter from "matter-js";

/* -------------------------------------------------------------------- */
/*  Gravity: sets up a Matter.js engine + runner scoped to a container   */
/*  div, keeps static floor/wall/(top wall) bodies in sync with its      */
/*  size, and wires up a MouseConstraint so bodies can be dragged and    */
/*  thrown with the pointer — mirroring fancy-components.dev's Gravity   */
/*  / MatterBody API (https://fancycomponents.dev).                      */
/*                                                                        */
/*  MatterBody: registers a rigid body inside that engine and mirrors    */
/*  its live position/rotation onto a plain DOM element every frame.     */
/* -------------------------------------------------------------------- */

interface GravityContextValue {
  engine: React.MutableRefObject<Matter.Engine | null>;
  containerRef: React.RefObject<HTMLDivElement>;
}

const GravityContext = createContext<GravityContextValue | null>(null);

export function useGravity() {
  const ctx = useContext(GravityContext);
  if (!ctx) {
    throw new Error("MatterBody must be rendered inside a <Gravity> container");
  }
  return ctx;
}

export interface GravityProps {
  children: ReactNode;
  className?: string;
  /** Engine gravity vector. y > 0 pulls bodies downward. */
  gravity?: { x: number; y: number };
  /** Adds a static wall along the top edge so thrown bodies bounce back
   *  down instead of leaving the container. Defaults to true. */
  addTopWall?: boolean;
  /** Shows a grab / grabbing cursor while hovering / dragging bodies. */
  grabCursor?: boolean;
  /** Called on pointer-down inside the container — handy for pausing an
   *  automatic animation cycle while the user is actively playing with
   *  the bodies. */
  onInteract?: () => void;
}

export default function Gravity({
  children,
  className = "",
  gravity = { x: 0, y: 1 },
  addTopWall = true,
  grabCursor = true,
  onInteract,
}: GravityProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wallsRef = useRef<Matter.Body[]>([]);

  // Create the physics world once.
  useEffect(() => {
    const engine = Matter.Engine.create();
    engine.gravity.x = gravity.x;
    engine.gravity.y = gravity.y;
    engineRef.current = engine;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Static floor + side walls (+ optional top wall), rebuilt whenever the
  // container resizes so cards always collide with the edges of the
  // visualization, never the edges of the viewport.
  useEffect(() => {
    const engine = engineRef.current;
    const el = containerRef.current;
    if (!engine || !el) return;

    const THICKNESS = 100;

    const buildWalls = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      if (wallsRef.current.length) {
        Matter.World.remove(engine.world, wallsRef.current);
      }

      const bodies = [
        // floor
        Matter.Bodies.rectangle(
          width / 2,
          height + THICKNESS / 2 - 4,
          width * 2,
          THICKNESS,
          { isStatic: true, friction: 0.6, label: "floor" }
        ),
        // left wall
        Matter.Bodies.rectangle(-THICKNESS / 2, height / 2, THICKNESS, height * 3, {
          isStatic: true,
          label: "wall-left",
        }),
        // right wall
        Matter.Bodies.rectangle(
          width + THICKNESS / 2,
          height / 2,
          THICKNESS,
          height * 3,
          { isStatic: true, label: "wall-right" }
        ),
      ];

      if (addTopWall) {
        bodies.push(
          Matter.Bodies.rectangle(width / 2, -THICKNESS / 2, width * 2, THICKNESS, {
            isStatic: true,
            label: "wall-top",
          })
        );
      }

      wallsRef.current = bodies;
      Matter.World.add(engine.world, bodies);
    };

    buildWalls();
    const ro = new ResizeObserver(buildWalls);
    ro.observe(el);
    return () => ro.disconnect();
  }, [addTopWall]);

  // Mouse constraint: lets the pointer grab, drag and throw any dynamic
  // body in the world, exactly like the fancy-components Gravity demo.
  useEffect(() => {
    const engine = engineRef.current;
    const el = containerRef.current;
    if (!engine || !el) return;

    const mouse = Matter.Mouse.create(el);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false },
      },
    });
    Matter.World.add(engine.world, mouseConstraint);

    // Respect bodies marked non-draggable (MatterBody isDraggable={false})
    // by immediately releasing the constraint if it grabs one.
    const handleStartDrag = (event: unknown) => {
      const body = (event as { body?: Matter.Body }).body as
        | (Matter.Body & { plugin?: { isDraggable?: boolean } })
        | undefined;
      if (body?.plugin?.isDraggable === false) {
        const mc = mouseConstraint as unknown as {
          body: Matter.Body | null;
          constraint: { bodyB: Matter.Body | null };
        };
        mc.constraint.bodyB = null;
        mc.body = null;
      }
    };
    Matter.Events.on(mouseConstraint, "startdrag", handleStartDrag);

    const handleMouseDown = () => {
      if (grabCursor) el.style.cursor = "grabbing";
      onInteract?.();
    };
    const handleMouseUp = () => {
      if (grabCursor) el.style.cursor = "grab";
    };
    if (grabCursor) el.style.cursor = "grab";
    el.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("touchstart", handleMouseDown, { passive: true });
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      Matter.Events.off(mouseConstraint, "startdrag", handleStartDrag);
      el.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("touchend", handleMouseUp);
      Matter.Mouse.clearSourceEvents(mouse);
      Matter.World.remove(engine.world, mouseConstraint);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grabCursor]);

  return (
    <GravityContext.Provider value={{ engine: engineRef, containerRef }}>
      <div
        ref={containerRef}
        className={`relative touch-none select-none overflow-hidden ${className}`}
      >
        {children}
      </div>
    </GravityContext.Provider>
  );
}

export interface MatterBodyOptions {
  restitution?: number;
  friction?: number;
  frictionAir?: number;
  density?: number;
}

export interface MatterBodyProps {
  children: ReactNode;
  /** Initial x position. Either a pixel number or a percentage string
   *  (e.g. "50%") relative to the Gravity container's width. */
  x: number | string;
  /** Initial y position. Either a pixel number (negative values start
   *  above the container so the card visibly falls into view) or a
   *  percentage string relative to the container's height. */
  y: number | string;
  width: number;
  height: number;
  /** Initial rotation in degrees. */
  angle?: number;
  matterBodyOptions?: MatterBodyOptions;
  /** Whether this body can be grabbed and thrown with the pointer.
   *  Defaults to true. */
  isDraggable?: boolean;
  className?: string;
}

function resolveAxis(value: number | string, containerSize: number): number {
  if (typeof value === "string" && value.trim().endsWith("%")) {
    const pct = parseFloat(value) / 100;
    return pct * containerSize;
  }
  return typeof value === "string" ? parseFloat(value) : value;
}

export function MatterBody({
  children,
  x,
  y,
  width,
  height,
  angle = 0,
  matterBodyOptions = {},
  isDraggable = true,
  className = "",
}: MatterBodyProps) {
  const reactId = useId();
  const { engine, containerRef } = useGravity();
  const elRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<Matter.Body | null>(null);

  // Create the rigid body once and add it to the world.
  useEffect(() => {
    const eng = engine.current;
    const container = containerRef.current;
    if (!eng || !container) return;
    const world = eng.world;

    const { width: cw, height: ch } = container.getBoundingClientRect();
    const px = resolveAxis(x, cw);
    // Percentage y is relative to container height; plain numbers (often
    // negative, to start above the container) are used as-is.
    const py =
      typeof y === "string" && y.trim().endsWith("%")
        ? resolveAxis(y, ch)
        : (y as number);

    const {
      restitution = 0.45,
      friction = 0.2,
      frictionAir = 0.012,
      density = 0.0016,
    } = matterBodyOptions;

    const body = Matter.Bodies.rectangle(px, py, width, height, {
      restitution,
      friction,
      frictionAir,
      density,
      chamfer: { radius: Math.min(height / 2, 24) },
      angle: (angle * Math.PI) / 180,
    }) as Matter.Body & { plugin: { isDraggable: boolean } };

    body.plugin = { isDraggable };

    // A little spin + lateral drift on entry so cards don't fall in a
    // perfectly uniform, robotic way.
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
    Matter.Body.setVelocity(body, {
      x: (Math.random() - 0.5) * 2.2,
      y: 0,
    });

    bodyRef.current = body;
    Matter.World.add(world, body);

    return () => {
      Matter.World.remove(world, body);
      bodyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactId]);

  // Mirror the body's live position/rotation onto the DOM node every
  // frame. Writing directly to style (instead of React state) keeps this
  // smooth at 60fps while it's being dragged/thrown.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const body = bodyRef.current;
      const el = elRef.current;
      if (body && el) {
        const tx = body.position.x - width / 2;
        const ty = body.position.y - height / 2;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${body.angle}rad)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <div
      ref={elRef}
      className={`absolute left-0 top-0 will-change-transform ${
        isDraggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${className}`}
      style={{ width, height }}
    >
      {children}
    </div>
  );
}
