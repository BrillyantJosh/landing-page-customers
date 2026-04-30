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
      <div className="w-8 h-8 overflow-hidden shrink-0 flex items-center justify-center">
        <img
          src="/lana-favicon.png"
          alt="Lana"
          className={cn("w-12 h-12 object-contain drop-shadow-sm", iconClassName)}
        />
      </div>
      {showText && (
        <span className={cn("font-display text-xl font-semibold tracking-tight text-lana-ink", textClassName)}>
          Mejmo se fajn
        </span>
      )}
    </div>
  );
}
