// Authored flat illustrations, one per product family. Everything shares one palette and a 480x360 stage.
// Animated groups carry no transform attribute: CSS transforms would replace it.

const C = {
  o: "#EE7F1A",
  o2: "#F7A85A",
  o3: "#FCD3A6",
  o4: "#FFEBD6",
  o5: "#C9640C",
  ink: "#1F1F26",
  ink2: "#46464F",
  s1: "#F3F3F6",
  s2: "#DEDFE5",
  s3: "#B9BBC5",
  w: "#FFFFFF",
  leaf: "#86AE90",
  leaf2: "#5F8C6C",
};

function Coin({ x, y, r = 18 }) {
  return (
    <g>
      <circle cx={x} cy={y + r * 0.18} r={r} fill={C.o5} />
      <circle cx={x} cy={y} r={r} fill={C.o2} />
      <circle cx={x} cy={y} r={r * 0.72} fill="none" stroke={C.o} strokeWidth={r * 0.12} />
      <text x={x} y={y + r * 0.05} textAnchor="middle" dominantBaseline="central" fontSize={r * 0.95} fontWeight="700" fill={C.o5} fontFamily="system-ui, sans-serif">
        ₹
      </text>
    </g>
  );
}

function Sparkle({ x, y, s = 10, fill = C.o }) {
  return <path d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`} fill={fill} />;
}

function Ground({ y = 304, rx = 170 }) {
  return <ellipse className="art-bg" cx="240" cy={y} rx={rx} ry="12" fill={C.ink} opacity="0.07" />;
}

function Backdrop() {
  return <circle className="art-bg" cx="240" cy="178" r="150" fill={C.w} opacity="0.75" />;
}

function Tree({ x, y, s = 1 }) {
  return (
    <g>
      <rect x={x - 4 * s} y={y - 50 * s} width={8 * s} height={50 * s} rx={3 * s} fill={C.ink2} />
      <circle cx={x} cy={y - 62 * s} r={28 * s} fill={C.leaf} />
      <circle cx={x + 14 * s} cy={y - 50 * s} r={18 * s} fill={C.leaf2} />
    </g>
  );
}

function Key({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="15" fill="none" stroke={C.o} strokeWidth="7" />
      <rect x={x + 13} y={y - 4} width="48" height="8" rx="4" fill={C.o} />
      <rect x={x + 44} y={y + 2} width="7" height="12" rx="2" fill={C.o} />
      <rect x={x + 54} y={y + 2} width="7" height="9" rx="2" fill={C.o} />
    </g>
  );
}

function CarBody({ dx = 0, dy = 0, s = 1 }) {
  return (
    <g transform={`translate(${dx} ${dy}) scale(${s})`}>
      <path d="M165 214 L200 166 Q207 156 220 156 L300 156 Q313 156 321 166 L352 214 Z" fill={C.o} />
      <path d="M182 212 L208 175 Q212 168 221 168 L254 168 L254 212 Z" fill={C.w} />
      <path d="M266 168 L298 168 Q306 168 311 175 L336 212 L266 212 Z" fill={C.w} />
      <rect x="108" y="208" width="264" height="62" rx="24" fill={C.o} />
      <rect x="108" y="246" width="264" height="12" fill={C.o5} opacity="0.45" />
      <circle cx="360" cy="230" r="7" fill={C.o4} />
      <rect x="112" y="224" width="12" height="8" rx="3" fill={C.o5} />
      <circle cx="172" cy="272" r="27" fill={C.ink} />
      <circle cx="172" cy="272" r="11" fill={C.s2} />
      <circle cx="312" cy="272" r="27" fill={C.ink} />
      <circle cx="312" cy="272" r="11" fill={C.s2} />
    </g>
  );
}

function Bank({ x, body, roof }) {
  return (
    <g>
      <path d={`M${x - 70} 180 L${x} 132 L${x + 70} 180 Z`} fill={roof} />
      <rect x={x - 64} y="180" width="128" height="12" fill={body} />
      {[-46, -16, 14, 44].map((o) => (
        <rect key={o} x={x + o - 6} y="196" width="14" height="74" rx="3" fill={body} />
      ))}
      <rect x={x - 72} y="272" width="144" height="16" rx="4" fill={roof} />
    </g>
  );
}

const scenes = {
  home: (
    <>
      <Backdrop />
      <Ground />
      <Tree x={102} y={300} />
      <rect x="290" y="104" width="22" height="50" fill={C.ink2} />
      <rect x="150" y="168" width="180" height="134" rx="6" fill={C.w} />
      <rect x="292" y="168" width="38" height="134" fill={C.s1} />
      <path d="M132 180 L240 94 L348 180 Z" fill={C.o} />
      <path d="M240 94 L348 180 L298 180 Z" fill={C.o5} opacity="0.35" />
      <rect x="168" y="198" width="40" height="36" rx="6" fill={C.o3} />
      <path d="M188 198 V234 M168 216 H208" stroke={C.w} strokeWidth="3" />
      <rect x="282" y="198" width="34" height="36" rx="6" fill={C.o3} />
      <path d="M222 302 V250 Q222 228 242 228 Q262 228 262 250 V302 Z" fill={C.ink} />
      <circle cx="254" cy="268" r="3" fill={C.o2} />
      <g className="art-float">
        <Key x={356} y={98} />
      </g>
      <g className="art-float art-float-2">
        <Coin x={118} y={118} r={22} />
      </g>
      <Sparkle x={398} y={204} s={9} />
      <Sparkle x={74} y={176} s={7} fill={C.o2} />
    </>
  ),
  city: (
    <>
      <Backdrop />
      <Ground />
      <rect x="140" y="92" width="92" height="210" rx="6" fill={C.ink} />
      {[0, 1, 2, 3, 4, 5].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={154 + c * 25} y={108 + r * 30} width="15" height="18" rx="3" fill={(r + c) % 3 ? C.ink2 : C.o2} />)
      )}
      <rect x="238" y="150" width="96" height="152" rx="6" fill={C.w} />
      <rect x="304" y="150" width="30" height="152" fill={C.s1} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1].map((c) => <rect key={`${r}${c}`} x={252 + c * 26} y={166 + r * 30} width="16" height="18" rx="3" fill={C.s2} />)
      )}
      <rect x="340" y="214" width="56" height="88" rx="6" fill={C.o} />
      <rect x="352" y="230" width="32" height="12" rx="3" fill={C.o4} />
      <rect x="352" y="252" width="32" height="12" rx="3" fill={C.o4} />
      <Tree x={110} y={302} s={0.8} />
      <g className="art-float">
        <path d="M300 54 C278 54 266 70 266 86 C266 108 300 136 300 136 C300 136 334 108 334 86 C334 70 322 54 300 54 Z" fill={C.o} />
        <circle cx="300" cy="86" r="11" fill={C.w} />
      </g>
      <Sparkle x={392} y={160} s={9} />
    </>
  ),
  plot: (
    <>
      <Backdrop />
      <circle cx="120" cy="104" r="30" fill={C.o3} />
      <path d="M70 300 L130 214 L390 214 L420 300 Z" fill={C.o4} />
      <path d="M118 290 L156 226 L364 226 L392 290 Z" fill="none" stroke={C.o} strokeWidth="3.5" strokeDasharray="10 9" strokeLinejoin="round" />
      <rect x="296" y="118" width="5" height="128" rx="2" fill={C.ink2} />
      <g className="art-float art-float-2">
        <path d="M301 120 L350 136 L301 152 Z" fill={C.o} />
      </g>
      <rect x="170" y="252" width="6" height="22" rx="2" fill={C.ink2} />
      <rect x="230" y="244" width="6" height="22" rx="2" fill={C.ink2} />
      <Tree x={402} y={252} s={0.75} />
      <g className="art-float">
        <rect x="150" y="130" width="96" height="64" rx="12" fill={C.w} />
        <rect x="164" y="146" width="44" height="7" rx="3.5" fill={C.s2} />
        <rect x="164" y="160" width="66" height="7" rx="3.5" fill={C.s2} />
        <rect x="164" y="174" width="30" height="7" rx="3.5" fill={C.o2} />
      </g>
      <Sparkle x={380} y={110} s={9} />
    </>
  ),
  car: (
    <>
      <Backdrop />
      <rect x="64" y="300" width="352" height="8" rx="4" fill={C.s2} />
      <path d="M58 222 H96 M48 240 H92 M62 258 H96" stroke={C.s3} strokeWidth="5" strokeLinecap="round" />
      <CarBody />
      <g className="art-float">
        <Key x={318} y={96} />
      </g>
      <g className="art-float art-float-3">
        <Coin x={134} y={110} r={20} />
      </g>
      <Sparkle x={414} y={176} s={8} />
    </>
  ),
  motor: (
    <>
      <Backdrop />
      <rect x="64" y="300" width="352" height="8" rx="4" fill={C.s2} />
      <CarBody />
      <g className="art-float">
        <path d="M372 62 L414 76 V112 Q414 140 372 158 Q330 140 330 112 V76 Z" fill={C.ink} />
        <path d="M354 110 L368 124 L392 98" fill="none" stroke={C.o2} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Sparkle x={110} y={120} s={9} />
      <Sparkle x={78} y={196} s={6} fill={C.o2} />
    </>
  ),
  shop: (
    <>
      <Backdrop />
      <Ground />
      <rect x="138" y="160" width="204" height="142" fill={C.w} />
      <rect x="306" y="160" width="36" height="142" fill={C.s1} />
      <rect x="126" y="140" width="228" height="34" rx="8" fill={C.o} />
      {[0, 2, 4, 6].map((i) => (
        <rect key={i} x={126 + i * 28.5 + 14} y="140" width="14" height="34" fill={C.o4} opacity="0.85" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={i} cx={140 + i * 28.6} cy="176" r="14" fill={i % 2 ? C.o4 : C.o} />
      ))}
      <rect x="158" y="208" width="84" height="62" rx="6" fill={C.o3} />
      <rect x="170" y="236" width="18" height="34" rx="3" fill={C.o} />
      <rect x="194" y="226" width="18" height="44" rx="3" fill={C.ink2} />
      <rect x="218" y="244" width="14" height="26" rx="3" fill={C.o2} />
      <rect x="258" y="212" width="40" height="90" rx="4" fill={C.ink} />
      <rect x="186" y="104" width="108" height="28" rx="9" fill={C.ink} />
      <text x="240" y="119" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" letterSpacing="2" fill={C.w} fontFamily="system-ui, sans-serif">
        OPEN
      </text>
      <g className="art-float">
        <rect x="332" y="56" width="104" height="80" rx="14" fill={C.w} />
        <rect x="348" y="108" width="12" height="16" rx="3" fill={C.o3} />
        <rect x="366" y="96" width="12" height="28" rx="3" fill={C.o2} />
        <rect x="384" y="84" width="12" height="40" rx="3" fill={C.o} />
        <rect x="402" y="70" width="12" height="54" rx="3" fill={C.ink} />
      </g>
      <g className="art-float art-float-2">
        <Coin x={96} y={128} r={20} />
      </g>
    </>
  ),
  wallet: (
    <>
      <Backdrop />
      <Ground />
      <g className="art-float art-float-3">
        <rect x="272" y="74" width="112" height="206" rx="20" fill={C.ink} />
        <rect x="282" y="90" width="92" height="174" rx="12" fill={C.w} />
        <circle cx="328" cy="150" r="26" fill={C.o} />
        <path d="M316 150 L325 159 L341 142" fill="none" stroke={C.w} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="298" y="196" width="60" height="8" rx="4" fill={C.s2} />
        <rect x="306" y="212" width="44" height="8" rx="4" fill={C.s2} />
        <rect x="300" y="236" width="56" height="16" rx="8" fill={C.o3} />
      </g>
      <g transform="rotate(-9 190 170)">
        <rect x="124" y="142" width="132" height="70" rx="10" fill={C.ink2} />
        <rect x="140" y="160" width="24" height="18" rx="4" fill={C.o3} />
      </g>
      <rect x="106" y="176" width="182" height="124" rx="20" fill={C.o} />
      <rect x="196" y="208" width="98" height="56" rx="16" fill={C.o5} />
      <circle cx="226" cy="236" r="9" fill={C.o4} />
      <g className="art-float art-float-2">
        <Coin x={110} y={110} r={22} />
      </g>
      <Sparkle x={420} y={150} s={8} />
    </>
  ),
  education: (
    <>
      <Backdrop />
      <Ground />
      <rect x="132" y="262" width="214" height="30" rx="5" fill={C.o} />
      <rect x="140" y="270" width="190" height="4" rx="2" fill={C.o4} opacity="0.7" />
      <rect x="150" y="232" width="190" height="30" rx="5" fill={C.ink2} />
      <rect x="140" y="202" width="180" height="30" rx="5" fill={C.o3} />
      <rect x="150" y="210" width="160" height="4" rx="2" fill={C.w} />
      <g className="art-float">
        <path d="M184 160 V190 Q240 214 296 190 V160 L240 180 Z" fill={C.ink2} />
        <path d="M240 112 L346 146 L240 180 L134 146 Z" fill={C.ink} />
        <path d="M240 146 L326 156 V196" fill="none" stroke={C.o} strokeWidth="4" strokeLinecap="round" />
        <rect x="320" y="194" width="12" height="20" rx="4" fill={C.o} />
      </g>
      <g className="art-float art-float-2">
        <rect x="362" y="96" width="74" height="22" rx="11" fill={C.w} />
        <rect x="392" y="96" width="10" height="22" fill={C.o} />
      </g>
      <g className="art-float art-float-3">
        <circle cx="104" cy="122" r="26" fill={C.w} />
        <path d="M78 122 H130 M104 96 Q90 122 104 148 M104 96 Q118 122 104 148" fill="none" stroke={C.s3} strokeWidth="3" />
      </g>
      <Sparkle x={410} y={196} s={8} />
    </>
  ),
  gold: (
    <>
      <Backdrop />
      <Ground />
      {[
        [126, 248],
        [212, 248],
        [298, 248],
        [168, 206],
        [254, 206],
        [212, 164],
      ].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <path d={`M${x + 12} ${y} H${x + 72} L${x + 84} ${y + 42} H${x} Z`} fill={C.o2} />
          <path d={`M${x + 12} ${y} H${x + 72} L${x + 66} ${y + 10} H${x + 18} Z`} fill={C.o3} />
          <path d={`M${x + 72} ${y} L${x + 84} ${y + 42} H${x + 74} L${x + 66} ${y + 10} Z`} fill={C.o} />
        </g>
      ))}
      <g className="art-float">
        <Coin x={392} y={130} r={26} />
      </g>
      <g className="art-float art-float-2">
        <Coin x={96} y={150} r={18} />
      </g>
      <Sparkle x={330} y={150} s={11} />
      <Sparkle x={170} y={128} s={8} fill={C.o2} />
    </>
  ),
  card: (
    <>
      <Backdrop />
      <Ground y={300} rx={140} />
      <g transform="rotate(-12 260 170)">
        <rect x="156" y="98" width="216" height="134" rx="16" fill={C.ink} />
        <rect x="156" y="124" width="216" height="22" fill={C.ink2} />
      </g>
      <g className="art-float">
        <rect x="112" y="150" width="226" height="140" rx="16" fill={C.o} />
        <rect x="136" y="188" width="38" height="28" rx="6" fill={C.o3} />
        <path d="M190 194 Q198 202 190 210 M199 189 Q211 202 199 215" fill="none" stroke={C.w} strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={136 + i * 44} y="236" width="34" height="8" rx="4" fill={C.o4} opacity="0.9" />
        ))}
        <circle cx="296" cy="262" r="14" fill={C.w} opacity="0.85" />
        <circle cx="314" cy="262" r="14" fill={C.o3} opacity="0.85" />
      </g>
      <g className="art-float art-float-2">
        <Coin x={392} y={110} r={22} />
      </g>
      <Sparkle x={92} y={124} s={9} />
    </>
  ),
  health: (
    <>
      <Backdrop />
      <Ground />
      <path d="M52 214 H140 L156 186 L174 240 L190 214 H212" fill="none" stroke={C.ink2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M268 214 H300 L314 192 L330 236 L344 214 H428" fill="none" stroke={C.ink2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M240 74 L330 106 V184 Q330 256 240 298 Q150 256 150 184 V106 Z" fill={C.o} />
      <path d="M240 74 L330 106 V184 Q330 256 240 298 Z" fill={C.o5} opacity="0.3" />
      <path d="M240 236 C208 214 194 196 194 178 C194 162 206 152 219 152 C229 152 236 158 240 166 C244 158 251 152 261 152 C274 152 286 162 286 178 C286 196 272 214 240 236 Z" fill={C.w} />
      <g className="art-float">
        <rect x="352" y="70" width="52" height="52" rx="14" fill={C.w} />
        <path d="M378 82 V110 M364 96 H392" stroke={C.o} strokeWidth="7" strokeLinecap="round" />
      </g>
      <g className="art-float art-float-2">
        <g transform="rotate(-35 102 116)">
          <rect x="74" y="104" width="56" height="24" rx="12" fill={C.w} />
          <path d="M102 104 H118 A12 12 0 0 1 118 128 H102 Z" fill={C.o2} />
        </g>
      </g>
    </>
  ),
  growth: (
    <>
      <Backdrop />
      <Ground />
      <rect x="116" y="70" width="262" height="168" rx="18" fill={C.w} />
      <path d="M140 116 H354 M140 156 H354 M140 196 H354" stroke={C.s1} strokeWidth="2" />
      <path d="M142 214 L190 188 L236 198 L286 148 L344 108" fill="none" stroke={C.o} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="344" cy="108" r="13" fill={C.o4} />
      <circle cx="344" cy="108" r="7" fill={C.o} />
      {[
        [148, 3],
        [214, 5],
        [280, 7],
      ].map(([x, n]) =>
        Array.from({ length: n }, (_, i) => (
          <g key={`${x}${i}`}>
            <rect x={x} y={292 - i * 11} width="54" height="11" fill={C.o5} />
            <ellipse cx={x + 27} cy={292 - i * 11} rx="27" ry="7" fill={i === n - 1 ? C.o2 : C.o} />
          </g>
        ))
      )}
      <path d="M307 215 V178" stroke={C.leaf2} strokeWidth="4" strokeLinecap="round" />
      <g className="art-float">
        <path d="M307 190 C292 190 282 180 280 166 C296 166 306 174 307 190 Z" fill={C.leaf} />
        <path d="M307 182 C312 166 324 158 340 160 C338 174 324 184 307 182 Z" fill={C.leaf2} />
      </g>
      <Sparkle x={404} y={198} s={9} />
      <Sparkle x={90} y={160} s={7} fill={C.o2} />
    </>
  ),
  farm: (
    <>
      <circle cx="240" cy="190" r="150" fill={C.w} opacity="0.75" />
      <g className="art-float art-float-3">
        <circle cx="364" cy="96" r="34" fill={C.o3} />
      </g>
      <path d="M40 300 Q140 214 260 238 Q360 256 440 214 V304 H40 Z" fill={C.o4} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${86 + i * 70} 300 Q${120 + i * 70} 262 ${168 + i * 66} 252`} fill="none" stroke={C.o3} strokeWidth="5" strokeLinecap="round" />
      ))}
      <rect x="138" y="160" width="100" height="84" fill={C.o} />
      <path d="M126 166 L188 118 L250 166 Z" fill={C.ink} />
      <rect x="172" y="196" width="34" height="48" fill={C.w} />
      <path d="M172 196 L206 244 M206 196 L172 244" stroke={C.o} strokeWidth="4" />
      {[290, 330, 370].map((x) => (
        <g key={x} className="art-float art-float-2">
          <path d={`M${x} 244 V222`} stroke={C.leaf2} strokeWidth="3.5" strokeLinecap="round" />
          <path d={`M${x} 228 C${x - 14} 228 ${x - 20} 218 ${x - 20} 208 C${x - 8} 208 ${x} 216 ${x} 228 Z`} fill={C.leaf} />
          <path d={`M${x} 224 C${x + 4} 212 ${x + 12} 206 ${x + 22} 206 C${x + 20} 218 ${x + 12} 224 ${x} 224 Z`} fill={C.leaf2} />
        </g>
      ))}
    </>
  ),
  transfer: (
    <>
      <Backdrop />
      <Ground />
      <Bank x={136} body={C.s2} roof={C.ink2} />
      <Bank x={344} body={C.o3} roof={C.o} />
      <path d="M150 112 Q240 30 330 112" fill="none" stroke={C.o} strokeWidth="5" strokeDasharray="2 13" strokeLinecap="round" />
      <path d="M318 98 L334 116 L310 120" fill="none" stroke={C.o} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <g className="art-float">
        <Coin x={240} y={66} r={22} />
      </g>
      <rect x="208" y="222" width="64" height="28" rx="14" fill={C.ink} />
      <text x="240" y="237" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={C.w} fontFamily="system-ui, sans-serif">
        % ↓
      </text>
    </>
  ),
  docs: (
    <>
      <Backdrop />
      <Ground />
      <g transform="rotate(-7 250 190)">
        <rect x="170" y="82" width="170" height="214" rx="14" fill={C.s2} />
      </g>
      <rect x="152" y="78" width="172" height="222" rx="14" fill={C.w} />
      <rect x="176" y="104" width="78" height="10" rx="5" fill={C.ink} />
      {[132, 152, 172, 192].map((y, i) => (
        <rect key={y} x="176" y={y} width={i % 2 ? 96 : 124} height="8" rx="4" fill={C.s2} />
      ))}
      <path d="M178 254 C190 236 198 268 212 248 C222 234 228 262 244 250" fill="none" stroke={C.ink2} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="280" cy="250" r="27" fill="none" stroke={C.o} strokeWidth="5" />
      <path d="M268 250 L277 259 L294 241" fill="none" stroke={C.o} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <g className="art-float">
        <ellipse cx="376" cy="96" rx="20" ry="13" fill={C.ink} />
        <rect x="370" y="104" width="12" height="28" fill={C.ink2} />
        <rect x="346" y="130" width="60" height="22" rx="6" fill={C.o} />
      </g>
      <g className="art-float art-float-2">
        <g transform="rotate(38 112 196)">
          <rect x="62" y="188" width="100" height="16" rx="8" fill={C.ink} />
          <path d="M162 188 L182 196 L162 204 Z" fill={C.o} />
        </g>
      </g>
      <Sparkle x={398} y={226} s={8} />
    </>
  ),
  score: (
    <>
      <Backdrop />
      <Ground y={300} rx={150} />
      <path d="M116 250 A124 124 0 0 1 144 172" fill="none" stroke={C.s2} strokeWidth="26" />
      <path d="M152 162 A124 124 0 0 1 222 128" fill="none" stroke={C.o3} strokeWidth="26" />
      <path d="M236 126 A124 124 0 0 1 318 156" fill="none" stroke={C.o2} strokeWidth="26" />
      <path d="M328 166 A124 124 0 0 1 364 250" fill="none" stroke={C.o} strokeWidth="26" />
      <g className="art-needle">
        <path d="M236 250 L320 170 L244 258 Z" fill={C.ink} />
      </g>
      <circle cx="240" cy="250" r="16" fill={C.ink} />
      <circle cx="240" cy="250" r="6" fill={C.o2} />
      <rect x="186" y="276" width="108" height="16" rx="8" fill={C.s2} />
      <Sparkle x={392} y={120} s={10} />
      <Sparkle x={88} y={150} s={7} fill={C.o2} />
    </>
  ),
  megaphone: (
    <>
      <Backdrop />
      <Ground />
      <path d="M150 170 L292 104 V262 L150 210 Z" fill={C.o} />
      <path d="M292 104 V262 L270 252 V114 Z" fill={C.o5} opacity="0.35" />
      <rect x="118" y="166" width="40" height="48" rx="10" fill={C.ink} />
      <path d="M168 212 L182 268 Q184 278 194 278 H206 Q214 278 212 268 L200 222 Z" fill={C.ink2} />
      <rect x="290" y="96" width="20" height="176" rx="10" fill={C.ink} />
      <path d="M334 146 Q352 184 334 222 M360 126 Q388 184 360 242" fill="none" stroke={C.o2} strokeWidth="6" strokeLinecap="round" />
      <g className="art-float">
        <rect x="366" y="58" width="62" height="46" rx="14" fill={C.w} />
        <path d="M397 92 C386 84 380 78 380 72 C380 67 384 64 388 64 C392 64 395 67 397 70 C399 67 402 64 406 64 C410 64 414 67 414 72 C414 78 408 84 397 92 Z" fill={C.o} />
      </g>
      <g className="art-float art-float-2">
        <rect x="70" y="92" width="66" height="44" rx="14" fill={C.w} />
        <rect x="84" y="114" width="8" height="12" rx="2" fill={C.o3} />
        <rect x="98" y="106" width="8" height="20" rx="2" fill={C.o2} />
        <rect x="112" y="100" width="8" height="26" rx="2" fill={C.o} />
      </g>
    </>
  ),
  consult: (
    <>
      <Backdrop />
      <Ground />
      <path d="M110 92 H298 Q318 92 318 112 V208 Q318 228 298 228 H170 L130 262 V228 H110 Q90 228 90 208 V112 Q90 92 110 92 Z" fill={C.w} />
      <rect x="116" y="124" width="150" height="10" rx="5" fill={C.ink} />
      <rect x="116" y="148" width="176" height="8" rx="4" fill={C.s2} />
      <rect x="116" y="168" width="120" height="8" rx="4" fill={C.s2} />
      <rect x="116" y="188" width="150" height="8" rx="4" fill={C.s2} />
      <g className="art-float">
        <path d="M262 186 H374 Q392 186 392 204 V258 Q392 276 374 276 H366 V300 L338 276 H262 Q244 276 244 258 V204 Q244 186 262 186 Z" fill={C.o} />
        <circle cx="290" cy="232" r="7" fill={C.w} />
        <circle cx="318" cy="232" r="7" fill={C.w} />
        <circle cx="346" cy="232" r="7" fill={C.w} />
      </g>
      <g className="art-float art-float-2">
        <circle cx="386" cy="110" r="26" fill={C.o3} />
        <rect x="376" y="134" width="20" height="16" rx="4" fill={C.ink2} />
        <path d="M386 98 V112 M378 106 L386 114 L394 106" fill="none" stroke={C.o5} strokeWidth="3" strokeLinecap="round" />
      </g>
    </>
  ),
  calc: (
    <>
      <Backdrop />
      <Ground />
      <g transform="rotate(8 320 170)">
        <path d="M272 74 H384 V256 L370 246 L356 256 L342 246 L328 256 L314 246 L300 256 L286 246 L272 256 Z" fill={C.w} />
        {[104, 126, 148, 170].map((y, i) => (
          <rect key={y} x="290" y={y} width={i % 2 ? 50 : 76} height="8" rx="4" fill={C.s2} />
        ))}
        <rect x="290" y="200" width="76" height="12" rx="6" fill={C.o2} />
      </g>
      <rect x="134" y="92" width="150" height="208" rx="24" fill={C.ink} />
      <rect x="152" y="112" width="114" height="44" rx="10" fill={C.o4} />
      <rect x="196" y="128" width="56" height="14" rx="4" fill={C.o} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}${c}`} x={152 + c * 40} y={170 + r * 30} width="34" height="22" rx="7" fill={r === 3 && c === 2 ? C.o : C.ink2} />
        ))
      )}
      <g className="art-float">
        <Coin x={96} y={138} r={22} />
      </g>
      <g className="art-float art-float-2">
        <Coin x={410} y={248} r={16} />
      </g>
      <Sparkle x={104} y={232} s={8} />
    </>
  ),
  location: (
    <>
      <Backdrop />
      <Ground />
      <rect x="96" y="96" width="288" height="196" rx="22" fill={C.w} />
      <path d="M96 190 H384 M206 96 V292 M300 96 Q290 200 384 236" fill="none" stroke={C.s1} strokeWidth="18" />
      <rect x="226" y="208" width="58" height="62" rx="10" fill={C.leaf} opacity="0.55" />
      <rect x="116" y="116" width="70" height="56" rx="10" fill={C.o4} />
      <g className="art-float">
        <path d="M240 64 C210 64 192 86 192 110 C192 142 240 184 240 184 C240 184 288 142 288 110 C288 86 270 64 240 64 Z" fill={C.o} />
        <circle cx="240" cy="110" r="16" fill={C.w} />
      </g>
      <ellipse cx="240" cy="190" rx="18" ry="5" fill={C.ink} opacity="0.15" />
      <Sparkle x={410} y={120} s={9} />
    </>
  ),
};

const BY_SLUG = {
  homeloan: "home",
  housepurchaseloan: "home",
  homerennovation: "home",
  mortrageloan: "home",
  flatpurchase: "city",
  constructionloan: "city",
  commercialproperty: "city",
  commercialpropertymortgage: "city",
  plotpurchaseloan: "plot",
  plotpurchaseconstruction: "plot",
  balancetransfer: "transfer",
  balancetransfertopup: "transfer",
  personalloan: "wallet",
  buisnessloan: "shop",
  pradhanmantriloan: "shop",
  projectfunding: "growth",
  carloan: "car",
  usedcarpurchase: "car",
  carloanfunding: "car",
  educationloan: "education",
  goldloan: "gold",
  kisancreditcard: "farm",
  creditcard: "card",
  homeinsurance: "home",
  homeloaninsurance: "home",
  buildinginsurance: "city",
  fireinsurance: "city",
  commercialinsurance: "shop",
  childplans: "education",
  "ca-services": "calc",
  "government-business-services": "docs",
  "registration-services": "docs",
  "e-stamp-services": "docs",
  "credit-score-check-service": "score",
  "business-consultation-service": "consult",
  "digital-marketing-sevice": "megaphone",
  "real-estate-services": "city",
  "dsa-franchise": "consult",
};

const BY_GROUP = { property: "home", personal: "wallet", business: "shop", health: "health", motor: "motor", invest: "growth" };

export function sceneFor(item) {
  if (!item) return "docs";
  return BY_SLUG[item.slug] || (item.kind === "card" ? "card" : BY_GROUP[item.group]) || "docs";
}

// `bare` drops the white halo and ground shadow, for use on dark or busy surfaces.
export default function Scene({ name, title, className, bare = false }) {
  const label = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 480 360" className={bare ? `[&_.art-bg]:hidden ${className || ""}` : className} {...label}>
      {scenes[name] || scenes.docs}
    </svg>
  );
}
