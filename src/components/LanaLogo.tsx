import { cn } from "@/lib/utils";

interface LanaLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
}

export function LanaLogo({ className, iconClassName, textClassName, showText = true }: LanaLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <img
        src="/lana-favicon.png"
        alt="Lana"
        className={cn("w-8 h-8 object-contain drop-shadow-sm", iconClassName)}
      />
      {showText && (
        <span className={cn("font-display text-xl font-semibold tracking-tight text-lana-ink", textClassName)}>
          Mejmo se fajn
        </span>
      )}
    </div>
  );
}
