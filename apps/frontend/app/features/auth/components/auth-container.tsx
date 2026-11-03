import type { ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PANEL = "oklch(0.3 0.07 215)";

type Box = { id: string; label: string; sub: string; x: number; y: number };

const BOXES: Box[] = [
  { id: "client", label: "Client", sub: "browser", x: 20, y: 20 },
  { id: "lb", label: "Traefik", sub: "health checks", x: 20, y: 110 },
  { id: "n1", label: "node-1", sub: "NestJS + Socket.IO", x: 20, y: 200 },
  { id: "n2", label: "node-2", sub: "NestJS + Socket.IO", x: 20, y: 290 },
];

/** The route of one message, drawn to scale of its parts. */
function Schematic() {
  // Left column is the request path; right column is shared state.
  const w = 150;
  const h = 52;
  const nodes = [
    ...BOXES.map((b) => ({ ...b, x: 30, w })),
    { id: "redis", label: "Redis", sub: "pub/sub between nodes", x: 250, y: 200, w },
    { id: "pg", label: "Postgres", sub: "message history", x: 250, y: 290, w },
  ];
  const mid = (id: string) => {
    const n = nodes.find((b) => b.id === id)!;
    return { l: n.x, r: n.x + n.w, cx: n.x + n.w / 2, t: n.y, b: n.y + h, cy: n.y + h / 2 };
  };
  const link = (a: string, b: string) => {
    const p = mid(a);
    const q = mid(b);
    return `M${p.cx} ${p.b}V${q.t}`;
  };
  const side = (a: string, b: string) => {
    const p = mid(a);
    const q = mid(b);
    return `M${p.r} ${p.cy}H${q.l}`;
  };

  return (
    <svg
      viewBox="0 0 430 380"
      className="w-full max-w-md"
      role="img"
      aria-label="A message travels from the client through Traefik to one of two nodes, which store it in Postgres and relay it through Redis"
    >
      <g fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.5">
        <path className="flow-link" d={link("client", "lb")} />
        <path className="flow-link" d={link("lb", "n1")} />
        {/* Traefik reaches node-2 around node-1 */}
        <path className="flow-link" d="M30 162H14V316H30" />
        <path className="flow-link" d={side("n1", "redis")} />
        <path className="flow-link" d={side("n2", "pg")} />
        <path className="flow-link" d={link("redis", "pg")} />
        <path className="flow-link" d="M180 316H210V226H250" />
      </g>
      {nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={n.w} height={h} rx="8" fill={PANEL} stroke="currentColor" strokeOpacity=".7" strokeWidth="1.5" />
          <text x={n.x + 12} y={n.y + 22} className="fill-current font-display text-[15px] font-semibold">
            {n.label}
          </text>
          <text x={n.x + 12} y={n.y + 40} className="fill-current font-mono text-[10px]" fillOpacity=".7">
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  "The client sends a message over a WebSocket.",
  "Traefik hands the connection to a healthy node.",
  "That node saves the message to Postgres.",
  "Redis relays it, so the other node can reach its own clients.",
];

export function AuthContainer({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
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
            <div className="text-muted-foreground mt-8 text-sm">{footer}</div>
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
