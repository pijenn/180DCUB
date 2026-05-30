import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeading({ 
  title, 
  subtitle, 
  align = "center",
  className,
  ...props 
}: SectionHeadingProps) {
  return (
    <div 
      className={cn(
        "space-y-4 mb-12",
        {
          "text-left": align === "left",
          "text-center": align === "center",
          "text-right": align === "right",
        },
        className
      )}
      {...props}
    >
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
        {title.split(' ').map((word, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <span className="text-[var(--color-primary)]">{word}</span>
            ) : (
              <>{word} </>
            )}
          </span>
        ))}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
