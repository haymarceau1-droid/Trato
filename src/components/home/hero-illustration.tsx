const CAR =
  "m16 6l3 4h2c1.11 0 2 .89 2 2v3h-2a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H1v-3c0-1.11.89-2 2-2l3-4zm-5.5 1.5H6.75L4.86 10h5.64zm1.5 0V10h5.14l-1.89-2.5zm-6 6A1.5 1.5 0 0 0 4.5 15A1.5 1.5 0 0 0 6 16.5A1.5 1.5 0 0 0 7.5 15A1.5 1.5 0 0 0 6 13.5m12 0a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5";
const MOTO =
  "m17.42 10l-4.01-4H9v2h3.59l2 2H6.5C4 10 2 12 2 14.5S4 19 6.5 19c2.22 0 4.06-1.62 4.42-3.73L13.04 14c-.04.17-.04.33-.04.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5m-8.66 5.26C8.5 16.27 7.58 17 6.47 17a2.5 2.5 0 0 1 0-5c1.12 0 2.03.74 2.37 1.75H6.75v1.5zM17.47 17a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5";

/**
 * Fondo minimalista de la portada: una línea de horizonte, un sol a medias y una carretera por la que un auto y una moto
 * pasan en bucle (animación CSS, ver globals.css). Con "reducir movimiento" se queda quieto.
 */
export function HeroIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 420"
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
    </svg>
  );
}
