"use client";

import { useEffect, useRef, useState } from "react";
import { ViewportGrid } from "@/components/polytime-ui";

// Fixed brand values — canvas can't read Tailwind classes (see app/globals.css).
const COLORS = ["#fe6d73", "#17c3b2", "#227c9d", "#ffcb77"];
const INK = "#1f2933";

const obstacle = { isStatic: true, friction: 0.05, render: { fillStyle: INK, strokeStyle: INK, lineWidth: 1 } };

// Decorative, draggable physics toy for the negative space beside the submit
// form: an endless avalanche of circles tumbling through ramps, pegs and
// spinning paddles. Cosmetic only — it never touches the form's state.
export default function PhysicsPlayground() {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let timer;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || size.w < 50 || size.h < 50) return;
    let disposed = false;
    let cleanup = () => {};

    import("matter-js").then((mod) => {
      if (disposed) return;
      const Matter = mod.default || mod;
      const { Engine, Render, Runner, Bodies, Body, Composite, Constraint, Events, Mouse, MouseConstraint } = Matter;
      const { w, h } = size;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const engine = Engine.create({ gravity: { y: 0.9 } });
      const render = Render.create({
        element: host,
        engine,
        options: { width: w, height: h, wireframes: false, background: "transparent", pixelRatio: window.devicePixelRatio || 1 },
      });
      render.canvas.style.display = "block";
      render.canvas.style.width = "100%";
      render.canvas.style.height = "100%";

      // Side walls only — the bottom is open so circles fall out through the
      // funnel and get recycled to the top.
      const t = 60;
      const statics = [
        Bodies.rectangle(-t / 2, h / 2, t, h * 3, { isStatic: true, render: { visible: false } }),
        Bodies.rectangle(w + t / 2, h / 2, t, h * 3, { isStatic: true, render: { visible: false } }),
      ];

      const ramp = (cx, cy, len, angle) =>
        Bodies.rectangle(cx, cy, len, 10, { ...obstacle, angle, chamfer: { radius: 5 } });

      // The course is a stack of tiers, each a different kind of obstacle,
      // as many as fit the panel's height (it is as tall as the form beside
      // it), with a funnel exit at the very bottom. Kinds cycle in order so
      // neighbouring tiers never look alike.
      const funnelH = 110;
      const top = 24;
      const tierCount = Math.max(1, Math.round((h - funnelH - top) / 190));
      const tierH = (h - funnelH - top) / tierCount;
      const gap = Math.max(40, Math.min(56, w / 9));
      const rotors = []; // { body, speed } — static bodies turned every tick
      const seesaws = []; // dynamic planks on a pivot, angle-limited
      const bumperStyle = {
        isStatic: true,
        restitution: 1.1,
        render: { fillStyle: "#ffffff", strokeStyle: INK, lineWidth: 4 },
      };

      const tiers = {
        pegs(ty) {
          let row = 0;
          for (let y = ty + tierH * 0.15; y < ty + tierH * 0.85; y += gap * 0.85, row++) {
            const offset = row % 2 ? gap / 2 : 0;
            for (let x = gap / 2 + offset; x < w - gap / 4; x += gap) statics.push(Bodies.circle(x, y, 5, obstacle));
          }
        },
        spinners(ty) {
          const paddle = (x, speed) => {
            const body = Bodies.rectangle(x, ty + tierH * 0.5, w * 0.24, 8, { ...obstacle, chamfer: { radius: 4 } });
            rotors.push({ body, speed });
            statics.push(body);
          };
          paddle(w * 0.3, 1);
          paddle(w * 0.7, -1);
        },
        bumpers(ty) {
          [[0.22, 0.25], [0.78, 0.25], [0.5, 0.5], [0.22, 0.75], [0.78, 0.75]].forEach(([fx, fy]) =>
            statics.push(Bodies.circle(w * fx, ty + tierH * fy, 18, bumperStyle))
          );
        },
        windmill(ty) {
          const len = Math.min(w * 0.42, 170);
          const blade = () => Bodies.rectangle(0, 0, len, 9, { chamfer: { radius: 4 }, render: obstacle.render });
          const b1 = blade();
          const b2 = blade();
          Body.rotate(b2, Math.PI / 2);
          const body = Body.create({ parts: [b1, b2], ...obstacle });
          Body.setPosition(body, { x: w / 2, y: ty + tierH * 0.5 });
          rotors.push({ body, speed: 0.7 });
          statics.push(body);
        },
        seesaws(ty) {
          const plank = (x, y) => {
            const body = Bodies.rectangle(x, y, w * 0.34, 9, {
              density: 0.0002,
              chamfer: { radius: 4 },
              render: { fillStyle: COLORS[0], strokeStyle: INK, lineWidth: 2 },
            });
            statics.push(body, Constraint.create({ pointA: { x, y }, bodyB: body, length: 0, stiffness: 1, render: { visible: false } }));
            seesaws.push(body);
          };
          plank(w * 0.28, ty + tierH * 0.35);
          plank(w * 0.72, ty + tierH * 0.65);
        },
        baffles(ty) {
          [0.2, 0.4, 0.6, 0.8].forEach((fx, k) =>
            statics.push(Bodies.rectangle(w * fx, ty + tierH * 0.5, 9, tierH * 0.55, { ...obstacle, angle: k % 2 ? 0.25 : -0.25, chamfer: { radius: 4 } }))
          );
        },
      };
      const order = ["bumpers", "windmill", "seesaws", "pegs", "spinners", "baffles"];
      for (let i = 0; i < tierCount; i++) tiers[order[i % order.length]](top + i * tierH);

      // Funnel into a narrow exit.
      const exit = 34;
      const fy = h - 62;
      statics.push(ramp(w * 0.25 - exit / 4, fy, w * 0.5 - exit / 2, 0.4));
      statics.push(ramp(w * 0.75 + exit / 4, fy, w * 0.5 - exit / 2, -0.4));
      Composite.add(engine.world, statics);

      const maxBalls = Math.max(70, Math.round(h / 7));
      const balls = new Set();
      const spawn = (x = 12 + Math.random() * (w - 24), y = -20) => {
        const r = 6 + Math.random() * 5;
        const ball = Bodies.circle(x, y, r, {
          restitution: 0.5,
          friction: 0.02,
          render: { fillStyle: COLORS[Math.floor(Math.random() * COLORS.length)], strokeStyle: INK, lineWidth: 1.5 },
        });
        balls.add(ball);
        Composite.add(engine.world, ball);
      };

      let spin = 0;
      Events.on(engine, "beforeUpdate", () => {
        spin += 0.035;
        for (const { body, speed } of rotors) Body.setAngle(body, spin * speed);
        for (const plank of seesaws) {
          if (Math.abs(plank.angle) > 0.45) {
            Body.setAngle(plank, Math.sign(plank.angle) * 0.45);
            Body.setAngularVelocity(plank, 0);
          }
        }
      });
      // Anything that leaves the bottom goes back to the top; extras from
      // "Avalanche" bursts are dropped instead so the count settles.
      Events.on(engine, "afterUpdate", () => {
        for (const b of balls) {
          if (b.position.y > h + 30) {
            if (balls.size > maxBalls) {
              Composite.remove(engine.world, b);
              balls.delete(b);
            } else {
              Body.setPosition(b, { x: 12 + Math.random() * (w - 24), y: -20 });
              Body.setVelocity(b, { x: 0, y: 0 });
            }
          }
        }
      });

      const mouse = Mouse.create(render.canvas);
      // Matter's mouse handler swallows wheel events, which would trap page
      // scrolling whenever the cursor is over the toy.
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
      const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
      Composite.add(engine.world, mc);
      render.mouse = mouse;

      const runner = Runner.create();
      let emitter;
      if (reduced) {
        for (let i = 0; i < maxBalls * 0.6; i++) spawn(12 + Math.random() * (w - 24), -Math.random() * h);
        for (let i = 0; i < 900; i++) Engine.update(engine, 1000 / 60);
      } else {
        for (let i = 0; i < 12; i++) spawn(12 + Math.random() * (w - 24), -Math.random() * h * 0.6);
        emitter = setInterval(() => {
          if (balls.size < maxBalls) spawn();
        }, 140);
        Runner.run(runner, engine);
      }
      Render.run(render);

      apiRef.current = {
        avalanche: () => {
          for (let i = 0; i < 30; i++) spawn(12 + Math.random() * (w - 24), -Math.random() * 120);
        },
        shake: () => {
          for (const b of balls) {
            Body.setVelocity(b, { x: (Math.random() - 0.5) * 16, y: -6 - Math.random() * 10 });
          }
        },
      };

      cleanup = () => {
        apiRef.current = null;
        clearInterval(emitter);
        Render.stop(render);
        Runner.stop(runner);
        Composite.clear(engine.world, false);
        Engine.clear(engine);
        render.canvas.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [size]);

  const btn =
    "rounded-full border border-neutral-700 bg-neutral-950/80 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500/60";

  return (
    <div className="absolute inset-x-0 top-0 -bottom-20">
      <ViewportGrid as="div" gridSize={32} className="relative h-full overflow-hidden">
        <div ref={hostRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" aria-hidden="true" />
        <p className="pointer-events-none absolute left-4 top-3 text-xs uppercase tracking-wide text-neutral-500">
          Grab &amp; throw
        </p>
        <div className="absolute right-3 top-3 flex gap-2">
          <button type="button" onClick={() => apiRef.current?.avalanche()} className={btn}>
            Avalanche
          </button>
          <button type="button" onClick={() => apiRef.current?.shake()} className={btn}>
            Shake
          </button>
        </div>
      </ViewportGrid>
    </div>
  );
}
