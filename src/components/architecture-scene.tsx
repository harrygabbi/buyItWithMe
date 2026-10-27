import { useId } from "react";

/** A lightweight vector scene: sharp at every size, with no external assets. */
export function ArchitectureScene() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="architecture-scene" aria-hidden="true">
      <div className="scene-orbit scene-orbit-one" />
      <div className="scene-orbit scene-orbit-two" />
      <svg viewBox="0 0 600 440" fill="none" className="scene-building">
        <defs>
          <linearGradient id={`${id}-glass`} x1="180" y1="90" x2="420" y2="360" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b6b2ff" stopOpacity=".8" />
            <stop offset=".48" stopColor="#454b94" stopOpacity=".85" />
            <stop offset="1" stopColor="#131b3c" />
          </linearGradient>
          <linearGradient id={`${id}-side`} x1="370" y1="150" x2="470" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#514895" />
            <stop offset="1" stopColor="#151d40" />
          </linearGradient>
          <linearGradient id={`${id}-light`} x1="160" y1="0" x2="440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9483ff" />
            <stop offset="1" stopColor="#8ae5ed" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#8670fc" stopOpacity=".4" />
            <stop offset="1" stopColor="#8670fc" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="310" cy="335" rx="250" ry="95" fill={`url(#${id}-halo)`} />
        <g className="scene-grid" stroke="#9785f7" strokeOpacity=".16">
          {[0, 1, 2, 3, 4, 5].map((n) => <path key={n} d={`M${50 + n * 55} ${300 + n * 17}l260-130M${115 + n * 65} ${240 - n * 12}l260 130`} />)}
        </g>
        <path d="M104 313 305 211 514 316 311 422Z" fill="#181d3c" stroke="#8275ca" strokeOpacity=".55" />
        <path d="m104 313 207 104 203-101v12L311 432 104 327Z" fill="#0c132b" />
        <path d="m134 310 174-87 176 89-174 87Z" fill="#232746" stroke="#a394ec" strokeOpacity=".35" />
        <path d="M178 190 320 119 455 187 313 259Z" fill="#9591cb" />
        <path d="M178 190v125l135 68V259Z" fill={`url(#${id}-glass)`} />
        <path d="M313 259v124l142-71V187Z" fill={`url(#${id}-side)`} />
        <path d="M165 182 318 106 468 181 314 259Z" fill="#303656" stroke="#d1c9ff" strokeOpacity=".7" />
        <path d="m181 181 137-68 133 67-137 69Z" fill="#606385" />
        <path d="M230 141V92l89-44 93 47v49l-94 47Z" fill={`url(#${id}-glass)`} />
        <path d="m319 48 93 47v49l-94 47V98Z" fill={`url(#${id}-side)`} />
        <path d="m219 88 100-50 105 53-106 53Z" fill="#555b80" stroke="#b2a4ff" />
        <path d="m238 88 81-40 85 43-86 43Z" fill="#8588a5" />
        <g stroke={`url(#${id}-light)`} strokeWidth="2">
          <path d="m178 214 135 68 142-72M178 273l135 68 142-71M230 116l88 44 94-46" />
          <path d="M203 205v121m28-107v121m28-107v121m28-107v121m50-116v121m30-136v121m30-136v121m30-136v121" strokeOpacity=".45" strokeWidth="1" />
          <path d="m165 182 149 77 154-78m-154 78v124" />
        </g>
        <path d="m241 281 45 23v65l-45-23Z" fill="#101833" stroke="#a69af1" strokeOpacity=".6" />
        <path d="m250 293 25 13v49l-25-13Z" fill="#ad9af5" fillOpacity=".35" />
        <path d="m167 344 143 72 176-88" stroke={`url(#${id}-light)`} strokeWidth="3" />
        <g fill="#90e6d5">
          <path d="m149 297 10-34 10 34-10 6Z" /><path d="m435 348 11-39 12 39-12 6Z" />
        </g>
        <g fill="#151c36" stroke="#7170a2">
          <path d="m145 301 14 7 14-7v13l-14 7-14-7Z" /><path d="m432 353 14 7 15-7v13l-15 7-14-7Z" />
        </g>
      </svg>
      <span className="scene-spark scene-spark-one" />
      <span className="scene-spark scene-spark-two" />
      <span className="scene-coordinate">ENVISION. PREPARE. WELCOME.</span>
    </div>
  );
}
