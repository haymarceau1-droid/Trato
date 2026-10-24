/**
 * Cuentakilómetros dibujado en SVG: el motivo visual de la portada.
 * La aguja hace un barrido al cargar (se desactiva con "reducir movimiento").
 */
const START = -135; // grados en sentido horario (0° = arriba): el dial arranca abajo a la izquierda
const SWEEP = 270;
const polar = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [200 + r * Math.cos(a), 200 + r * Math.sin(a)] as const;
};
const arc = (from: number, to: number, r: number) => {
  const [x1, y1] = polar(from, r);
  const [x2, y2] = polar(to, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

const TICKS = Array.from({ length: 55 }, (_, i) => i); // 0..54
const NEEDLE_DEG = START + SWEEP * 0.82;

export function HeroGauge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Cuentakilómetros con la leyenda 0 pesos de comisión"
      className={className}
    >
      <defs>
        <radialGradient id="gauge-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4141c" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4141c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="198" fill="url(#gauge-glow)" />
      <circle
        cx="200"
        cy="200"
        r="186"
        fill="#0a0a0a"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.5"
      />
      <circle
        cx="200"
        cy="200"
        r="176"
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="1"
      />

      {/* zona roja */}
      <path
        d={arc(START + SWEEP * 0.78, START + SWEEP, 160)}
        fill="none"
        stroke="#ff4d52"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* marcas */}
      {TICKS.map((i) => {
        const deg = START + (SWEEP * i) / 54;
        const major = i % 6 === 0;
        const [x1, y1] = polar(deg, major ? 142 : 150);
        const [x2, y2] = polar(deg, 166);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i / 54 > 0.78 ? "#ff4d52" : "rgba(255,255,255,0.75)"}
            strokeWidth={major ? 3 : 1.5}
          />
        );
      })}

      {/* cifras */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const [x, y] = polar(START + (SWEEP * n * 6) / 54, 122);
        return (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.6)"
            fontFamily="var(--font-display)"
            fontSize="17"
          >
            {n * 20}
          </text>
        );
      })}

      {/* aguja */}
      <g
        className="gauge-needle"
        style={{ transformOrigin: "200px 200px", transform: `rotate(${NEEDLE_DEG}deg)` }}
      >
        <polygon points="196,214 204,214 201,70 199,70" fill="#ff4d52" />
        <circle cx="200" cy="200" r="16" fill="#ff4d52" />
        <circle cx="200" cy="200" r="6" fill="#0a0a0a" />
      </g>

      {/* lectura central */}
      <text
        x="200"
        y="272"
        textAnchor="middle"
        fill="#f5f1f0"
        fontFamily="var(--font-display)"
        fontSize="50"
      >
        $0
      </text>
      <text
        x="200"
        y="298"
        textAnchor="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="11"
        letterSpacing="3"
      >
        DE COMISIÓN
      </text>
      <text
        x="200"
        y="338"
        textAnchor="middle"
        fill="rgba(255,255,255,0.4)"
        fontSize="10"
        letterSpacing="3"
      >
        AUTOS · MOTOS · MÉXICO
      </text>
    </svg>
  );
}
