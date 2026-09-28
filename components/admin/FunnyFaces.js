// Cartoon faces for the second login step. All original vector drawings made
// of plain SVG shapes (no emoji characters, no external clipart), coloured
// from the site palette so they need no image files and stay crisp at any
// size. `mood` picks the expression; every one is decorative (aria-hidden) —
// the message next to it says the same thing in words.
const INK = "#1f2933";
const PINK = "#fe6d73";
const TEAL = "#17c3b2";
const APRICOT = "#ffcb77";
const BLUE = "#227c9d";
const WHITE = "#ffffff";

const stroke = { stroke: INK, strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" };

function Head({ fill }) {
  return (
    <>
      <circle cx="60" cy="62" r="46" fill={fill} {...stroke} />
      <ellipse cx="34" cy="74" rx="7" ry="4.5" fill={PINK} opacity="0.45" />
      <ellipse cx="86" cy="74" rx="7" ry="4.5" fill={PINK} opacity="0.45" />
    </>
  );
}

const Eye = ({ x, y, r = 4.5 }) => <circle cx={x} cy={y} r={r} fill={INK} />;
const BigEye = ({ x, y, px = 0, py = 0 }) => (
  <>
    <circle cx={x} cy={y} r="11" fill={WHITE} {...stroke} strokeWidth={3} />
    <circle cx={x + px} cy={y + py} r="4.5" fill={INK} />
  </>
);
const Brow = ({ d }) => <path d={d} fill="none" {...stroke} strokeWidth={4} />;

const FACES = {
  // Waiting for the code to be typed.
  waiting: (
    <>
      <Head fill={APRICOT} />
      <Brow d="M30 44q8-6 16-1" />
      <Brow d="M74 41q8-5 16 1" />
      <Eye x="40" y="58" />
      <Eye x="80" y="58" />
      <path d="M46 88q14 5 28 0" fill="none" {...stroke} />
    </>
  ),
  // First miss: unimpressed smirk.
  smug: (
    <>
      <Head fill={TEAL} />
      <Brow d="M28 46l20 4" />
      <Brow d="M72 42q10-8 20-2" />
      <path d="M31 62q9-7 18 0" fill="none" {...stroke} />
      <path d="M71 62q9-7 18 0" fill="none" {...stroke} />
      <path d="M40 60l16 0M70 60l16 0" stroke={INK} strokeWidth="0" />
      <path d="M44 86q18 8 36-6" fill="none" {...stroke} />
      <path d="M80 80l4-5" fill="none" {...stroke} />
    </>
  ),
  // Second miss: genuinely startled.
  shocked: (
    <>
      <Head fill={APRICOT} />
      <Brow d="M28 36q10-8 20-2" />
      <Brow d="M72 34q10-6 20 2" />
      <BigEye x="41" y="55" />
      <BigEye x="79" y="55" />
      <ellipse cx="60" cy="90" rx="9" ry="11" fill={INK} />
    </>
  ),
  // Third miss: the eye roll.
  eyeroll: (
    <>
      <Head fill={PINK} />
      <Brow d="M28 42h20" />
      <Brow d="M72 42h20" />
      <BigEye x="41" y="58" px={2} py={-6} />
      <BigEye x="79" y="58" px={2} py={-6} />
      <path d="M44 90h32" fill="none" {...stroke} />
    </>
  ),
  // Fourth miss: sweating.
  sweaty: (
    <>
      <Head fill={APRICOT} />
      <Brow d="M28 40l18-6" />
      <Brow d="M74 34l18 6" />
      <Eye x="41" y="58" r="5" />
      <Eye x="79" y="58" r="5" />
      <path d="M42 90q6-7 12 0t12 0t12 0" fill="none" {...stroke} />
      <path d="M100 30q7 11 0 17q-7-6 0-17z" fill={BLUE} {...stroke} strokeWidth={3} />
    </>
  ),
  // Fifth miss: spinning.
  dizzy: (
    <>
      <Head fill={TEAL} />
      <path d="M41 58m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-8 0a8 8 0 1 1 14 0" fill="none" {...stroke} strokeWidth={3} />
      <path d="M79 58m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-8 0a8 8 0 1 1 14 0" fill="none" {...stroke} strokeWidth={3} />
      <path d="M42 88q9-6 18 0t18 0" fill="none" {...stroke} />
      <path d="M52 92q8 14 16 0z" fill={PINK} {...stroke} strokeWidth={3} />
    </>
  ),
  // Locked out.
  knockedout: (
    <>
      <Head fill={PINK} />
      <path d="M32 50l16 16M48 50L32 66" fill="none" {...stroke} />
      <path d="M72 50l16 16M88 50L72 66" fill="none" {...stroke} />
      <path d="M42 88h36" fill="none" {...stroke} />
      <path d="M52 88v8a8 8 0 0 0 16 0v-8" fill={PINK} {...stroke} strokeWidth={3} />
      <rect x="66" y="22" width="26" height="12" rx="3" fill={WHITE} {...stroke} strokeWidth={3} transform="rotate(-18 79 28)" />
      <path d="M79 22v12M73 28h12" stroke={INK} strokeWidth="2.5" transform="rotate(-18 79 28)" />
    </>
  ),
  // Code accepted.
  happy: (
    <>
      <Head fill={TEAL} />
      <path d="M31 60q9-11 18 0" fill="none" {...stroke} />
      <path d="M71 60q9-11 18 0" fill="none" {...stroke} />
      <path d="M38 80q22 24 44 0z" fill={WHITE} {...stroke} />
    </>
  ),
  // Code expired: asleep.
  sleepy: (
    <>
      <Head fill={APRICOT} />
      <path d="M31 60q9 8 18 0" fill="none" {...stroke} />
      <path d="M71 60q9 8 18 0" fill="none" {...stroke} />
      <ellipse cx="60" cy="90" rx="6" ry="5" fill={INK} />
      <text x="88" y="30" fontSize="20" fontWeight="800" fill={INK} fontFamily="ui-sans-serif, system-ui, sans-serif">z</text>
      <text x="100" y="18" fontSize="14" fontWeight="800" fill={INK} fontFamily="ui-sans-serif, system-ui, sans-serif">z</text>
    </>
  ),
};

export default function FunnyFace({ mood = "waiting", size = 120, className = "" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      {FACES[mood] || FACES.waiting}
    </svg>
  );
}

export const WRONG_MOODS = ["smug", "shocked", "eyeroll", "sweaty", "dizzy"];
