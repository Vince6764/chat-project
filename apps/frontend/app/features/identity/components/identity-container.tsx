import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PANEL = "oklch(0.3 0.07 215)";

type Box = { id: string; label: string; sub: string; y: number };

const BOXES: Box[] = [
  { id: "client", label: "Client", sub: "browser", y: 30 },
  { id: "api", label: "API", sub: "NestJS + Socket.IO", y: 140 },
  { id: "pg", label: "Postgres", sub: "message history", y: 250 },
];

/** The route of one message. */
function Schematic() {
  const w = 190;
  const h = 56;
  const x = 120;
  const link = (a: Box, b: Box) => `M${x + w / 2} ${a.y + h}V${b.y}`;

  return (
    <svg
      viewBox="0 0 430 340"
      className="w-full max-w-md"
      role="img"
      aria-label="A message travels from the client to the API, which stores it in Postgres and pushes it to the other clients"
    >
      <g fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.5">
        <path className="flow-link" d={link(BOXES[0], BOXES[1])} />
        <path className="flow-link" d={link(BOXES[1], BOXES[2])} />
      </g>
      {BOXES.map((n) => (
        <g key={n.id}>
          <rect x={x} y={n.y} width={w} height={h} rx="8" fill={PANEL} stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5" />
          <text x={x + 14} y={n.y + 24} className="fill-current font-display text-[15px] font-semibold">
            {n.label}
          </text>
          <text x={x + 14} y={n.y + 43} className="fill-current font-mono text-[10px]" fillOpacity=".7">
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  "The client sends a message over a WebSocket.",
  "The API saves the message to Postgres.",
  "It pushes the message to everyone in the room.",
];

export function IdentityContainer({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="h-dvh w-full overflow-y-auto">
      <div className="grid min-h-full lg:grid-cols-[1fr_1.1fr]">
        {/* form panel */}
        <main className="relative flex min-h-dvh items-center justify-center px-6 py-10">
          <div className="absolute top-4 left-4 lg:hidden">
            <div className="text-primary flex items-center gap-2">
              <BrandMark className="size-6" />
              <span className="font-display text-xl font-bold tracking-tight">relay</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 lg:right-auto lg:left-4">
            <ThemeToggle />
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-8 space-y-1.5">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </main>

        {/* brand panel: clipped so it never adds page scroll */}
        <aside
          className="relative hidden overflow-hidden text-white lg:block"
          style={{ backgroundColor: PANEL }}
        >
          <div className="relative flex h-full min-h-dvh flex-col justify-between p-12">
            <div className="flex items-center gap-2.5">
              <BrandMark className="size-7" />
              <span className="font-display text-2xl font-bold tracking-tight">relay</span>
            </div>
            <div className="space-y-8">
              <Schematic />
              <ol className="max-w-md space-y-2 text-sm text-white/80">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="text-signal font-mono text-xs leading-6">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
