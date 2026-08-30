import { ReactNode } from "react";
import { User } from "lucide-react";

export type FloatingCardColor = "billing" | "matters" | "dark" | "portal";
export type FloatingCardVariant = "pill" | "portal";

export interface FloatingCardProps {
  /** Visual theme of the card. Maps to a background/text combination. */
  color: FloatingCardColor;
  /** Rotation of the card in degrees. Only applied when the card renders
   *  standalone (outside of a physics MatterBody wrapper, which drives its
   *  own live rotation instead). */
  rotation?: number;
  /** lucide-react icon element rendered inside the icon chip. Not used by
   *  the "portal" variant, which renders an avatar instead. */
  icon?: ReactNode;
  /** Card label / title text. */
  label: string;
  /** "pill" renders the standard rounded pill used by Billing, Matters,
   *  Tasks and Documents. "portal" renders the wider message-style card
   *  used for "John Doe - Portal". */
  variant?: FloatingCardVariant;
  /** Optional supporting copy, only rendered for the "portal" variant. */
  message?: string;
  /** Optional meta line (e.g. a ticket ref + timestamp), portal variant only. */
  meta?: string;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_STYLES: Record<
  FloatingCardColor,
  { bg: string; text: string; iconBg: string; shadow: string }
> = {
  billing: {
    bg: "bg-billing",
    text: "text-white",
    iconBg: "bg-white/20",
    shadow: "shadow-[0_18px_35px_-12px_rgba(50,65,242,0.55)]",
  },
  matters: {
    bg: "bg-matters",
    text: "text-white",
    iconBg: "bg-white/20",
    shadow: "shadow-[0_18px_35px_-12px_rgba(226,124,52,0.55)]",
  },
  dark: {
    bg: "bg-dark",
    text: "text-matters",
    iconBg: "bg-white/10",
    shadow: "shadow-[0_18px_35px_-12px_rgba(33,30,59,0.55)]",
  },
  portal: {
    bg: "bg-portal",
    text: "text-portalText",
    iconBg: "bg-white/40",
    shadow: "shadow-[0_18px_35px_-12px_rgba(185,192,242,0.65)]",
  },
};

/**
 * Reusable pill/card used to build the "floating" hero visualization.
 * Handles both the standard pill cards (Billing, Matters, Tasks,
 * Documents) and the unique "John Doe - Portal" message card via the
 * `variant` prop, rather than shipping five separate components.
 */
export default function FloatingCard({
  color,
  rotation = 0,
  icon,
  label,
  variant = "pill",
  message,
  meta,
  className = "",
  style,
}: FloatingCardProps) {
  const theme = COLOR_STYLES[color];

  const mergedStyle: React.CSSProperties = {
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
    ...style,
  };

  if (variant === "portal") {
    return (
      <div
        className={`select-none rounded-[26px] ${theme.bg} ${theme.text} ${theme.shadow} flex items-stretch gap-3 px-4 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-portalDark dark:text-portalTextDark ${className}`}
        style={mergedStyle}
      >
        <span className="w-1 shrink-0 rounded-full bg-matters" aria-hidden />
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dark/90 text-matters">
          <User size={20} strokeWidth={2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-bold leading-tight">
            {label}
          </span>
          {message && (
            <span className="mt-0.5 block text-xs leading-snug text-portalText/70 line-clamp-2 dark:text-portalTextDark/70">
              {message}
            </span>
          )}
          {meta && (
            <span className="mt-1 block text-[11px] font-medium text-portalText/60 dark:text-portalTextDark/60">
              <span className="underline underline-offset-2">
                {meta.split(" - ")[0]}
              </span>
              {meta.includes(" - ") ? ` - ${meta.split(" - ")[1]}` : ""}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`select-none rounded-full ${theme.bg} ${theme.text} ${theme.shadow} flex items-center gap-3 px-6 py-4 transition-all duration-300 hover:scale-[1.03] hover:brightness-110 hover:shadow-xl ${className}`}
      style={mergedStyle}
    >
      {icon && (
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${theme.iconBg}`}
        >
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap text-lg font-bold leading-none md:text-xl">
        {label}
      </span>
    </div>
  );
}
