const CAR =
  "m16 6l3 4h2c1.11 0 2 .89 2 2v3h-2a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H1v-3c0-1.11.89-2 2-2l3-4zm-5.5 1.5H6.75L4.86 10h5.64zm1.5 0V10h5.14l-1.89-2.5zm-6 6A1.5 1.5 0 0 0 4.5 15A1.5 1.5 0 0 0 6 16.5A1.5 1.5 0 0 0 7.5 15A1.5 1.5 0 0 0 6 13.5m12 0a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5";
const MOTO =
  "m17.42 10l-4.01-4H9v2h3.59l2 2H6.5C4 10 2 12 2 14.5S4 19 6.5 19c2.22 0 4.06-1.62 4.42-3.73L13.04 14c-.04.17-.04.33-.04.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5m-8.66 5.26C8.5 16.27 7.58 17 6.47 17a2.5 2.5 0 0 1 0-5c1.12 0 2.03.74 2.37 1.75H6.75v1.5zM17.47 17a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5";

/* Banderines de papel picado: cada bandera es un solo trazo con huecos (fill-rule evenodd), como el papel recortado. */
const FLAG_W = 76;
const FLAG_OUTLINE = "M0 0 H76 V50 L63 64 L50 50 L38 64 L26 50 L13 64 L0 50Z";
const ring = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const diamond = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} l${r} ${r} l${-r} ${r} l${-r} ${-r}Z`;
const star4 = (cx: number, cy: number, r: number) =>
  `M${cx} ${cy - r} L${cx + r * 0.28} ${cy - r * 0.28} L${cx + r} ${cy} L${cx + r * 0.28} ${cy + r * 0.28} L${cx} ${cy + r} L${cx - r * 0.28} ${cy + r * 0.28} L${cx - r} ${cy} L${cx - r * 0.28} ${cy - r * 0.28}Z`;
const dots = (y: number) => [14, 26, 38, 50, 62].map((x) => ring(x, y, 2.4)).join(" ");

/** Cuatro diseños de recorte; el último deja una ventana para la silueta de un auto o una moto. */
const CUTS = [
  [ring(38, 28, 15), ring(38, 28, 7), diamond(11, 30, 5), diamond(65, 30, 5), dots(8)].join(" "),
  [
    diamond(38, 16, 9),
    diamond(38, 34, 9),
    diamond(38, 52, 6),
    ring(12, 30, 4),
    ring(64, 30, 4),
    dots(6),
  ].join(" "),
  [
    star4(38, 28, 18),
    ring(14, 14, 3),
    ring(62, 14, 3),
    ring(14, 42, 3),
    ring(62, 42, 3),
    dots(4),
  ].join(" "),
  [ring(38, 26, 19), dots(4)].join(" "),
];
const FLAG_COLORS = ["#22a55b", "var(--primary)", "var(--foreground)"];
const STRAND = { p0: [-20, 2], p1: [720, 90], p2: [1460, 4] } as const;
const FLAGS = Array.from({ length: 19 }, (_, i) => {
  const t = (i + 0.5) / 19;
  const x = (1 - t) ** 2 * STRAND.p0[0] + 2 * t * (1 - t) * STRAND.p1[0] + t ** 2 * STRAND.p2[0];
  const y = (1 - t) ** 2 * STRAND.p0[1] + 2 * t * (1 - t) * STRAND.p1[1] + t ** 2 * STRAND.p2[1];
  return {
    x: x - FLAG_W / 2,
    y,
    cut: CUTS[i % 4]!,
    color: FLAG_COLORS[i % 3]!,
    icon: i % 4 === 3 ? (i % 8 === 3 ? CAR : MOTO) : null,
    i,
  };
});

function Bunting() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 130"
      className="pointer-events-none absolute top-0 left-1/2 -z-10 h-auto w-[max(100%,720px)] -translate-x-1/2"
    >
      <path
        d={`M${STRAND.p0[0]} ${STRAND.p0[1]} Q${STRAND.p1[0]} ${STRAND.p1[1]} ${STRAND.p2[0]} ${STRAND.p2[1]}`}
        fill="none"
        className="stroke-foreground"
        opacity="0.22"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {FLAGS.map((f) => (
        <g key={f.i} transform={`translate(${f.x} ${f.y})`}>
          <g className="hero-flag" style={{ animationDelay: `${-(f.i % 7) * 0.55}s` }}>
            <path
              d={`${FLAG_OUTLINE} ${f.cut}`}
              fillRule="evenodd"
              style={{ fill: f.color }}
              opacity="0.2"
            />
            {f.icon && (
              <path
                d={f.icon}
                transform="translate(21.5 14.5) scale(0.7)"
                style={{ fill: f.color }}
                opacity="0.26"
              />
            )}
          </g>
        </g>
      ))}
    </svg>
  );
}

/**
 * Fondo de la portada: banderines de papel picado que se mecen arriba y, abajo, una carretera por la que pasan un auto y
 * una moto en bucle, con una cenefa de talavera. Animación solo en CSS (ver globals.css); con "reducir movimiento" se queda quieto.
 */
export function HeroIllustration() {
  return (
    <>
      <Bunting />
      <Road />
    </>
  );
}

function Road() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 440"
      className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-auto w-[max(100%,900px)] -translate-x-1/2 [mask-image:linear-gradient(to_bottom,transparent,black_35%)]"
    >
      {/* Sol sobre el horizonte */}
      <path d="M1090 300 a100 100 0 0 1 200 0Z" className="fill-primary" opacity="0.1" />

      {/* Horizonte y suelo */}
      <rect y="300" width="1440" height="120" className="fill-foreground" opacity="0.03" />
      <path d="M0 300 H1440" className="stroke-foreground" opacity="0.12" strokeWidth="2" />

      {/* Carretera: bordes fijos y línea central que avanza */}
      <path
        d="M0 330 H1440 M0 410 H1440"
        className="stroke-foreground"
        opacity="0.08"
        strokeWidth="2"
      />
      <path
        d="M0 370 H1440"
        className="hero-dash stroke-foreground"
        opacity="0.16"
        strokeWidth="4"
        strokeDasharray="34 30"
      />

      {/* Auto (carril de arriba, hacia la derecha) */}
      <g className="hero-drive-right fill-foreground" opacity="0.14">
        <path d={CAR} transform="translate(0 262) scale(5)" />
      </g>
      {/* Moto (carril de abajo, hacia la izquierda: se refleja) */}
      <g className="hero-drive-left fill-foreground" opacity="0.14">
        <path d={MOTO} transform="translate(116 308) scale(-5 5)" />
      </g>

      {/* Cenefa de talavera bajo la carretera */}
      <defs>
        <pattern id="cenefa" width="48" height="22" patternUnits="userSpaceOnUse">
          <path d="M24 2 L34 11 L24 20 L14 11Z" className="fill-primary" opacity="0.5" />
          <circle cx="24" cy="11" r="3" className="fill-background" />
          <path
            d="M0 11 H8 M40 11 H48"
            className="stroke-foreground"
            opacity="0.35"
            strokeWidth="2"
          />
        </pattern>
      </defs>
      <rect y="418" width="1440" height="22" fill="url(#cenefa)" opacity="0.28" />
    </svg>
  );
}
