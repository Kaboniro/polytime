import FunnyFace from "@/components/admin/FunnyFaces";

// Cartoon faces with speech bubbles scattered around the edges of the login
// pages, behind the form (the fixed layer sits at z-index -10, so it never
// covers or intercepts anything). Hidden below the md breakpoint, where there
// is no free space beside the form. All decoration: aria-hidden throughout.
const ITEMS = [
  { mood: "shocked", size: 88, pos: { top: "11%", left: "5%" }, rot: -12, say: "you again?" },
  { mood: "smug", size: 100, pos: { top: "20%", right: "6%" }, rot: 10, say: "we saw that" },
  { mood: "eyeroll", size: 80, pos: { bottom: "17%", left: "9%" }, rot: 8, say: "hurry up, the coffee is cold" },
  { mood: "sweaty", size: 74, pos: { bottom: "10%", right: "11%" }, rot: -8, say: "is this thing on?" },
  { mood: "dizzy", size: 66, pos: { top: "36%", left: "3%" }, rot: 14, say: "whoa. the room moved" },
  { mood: "happy", size: 72, pos: { top: "8%", right: "27%" }, rot: -6, say: "you look great today" },
  { mood: "sleepy", size: 84, pos: { bottom: "5%", left: "30%" }, rot: 6, say: "still here. zzz" },
  { mood: "knockedout", size: 62, pos: { top: "47%", right: "2%" }, rot: -14, say: "i'm fine. totally fine" },
  { mood: "waiting", size: 68, pos: { top: "13%", left: "27%" }, rot: 5, say: "hmmm....." },
];

export default function LoginScatter() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block">
      {ITEMS.map((it, i) => (
        <div key={it.mood} className="absolute flex flex-col items-center gap-1" style={{ ...it.pos, transform: `rotate(${it.rot}deg)` }}>
          <div className="animate-[pt-float_6s_ease-in-out_infinite] motion-reduce:animate-none" style={{ animationDelay: `${-i * 0.9}s` }}>
            <FunnyFace mood={it.mood} size={it.size} />
          </div>
          <span className="max-w-[9.5rem] rounded-2xl border-2 border-neutral-50 bg-neutral-950 px-2.5 py-1 text-center text-xs font-bold leading-snug text-neutral-50 shadow-[2px_2px_0_var(--color-neutral-50)]">
            {it.say}
          </span>
        </div>
      ))}
    </div>
  );
}
