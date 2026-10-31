const CAR =
  "m16 6l3 4h2c1.11 0 2 .89 2 2v3h-2a3 3 0 0 1-3 3a3 3 0 0 1-3-3H9a3 3 0 0 1-3 3a3 3 0 0 1-3-3H1v-3c0-1.11.89-2 2-2l3-4zm-5.5 1.5H6.75L4.86 10h5.64zm1.5 0V10h5.14l-1.89-2.5zm-6 6A1.5 1.5 0 0 0 4.5 15A1.5 1.5 0 0 0 6 16.5A1.5 1.5 0 0 0 7.5 15A1.5 1.5 0 0 0 6 13.5m12 0a1.5 1.5 0 0 0-1.5 1.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5a1.5 1.5 0 0 0-1.5-1.5";
const PICKUP =
  "M16 6h-5.5v4H1v5h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-3c0-1.11-.89-2-2-2h-2zm-4 1.5h3.5l1.96 2.5H12zm-6 6A1.5 1.5 0 0 1 7.5 15A1.5 1.5 0 0 1 6 16.5A1.5 1.5 0 0 1 4.5 15A1.5 1.5 0 0 1 6 13.5m12 0a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5";
const VAN =
  "M3 7c-1.11 0-2 .89-2 2v8h2a3 3 0 0 0 3 3a3 3 0 0 0 3-3h6a3 3 0 0 0 3 3a3 3 0 0 0 3-3h2v-4c0-1.11-.89-2-2-2l-3-4zm0 1.5h4V11H3zm6 0h4V11H9zm6 0h2.5l1.96 2.5H15zm-9 7A1.5 1.5 0 0 1 7.5 17A1.5 1.5 0 0 1 6 18.5A1.5 1.5 0 0 1 4.5 17A1.5 1.5 0 0 1 6 15.5m12 0a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5";
const MOTO =
  "m17.42 10l-4.01-4H9v2h3.59l2 2H6.5C4 10 2 12 2 14.5S4 19 6.5 19c2.22 0 4.06-1.62 4.42-3.73L13.04 14c-.04.17-.04.33-.04.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5s-2-4.5-4.5-4.5m-8.66 5.26C8.5 16.27 7.58 17 6.47 17a2.5 2.5 0 0 1 0-5c1.12 0 2.03.74 2.37 1.75H6.75v1.5zM17.47 17a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 2.5 2.5a2.5 2.5 0 0 1-2.5 2.5";
const SCOOTER =
  "M19 15c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1m0-2c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3m-9-7H5v2h5zm7-1h-3v2h3v2.65L13.5 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.5l4.5-5.65V7a2 2 0 0 0-2-2M7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1";

const RAYS = Array.from({ length: 20 }, (_, i) => (i * Math.PI * 2) / 20);

/** Una planta de agave: hojas puntiagudas desde la base (0,0). */
const AGAVE = "M0 0 L-46 -34 L-12 -16 L-30 -74 L-4 -22 L0 -86 L4 -22 L30 -74 L12 -16 L46 -34Z";
const CACTUS = "M0 0 V-92 M0 -52 H-26 V-78 M0 -38 H26 V-66";

/**
 * Ilustración de fondo de la portada: cielo con sol, nubes y aves; sierra, una pirámide mesoamericana,
 * magueyes, cactus y postes; y una carretera sinuosa con un auto, una pickup, una van, una moto y un scooter.
 * Es decorativa (opacidad baja, sin interacción) y usa los colores del tema, así que sirve en claro y oscuro.
 */
export function HeroIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 780"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 -z-10 size-full [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_90%,transparent)]"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--primary)", stopOpacity: 0.05 }} />
          <stop offset="1" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <rect width="1440" height="520" fill="url(#hero-sky)" />

      {/* Sol con rayos */}
      <g transform="translate(1160 210)">
        <circle r="112" className="fill-primary" opacity="0.11" />
        <circle r="150" fill="none" className="stroke-primary" opacity="0.1" strokeWidth="2" />
        <g className="stroke-primary" opacity="0.1" strokeWidth="5" strokeLinecap="round">
          {RAYS.map((a, i) => (
            <path
              key={i}
              d={`M${Math.cos(a) * 178} ${Math.sin(a) * 178} L${Math.cos(a) * (i % 2 ? 205 : 226)} ${Math.sin(a) * (i % 2 ? 205 : 226)}`}
            />
          ))}
        </g>
      </g>

      {/* Nubes */}
      <g className="fill-foreground" opacity="0.04">
        <path d="M110 190c0-26 22-44 48-40 14-24 52-24 66-2 32-4 52 16 48 42H118c-6 0-8-.5-8 0z" />
        <path d="M560 110c0-20 17-34 37-31 11-18 40-18 51-1 25-3 40 12 37 32H566c-4 0-6 0-6 0z" />
        <path d="M860 280c0-16 14-28 31-25 9-14 33-14 42-1 20-2 32 10 30 26H866c-4 0-6 0-6 0z" />
      </g>

      {/* Aves */}
      <g
        className="stroke-foreground"
        opacity="0.1"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M410 170q12-14 24 0q12-14 24 0" />
        <path d="M470 205q9-10 18 0q9-10 18 0" />
        <path d="M980 120q10-11 20 0q10-11 20 0" />
      </g>

      {/* Sierra lejana, media y cercana */}
      <path
        d="M0 500 L130 400 L240 462 L380 350 L520 468 L640 410 L760 480 L900 380 L1040 470 L1170 392 L1300 462 L1440 380 V520 H0Z"
        className="fill-foreground"
        opacity="0.035"
      />
      <path
        d="M0 520 L160 440 L300 500 L430 420 L560 505 L700 455 L820 515 L960 430 L1100 510 L1240 440 L1440 520 V560 H0Z"
        className="fill-foreground"
        opacity="0.05"
      />
      <path
        d="M0 560 C180 520 320 560 520 545 S860 520 1040 548 S1320 530 1440 555 V600 H0Z"
        className="fill-foreground"
        opacity="0.06"
      />

      {/* Pirámide escalonada con templo */}
      <g className="fill-foreground" opacity="0.08" transform="translate(300 0)">
        <rect x="-135" y="528" width="270" height="22" />
        <rect x="-113" y="506" width="226" height="22" />
        <rect x="-91" y="484" width="182" height="22" />
        <rect x="-69" y="462" width="138" height="22" />
        <rect x="-47" y="440" width="94" height="22" />
        <rect x="-30" y="410" width="60" height="30" />
        <rect x="-36" y="402" width="72" height="8" />
        <rect x="-8" y="420" width="16" height="20" className="fill-background" opacity="0.5" />
        <rect x="-10" y="440" width="20" height="110" className="fill-background" opacity="0.35" />
      </g>

      {/* Postes de luz con cables */}
      <g
        className="stroke-foreground"
        opacity="0.1"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      >
        {[
          [980, 600, 0.8],
          [1090, 622, 1],
          [1230, 652, 1.3],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 V-130 M-24 -118 H24 M-18 -102 H18" />
          </g>
        ))}
        <path d="M956 482 Q1018 500 1090 492 T1254 534" strokeWidth="2" />
        <path d="M1004 482 Q1060 505 1114 494 T1278 536" strokeWidth="2" />
      </g>

      {/* Magueyes y cactus */}
      <g className="fill-foreground" opacity="0.09">
        <path d={AGAVE} transform="translate(120 640) scale(1.1)" />
        <path d={AGAVE} transform="translate(1340 690) scale(1.3)" />
        <path d={AGAVE} transform="translate(1020 580) scale(0.6)" />
        <path d={AGAVE} transform="translate(210 600) scale(0.7)" />
      </g>
      <g
        className="stroke-foreground"
        opacity="0.1"
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
      >
        <path d={CACTUS} transform="translate(60 590)" />
        <path d={CACTUS} transform="translate(1390 640) scale(1.1)" />
        <path d={CACTUS} transform="translate(430 580) scale(0.7)" strokeWidth="12" />
      </g>

      {/* Carretera sinuosa */}
      <path
        d="M690 520 C 700 565, 600 590, 560 640 S 470 730, 430 780 H 1010 C 960 730, 880 700, 810 650 S 742 565, 752 520Z"
        className="fill-foreground"
        opacity="0.055"
      />
      <path
        d="M721 520 C 731 565, 690 610, 650 650 S 640 730, 640 780"
        className="stroke-foreground"
        opacity="0.14"
        fill="none"
        strokeWidth="6"
        strokeDasharray="20 24"
      />
      <path
        d="M690 520 C 700 565, 600 590, 560 640 S 470 730, 430 780 M752 520 C 742 565, 810 650, 810 650 S 960 730, 1010 780"
        className="stroke-foreground"
        opacity="0.1"
        fill="none"
        strokeWidth="3"
      />

      {/* Vehículos: más pequeños cuanto más lejos */}
      <g className="fill-foreground" opacity="0.11">
        <path d={VAN} transform="translate(716 560) scale(2.2)" />
        <path d={PICKUP} transform="translate(790 640) scale(3.4)" />
        <path d={CAR} transform="translate(420 650) scale(6.2)" />
        <path d={MOTO} transform="translate(920 700) scale(4.6)" />
        <path d={SCOOTER} transform="translate(300 716) scale(3.6)" />
      </g>

      {/* Líneas de velocidad */}
      <g className="stroke-foreground" opacity="0.08" strokeWidth="4" strokeLinecap="round">
        <path d="M300 690 H400 M260 716 H360 M320 742 H410" />
        <path d="M1010 742 H1100 M1050 764 H1130" />
      </g>
    </svg>
  );
}
