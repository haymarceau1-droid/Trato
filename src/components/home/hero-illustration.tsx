const CAR =
  "m16 6l3 4h2c1.11 0 2 .89 2 2v3h-2a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H1v-3c0-1.11.89-2 2-2l3-4zm-5.5 1.5H6.75L4.86 10h5.64zm1.5 0V10h5.14l-1.89-2.5zm-6 6A1.5 1.5 0 0 0 4.5 15A1.5 1.5 0 0 0 6 16.5A1.5 1.5 0 0 0 7.5 15A1.5 1.5 0 0 0 6 13.5m12 0a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5";
const MOTO =
  "m17.42 10l-4.01-4H9v2h3.59l2 2H6.5C4 10 2 12 2 14.5S4 19 6.5 19c2.22 0 4.06-1.62 4.42-3.73L13.04 14c-.04.17-.04.33-.04.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5m-8.66 5.26C8.5 16.27 7.58 17 6.47 17a2.5 2.5 0 0 1 0-5c1.12 0 2.03.74 2.37 1.75H6.75v1.5zM17.47 17a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5";

/**
 * Ilustración de fondo de la portada: sol, sierra y una carretera con un auto y una moto.
 * Es decorativa (opacidad baja, sin interacción) y usa los colores del tema, así que sirve en claro y oscuro.
 */
export function HeroIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 700"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)]"
    >
      {/* Sol */}
      <circle cx="1130" cy="190" r="120" className="fill-primary" opacity="0.1" />
      <circle cx="1130" cy="190" r="170" fill="none" className="stroke-primary" opacity="0.08" />

      {/* Sierra: dos planos */}
      <path
        d="M0 470 L120 380 L210 430 L340 330 L470 440 L560 390 L700 470 L0 470Z"
        className="fill-foreground"
        opacity="0.045"
      />
      <path
        d="M520 470 L690 350 L790 420 L930 300 L1070 430 L1180 370 L1300 440 L1440 360 L1440 470Z"
        className="fill-foreground"
        opacity="0.06"
      />

      {/* Cactus */}
      <g
        className="stroke-foreground"
        opacity="0.09"
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
      >
        <path d="M250 560 V470 M250 520 H225 V490 M250 505 H275 V478" />
        <path d="M1260 575 V500 M1260 540 H1238 V515 M1260 528 H1280 V508" />
      </g>

      {/* Carretera con perspectiva */}
      <path d="M0 700 L560 480 H880 L1440 700Z" className="fill-foreground" opacity="0.05" />
      <path
        d="M720 484 V700"
        className="stroke-foreground"
        opacity="0.12"
        strokeWidth="6"
        strokeDasharray="22 26"
      />
      <path d="M560 480 H880" className="stroke-foreground" opacity="0.1" strokeWidth="3" />

      {/* Auto y moto */}
      <g className="fill-foreground" opacity="0.1">
        <path d={CAR} transform="translate(330 540) scale(9)" />
        <path d={MOTO} transform="translate(1010 548) scale(8)" />
      </g>

      {/* Líneas de velocidad */}
      <g className="stroke-foreground" opacity="0.08" strokeWidth="4" strokeLinecap="round">
        <path d="M170 600 H290 M130 628 H250 M200 656 H300" />
        <path d="M1180 612 H1290 M1215 640 H1330" />
      </g>
    </svg>
  );
}
