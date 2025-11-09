import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface TocItem {
  id: string;
  title: string;
}

interface TocProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TocProps) {
  return (
    <nav className={cn("bg-muted/50 rounded-lg p-6 mb-8", className)}>
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-start"
            >
              <span className="mr-2 font-medium">{index + 1}.</span>
              <span>{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  number?: number;
}

export function Section({ id, title, children, number }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 mb-8">
      <h2 className="text-2xl font-semibold mb-4 flex items-center group">
        {number && <span className="mr-2">{number}.</span>}
        {title}
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary text-base"
          aria-label="Link to this section"
        >
          #
        </a>
      </h2>
      <div className="space-y-4 text-muted-foreground">{children}</div>
    </section>
  );
}
