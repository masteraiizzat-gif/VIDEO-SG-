// Generates index.html + compositions/*.html for the "MTT Anthem — Malaysia Therapists Team, Singapore 2026" film.
// Edit build/timeline.json (durations, order, entrance styles), then: node build/build.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "build/timeline.json"), "utf8"));
const W = 1080, H = 1350, FPS = 30;
const r3 = (n) => Math.round(n * 1000) / 1000;
const snap = (t) => Math.round(t * FPS) / FPS; // keep every boundary on a frame

// ---------------------------------------------------------------- shared CSS
const FONTS = `
@font-face{font-family:"Cinzel";src:url("assets/fonts/cinzel-latin.woff2") format("woff2");font-weight:400 900;}
@font-face{font-family:"Anton";src:url("assets/fonts/anton-latin.woff2") format("woff2");font-weight:400;}
@font-face{font-family:"MontserratX";src:url("assets/fonts/montserrat-latin.woff2") format("woff2");font-weight:100 900;}`;
const GOLD = `background:linear-gradient(180deg,#fff7d1 0%,#ffd970 30%,#d79b22 55%,#ffe7a0 75%,#b47a12 100%);-webkit-background-clip:text;background-clip:text;color:transparent;`;

// ---------------------------------------------------------------- poster scene
// Poster image is 2:3. It is shown 900x1350, centred, over a pre-blurred copy of itself.
// The poster is cut into horizontal bands (fractions of its height) so each band can move on its own.
const BANDS = {
  hero: [0, 34.6],
  name: [34.6, 40.6],
  tahniah: [40.6, 50.8],
  country: [50.8, 68.6],
  event: [68.6, 76.6],
  foot: [76.6, 100],
};
const STRIPS = [[0, 33.34], [33.33, 66.67], [66.66, 100]];

function posterScene(p, i, total) {
  const id = `p${String(i + 1).padStart(2, "0")}`;
  const D = p.dur;
  const cw = p.cw || 900, cl = (W - cw) / 2;
  const bandDivs = Object.entries(BANDS)
    .map(([k, [a, b]]) => `<div class="band" id="${id}-${k}" style="clip-path:inset(${a}% 0 ${r3(100 - b)}% 0);background-image:url('assets/posters/${p.file}')"></div>`)
    .join("\n          ");
  const stripDivs = STRIPS.map(([a, b], k) => `<div class="strip" id="${id}-s${k}" style="clip-path:inset(0 ${r3(100 - b)}% 0 ${a}%);background-image:url('assets/posters/${p.file}')"></div>`).join("\n          ");
  const useStrips = p.enter === "slice";
  const counter = String(i + 1).padStart(2, "0");

  // entrance
  let enter = "";
  const q = (s) => `"#${id}-${s}"`;
  switch (p.enter) {
    case "assemble":
      enter = `
    tl.fromTo(${q("hero")},{y:-70,scale:1.14,opacity:0},{y:0,scale:1,opacity:1,duration:0.5,ease:"expo.out"},0.0);
    tl.fromTo(${q("name")},{clipPath:"inset(${BANDS.name[0]}% 100% ${r3(100 - BANDS.name[1])}% 0%)"},{clipPath:"inset(${BANDS.name[0]}% 0% ${r3(100 - BANDS.name[1])}% 0%)",duration:0.35,ease:"power3.out"},0.1);
    tl.fromTo(${q("tahniah")},{scale:1.9,opacity:0},{scale:1,opacity:1,duration:0.25,ease:"power4.in"},0.25);
    shake(0.5);
    tl.fromTo(${q("country")},{y:46,opacity:0},{y:0,opacity:1,duration:0.45,ease:"expo.out"},0.48);
    tl.fromTo(${q("event")},{y:46,opacity:0},{y:0,opacity:1,duration:0.45,ease:"expo.out"},0.56);
    tl.fromTo(${q("foot")},{y:60,opacity:0},{y:0,opacity:1,duration:0.5,ease:"expo.out"},0.64);`;
      break;
    case "face":
      enter = `
    tl.fromTo("#${id}-cam",{scale:2.15,y:300},{scale:2.05,y:290,duration:0.32,ease:"none"},0);
    tl.to("#${id}-cam",{scale:1,y:0,duration:0.75,ease:"power3.inOut"},0.32);
    tl.fromTo("#${id}-card",{filter:"blur(0px)"},{filter:"blur(5px)",duration:0.3,ease:"power2.in"},0.38);
    tl.to("#${id}-card",{filter:"blur(0px)",duration:0.35,ease:"power2.out"},0.68);`;
      break;
    case "slice":
      enter = `
    tl.fromTo(${q("s0")},{y:-1400},{y:0,duration:0.5,ease:"expo.out"},0.0);
    tl.fromTo(${q("s1")},{y:1400},{y:0,duration:0.5,ease:"expo.out"},0.07);
    tl.fromTo(${q("s2")},{y:-1400},{y:0,duration:0.5,ease:"expo.out"},0.14);
    shake(0.3);`;
      break;
    case "whip":
      enter = `
    tl.fromTo("#${id}-cam",{x:980,filter:"blur(16px)"},{x:0,filter:"blur(0px)",duration:0.42,ease:"expo.out"},0);`;
      break;
    case "zoomin":
      enter = `
    tl.fromTo("#${id}-cam",{scale:0.62,opacity:0,filter:"blur(14px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:0.5,ease:"expo.out"},0);`;
      break;
    case "flip":
      enter = `
    tl.fromTo("#${id}-card",{rotationY:-92,transformPerspective:1400},{rotationY:0,transformPerspective:1400,duration:0.62,ease:"back.out(1.3)"},0);`;
      break;
    case "drop":
      enter = `
    tl.fromTo("#${id}-cam",{y:-1350,filter:"blur(14px)"},{y:0,filter:"blur(0px)",duration:0.5,ease:"expo.out"},0);
    shake(0.34);`;
      break;
  }
  // flash-in when the previous scene left on a flash
  const flashIn = p.flashIn ? `tl.fromTo("#${id}-flash",{opacity:1},{opacity:0,duration:0.22,ease:"power2.out"},0);` : `tl.set("#${id}-flash",{opacity:0},0);`;

  // exit (last frames), matched to the next scene's entrance
  const xs = r3(D - 0.2);
  let exit = "";
  switch (p.exit) {
    case "whip":
      exit = `tl.to("#${id}-cam",{x:-980,filter:"blur(16px)",duration:0.2,ease:"power3.in"},${xs});`;
      break;
    case "zoom":
      exit = `tl.to("#${id}-cam",{scale:1.6,opacity:0,filter:"blur(12px)",duration:0.2,ease:"power3.in"},${xs});`;
      break;
    case "flash":
      exit = `tl.to("#${id}-flash",{opacity:1,duration:0.14,ease:"power2.in"},${r3(D - 0.15)});`;
      break;
    case "flipout":
      exit = `tl.to("#${id}-card",{rotationY:92,transformPerspective:1400,duration:0.2,ease:"power3.in"},${xs});`;
      break;
    case "drop":
      exit = `tl.to("#${id}-cam",{y:1350,filter:"blur(14px)",duration:0.2,ease:"power3.in"},${xs});`;
      break;
    default:
      exit = "";
  }
  const sweepAt = r3(p.sweepAt ?? 0.95);

  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#040a22;}
    #${id}-bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #${id}-shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(4,10,34,0) 40%,rgba(2,5,18,.75) 100%);}
    #${id}-cam{position:absolute;inset:0;}
    #${id}-card{position:absolute;left:${cl}px;top:0;width:${cw}px;height:1350px;overflow:hidden;box-shadow:0 0 60px rgba(255,200,80,.35);}
    #root .band,#root .strip{position:absolute;inset:0;background-size:${cw}px 1350px;background-repeat:no-repeat;}
    #${id}-pun{position:absolute;inset:0;transform-origin:50% 30%;}
    #${id}-shk{position:absolute;inset:0;}
    #${id}-tahniah{transform-origin:50% 45.7%;}
    #${id}-sweep{position:absolute;top:-25%;left:0;width:300px;height:150%;background:linear-gradient(90deg,rgba(255,240,200,0) 0%,rgba(255,244,210,.55) 50%,rgba(255,240,200,0) 100%);mix-blend-mode:screen;}
    #${id}-edgeL,#${id}-edgeR{position:absolute;top:0;width:3px;height:1350px;background:linear-gradient(180deg,rgba(255,215,110,0),#ffd56a 20%,#fff1b8 50%,#ffd56a 80%,rgba(255,215,110,0));}
    #${id}-edgeL{left:${cl - 3}px;} #${id}-edgeR{left:${cl + cw}px;}
    #${id}-tag{position:absolute;right:12px;top:22px;width:66px;font:800 26px/1 "MontserratX",sans-serif;color:#ffe08a;text-align:center;letter-spacing:.02em;}
    #${id}-tag small{display:block;font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;}
    #${id}-flash{position:absolute;inset:0;background:#fff8e6;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <img id="${id}-bgimg" src="assets/bg/${p.file}" alt=""/>
    <div id="${id}-shade"></div>
    <div id="${id}-cam" data-layout-allow-overflow><div id="${id}-pun" data-layout-allow-overflow><div id="${id}-shk" data-layout-allow-overflow>
      <div id="${id}-edgeL"></div><div id="${id}-edgeR"></div>
      <div id="${id}-card" data-layout-allow-overflow>
        ${useStrips ? stripDivs : bandDivs}
        <div id="${id}-sweep"></div>
      </div>
    </div></div></div>
    <div id="${id}-tag" data-layout-ignore>${counter}<small>/${total}</small></div>
    <div id="${id}-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    const shake = (t) => {
      tl.fromTo("#${id}-shk",{x:0,y:0},{x:-14,y:9,duration:0.034,ease:"none"},t)
        .to("#${id}-shk",{x:11,y:-8,duration:0.034,ease:"none"},t+0.034)
        .to("#${id}-shk",{x:-6,y:4,duration:0.034,ease:"none"},t+0.068)
        .to("#${id}-shk",{x:0,y:0,duration:0.05,ease:"power2.out"},t+0.102);
    };
    ${flashIn}
    tl.fromTo("#${id}-tag",{opacity:0,y:-10},{opacity:1,y:0,duration:0.3,ease:"expo.out"},0.35);
    ${enter}
    tl.fromTo("#${id}-sweep",{x:-420,rotation:16},{x:1300,rotation:16,duration:0.85,ease:"power2.inOut"},${sweepAt});
    tl.fromTo("#${id}-bgimg",{scale:1.08},{scale:1.0,duration:${r3(D)},ease:"none"},0);
    ${p.punchAt ? `tl.fromTo("#${id}-pun",{scale:1},{scale:${p.punch || 1.22},duration:0.38,ease:"power3.inOut"},${r3(p.punchAt)});
    tl.to("#${id}-pun",{scale:1,duration:0.42,ease:"power3.inOut"},${r3(Math.min(p.punchAt + 1.1, D - 0.75))});` : ""}
    ${exit}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- gold dust overlay (whole film)
function dustScene(D) {
  const N = 42;
  const dots = Array.from({ length: N }, (_, n) => `<i id="dust-${n}"></i>`).join("");
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
    #root i{position:absolute;left:0;top:0;width:6px;height:6px;border-radius:50%;background:#fff1b8;box-shadow:0 0 10px 3px rgba(255,200,90,.75);}
  </style>
  <div id="root" data-composition-id="dust" data-width="${W}" data-height="${H}" data-layout-ignore>
    ${dots}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    let seed = 777; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < ${N}; n++) {
      const x = rnd() * ${W}, y0 = rnd() * ${H} + 200, rise = 500 + rnd() * 900, s = 0.4 + rnd() * 1.1;
      const el = "#dust-" + n;
      tl.fromTo(el, {x: x, y: y0, scale: s}, {x: x + (rnd() - 0.5) * 160, y: y0 - rise, scale: s, duration: ${r3(D)}, ease: "none"}, 0);
      // twinkle: a finite run of fades, phase-shifted per dot
      const period = 1.2 + rnd() * 1.8, phase = rnd() * period;
      const reps = Math.floor((${r3(D)} - phase) / period);
      tl.fromTo(el, {opacity: 0.05}, {opacity: 0.55 + rnd() * 0.4, duration: period / 2, ease: "sine.inOut", yoyo: true, repeat: Math.max(1, reps * 2 - 1)}, phase);
    }
    window.__timelines["dust"] = tl;
  </script>
</template>
`;
}


// ================================================================ MTT anthem scenes
// All config times in build/timeline.json are SONG times (seconds into the anthem file).
// Video time = song time - cfg.offset. Scene boundaries snap to the detected beat grid.

const LOGO = "assets/posters/mtt-logo.jpg";
const LOGO_CSS = `-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 72%,transparent 100%);mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 72%,transparent 100%);`;
const RAYS = `background:repeating-conic-gradient(from 0deg,rgba(255,210,110,.15) 0deg 5deg,rgba(255,210,110,0) 5deg 15deg);`;
const slamTo = (sel, t, from = 1.8, d = 0.18) => `tl.fromTo(${JSON.stringify(sel)},{opacity:0,scale:${from}},{opacity:1,scale:1,duration:${r3(Math.min(d, Math.max(0.04, t)))},ease:"power4.in"},${r3(Math.max(0, t - d))});`;
const shakeOn = (sel, t, a = 14) => `tl.fromTo(${JSON.stringify(sel)},{x:0,y:0},{x:${-a},y:${a * 0.6},duration:0.034,ease:"none"},${r3(t)}).to(${JSON.stringify(sel)},{x:${a * 0.75},y:${-a * 0.5},duration:0.034,ease:"none"},${r3(t + 0.034)}).to(${JSON.stringify(sel)},{x:0,y:0,duration:0.06,ease:"power2.out"},${r3(t + 0.068)});`;
const flashOn = (sel, t, peak = 0.6) => `tl.fromTo(${JSON.stringify(sel)},{opacity:0},{opacity:${peak},duration:0.03,ease:"none"},${r3(Math.max(0, t - 0.03))}).to(${JSON.stringify(sel)},{opacity:0,duration:0.28,ease:"power2.out"},${r3(t)});`;

// ---------------------------------------------------------------- teaser: face wall + strobe
function teaserScene(D, posters, beats) {
  const id = "teaser";
  const tiles = posters.map((p, n) => `<img class="tz-tile" id="tz-t${n}" src="assets/tiles/${p.file}" alt="" style="left:${(n % 3) * 360}px;top:${Math.floor(n / 3) * 225}px"/>`).join("\n      ");
  const B = beats; // local beat times
  const gridEnd = B[Math.min(12, B.length - 1)];
  const strobe = [0, 5, 9, 13, 2, 7, 15, 11].map((k) => posters[k % posters.length]);
  const sItems = strobe.map((p, n) => `<div class="tz-s" id="tz-s${n}"><img class="tz-sbg" src="assets/bg/${p.file}" alt=""/><img class="tz-sp" src="assets/posters/${p.file}" alt="" style="left:${(W - (p.cw || 900)) / 2}px;width:${p.cw || 900}px"/></div>`).join("\n    ");
  // strobe item n occupies 2 beats starting at beat 12 + 2n
  const sT = strobe.map((_, n) => B[Math.min(12 + 2 * n, B.length - 1)]);
  const darkAt = B[Math.min(28, B.length - 1)];
  let js = "";
  // wall: on screen at frame 0; a gold selector hops tile to tile on each beat
  js += `tl.fromTo("#tz-grid",{scale:1.0},{scale:1.12,duration:${r3(gridEnd)},ease:"none"},0);\n`;
  const hop = [4, 9, 1, 13, 7, 16, 3, 11, 0, 14, 6, 10];
  hop.forEach((k, j) => {
    const t = j === 0 ? 0 : (B[j] ?? j * 0.39);
    js += `    tl.set("#tz-sel",{x:${(k % 3) * 360},y:${Math.floor(k / 3) * 225}},${r3(t)});\n`;
    js += `    tl.fromTo("#tz-sel",{scale:1.12,opacity:1},{scale:1,opacity:1,duration:0.2,ease:"expo.out"},${r3(t)});\n`;
    js += `    tl.fromTo("#tz-t${k}",{opacity:1},{opacity:0.55,duration:0.38,ease:"power2.in"},${r3(t)});\n`;
  });
  js += `    tl.fromTo("#tz-l1",{scale:1.15,opacity:1},{scale:1,opacity:1,duration:0.4,ease:"expo.out"},0);\n`;
  js += `    tl.fromTo("#tz-l2",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.2,ease:"power2.out"},0.3);\n`;
  js += `    ${slamTo("#tz-l3", B[5] ?? 2.0, 2.2, 0.2)}\n`;
  js += `    ${shakeOn("#tz-txt", B[5] ?? 2.0)}\n`;
  js += `    ${flashOn("#tz-flash", B[5] ?? 2.0, 0.45)}\n`;
  // zoom through the wall into the strobe
  js += `    tl.to("#tz-wall",{scale:2.6,opacity:0,filter:"blur(12px)",duration:0.3,ease:"power3.in"},${r3(gridEnd - 0.3)});\n`;
  sItems && strobe.forEach((p, n) => {
    const t = sT[n], dir = n % 2 ? -1 : 1;
    js += `    tl.fromTo("#tz-s${n}",{opacity:0},{opacity:1,duration:0.01},${r3(t)});\n`;
    js += `    tl.fromTo("#tz-s${n} .tz-sp",{x:${dir * 260},scale:1.08,filter:"blur(14px)"},{x:0,scale:1,filter:"blur(0px)",duration:0.3,ease:"expo.out"},${r3(t)});\n`;
    const tNext = n + 1 < strobe.length ? sT[n + 1] : darkAt;
    js += `    tl.to("#tz-s${n}",{opacity:0,duration:0.01},${r3(tNext - 0.01)});\n`;
  });
  const words = [["#tz-w0", 0], ["#tz-w1", 3], ["#tz-w2", 6]];
  words.forEach(([sel, k]) => {
    const t = sT[k];
    js += `    ${slamTo(sel, t + 0.18, 2.0, 0.18)}\n`;
    js += `    tl.to(${JSON.stringify(sel)},{opacity:0,filter:"blur(8px)",duration:0.12,ease:"power2.in"},${r3((k + 3 < sT.length ? sT[k + 3] : darkAt) - 0.12)});\n`;
  });
  // darkness before the chant: a light grows in the centre
  js += `    tl.fromTo("#tz-glow",{scale:0.2,opacity:0},{scale:1.4,opacity:1,duration:${r3(D - darkAt)},ease:"power2.in"},${r3(darkAt)});\n`;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#02040f;}
    #tz-wall{position:absolute;inset:0;}
    #tz-grid{position:absolute;left:0;top:0;width:1080px;height:1350px;}
    #root .tz-tile{position:absolute;width:360px;height:225px;opacity:.55;}
    #tz-sel{position:absolute;left:0;top:0;width:360px;height:225px;border:5px solid #ffd66e;box-shadow:0 0 30px rgba(255,200,80,.8),inset 0 0 24px rgba(255,200,80,.5);opacity:0;}
    #tz-dim{position:absolute;inset:0;background:radial-gradient(ellipse 70% 30% at 50% 50%,rgba(2,4,15,.92) 0%,rgba(2,4,15,.6) 60%,rgba(2,4,15,.2) 100%);}
    #tz-txt{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #tz-l1{position:absolute;left:0;top:470px;width:${W}px;text-align:center;font:900 210px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 6px 0 #5a3a05) drop-shadow(0 0 36px rgba(255,190,60,.5));}
    #tz-l2{position:absolute;left:0;top:700px;width:${W}px;text-align:center;font:800 40px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.24em;padding-left:.24em;}
    #tz-l3{position:absolute;left:0;top:775px;width:${W}px;text-align:center;font:400 96px/1 "Anton",sans-serif;color:#fff;text-shadow:0 6px 0 #b3001b,0 0 40px rgba(255,40,60,.5);}
    #root .tz-s{position:absolute;inset:0;opacity:0;}
    #root .tz-sbg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #root .tz-sp{position:absolute;top:0;height:1350px;box-shadow:0 0 60px rgba(255,200,80,.35);}
    #tz-words{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #root .tz-w{position:absolute;left:0;top:500px;width:${W}px;padding:40px 0;background:linear-gradient(180deg,rgba(3,6,20,0),rgba(3,6,20,.82) 18%,rgba(3,6,20,.82) 82%,rgba(3,6,20,0));text-align:center;font:400 150px/1.05 "Anton",sans-serif;color:#fff;letter-spacing:.02em;text-shadow:0 8px 0 #b3001b,0 0 50px rgba(0,0,0,.9),0 0 90px rgba(0,0,0,.8);opacity:0;}
    #tz-glow{position:absolute;left:140px;top:275px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(255,236,170,.95) 0%,rgba(255,190,70,.45) 30%,rgba(255,170,40,0) 70%);opacity:0;}
    #tz-flash{position:absolute;inset:0;background:#fff6dc;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <div id="tz-wall" data-layout-allow-overflow>
      <div id="tz-grid">
      ${tiles}
      <div id="tz-sel"></div>
      </div>
      <div id="tz-dim"></div>
      <div id="tz-txt" data-layout-allow-overflow>
        <div id="tz-l1">18 WIRA</div>
        <div id="tz-l2">MALAYSIA THERAPISTS TEAM</div>
        <div id="tz-l3">KE SINGAPORE 2026!</div>
      </div>
    </div>
    ${sItems}
    <div id="tz-words" data-layout-allow-overlap>
      <div class="tz-w" id="tz-w0">SATU<br/>PASUKAN.</div>
      <div class="tz-w" id="tz-w1">SATU<br/>MISI.</div>
      <div class="tz-w" id="tz-w2">SATU<br/>MALAYSIA!</div>
    </div>
    <div id="tz-glow" data-layout-ignore></div>
    <div id="tz-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- chant: "Malaysia / Therapists / Team / Kami Juara!" on the vocal
function chantScene(D, w) {
  const id = "chant";
  let js = "";
  js += `tl.fromTo("#ch-rays",{rotation:0},{rotation:${r3(D * 6)},duration:${r3(D)},ease:"none"},0);\n`;
  js += `    tl.fromTo("#ch-flash",{opacity:1},{opacity:0,duration:0.35,ease:"power2.out"},0);\n`;
  js += `    tl.fromTo("#ch-logo",{scale:0.55,opacity:0,filter:"blur(12px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:0.55,ease:"expo.out"},0);\n`;
  js += `    tl.fromTo("#ch-logo",{y:0},{y:-10,duration:${r3(w[3] - 0.85)},ease:"sine.inOut"},0.55);\n`;
  js += `    ${slamTo("#ch-w0", w[0], 1.9)}\n    ${shakeOn("#ch-stack", w[0], 10)}\n`;
  js += `    ${slamTo("#ch-w1", w[1], 1.9)}\n    ${shakeOn("#ch-stack", w[1], 8)}\n`;
  js += `    ${slamTo("#ch-w2", w[2], 2.1)}\n    ${shakeOn("#ch-stack", w[2], 12)}\n    ${flashOn("#ch-flash", w[2], 0.35)}\n`;
  // "KAMI" — the stack clears, the logo lifts
  js += `    tl.to("#ch-stack",{opacity:0,filter:"blur(10px)",scale:1.15,duration:0.16,ease:"power2.in"},${r3(w[3] - 0.16)});\n`;
  js += `    tl.to("#ch-logo",{scale:0.72,y:-120,duration:0.45,ease:"power3.inOut"},${r3(w[3] - 0.2)});\n`;
  js += `    ${slamTo("#ch-kami", w[3], 1.7)}\n`;
  js += `    ${slamTo("#ch-juara", w[4], 2.6, 0.2)}\n    ${shakeOn("#ch-root2", w[4], 18)}\n    ${flashOn("#ch-flash", w[4], 0.7)}\n`;
  js += `    tl.fromTo("#ch-burst",{scale:0.3,opacity:0},{scale:1.6,opacity:0.9,duration:0.25,ease:"expo.out"},${r3(w[4])}).to("#ch-burst",{opacity:0,duration:0.6,ease:"power2.out"},${r3(w[4] + 0.25)});\n`;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#13286e 0%,#060c2c 50%,#02040f 100%);}
    #ch-rays{position:absolute;left:-560px;top:-725px;width:2200px;height:2200px;border-radius:50%;${RAYS}}
    #ch-root2{position:absolute;inset:0;}
    #ch-logo{position:absolute;left:150px;top:150px;width:780px;height:461px;${LOGO_CSS}}
    #ch-stack{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #ch-w0{position:absolute;left:0;top:650px;width:${W}px;text-align:center;font:900 150px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 6px 0 #5a3a05) drop-shadow(0 0 30px rgba(255,190,60,.45));}
    #ch-w1{position:absolute;left:0;top:820px;width:${W}px;text-align:center;font:900 118px/1 "Cinzel",serif;color:#fff;text-shadow:0 6px 0 #1d2e7a,0 0 30px rgba(120,160,255,.4);}
    #ch-w2{position:absolute;left:0;top:960px;width:${W}px;text-align:center;font:900 150px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 6px 0 #5a3a05) drop-shadow(0 0 30px rgba(255,190,60,.45));}
    #ch-kami{position:absolute;left:0;top:560px;width:${W}px;text-align:center;font:400 170px/1 "Anton",sans-serif;color:#fff;letter-spacing:.06em;text-shadow:0 8px 0 #b3001b,0 0 40px rgba(255,40,60,.5);}
    #ch-juara{position:absolute;left:0;top:745px;width:${W}px;text-align:center;font:900 220px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 8px 0 #5a3a05) drop-shadow(0 0 50px rgba(255,190,60,.6));}
    #ch-burst{position:absolute;left:40px;top:340px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(255,240,190,.9) 0%,rgba(255,200,80,.35) 35%,rgba(255,170,40,0) 70%);opacity:0;mix-blend-mode:screen;}
    #ch-flash{position:absolute;inset:0;background:#fff6dc;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <div id="ch-rays" data-layout-ignore></div>
    <div id="ch-burst" data-layout-ignore></div>
    <div id="ch-root2" data-layout-allow-overflow>
      <img id="ch-logo" src="${LOGO}" alt=""/>
      <div id="ch-stack" data-layout-allow-overlap>
        <div id="ch-w0">MALAYSIA</div>
        <div id="ch-w1">THERAPISTS</div>
        <div id="ch-w2">TEAM</div>
      </div>
      <div id="ch-kami">KAMI</div>
      <div id="ch-juara">JUARA!</div>
    </div>
    <div id="ch-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    tl.to("#ch-root2",{scale:2.2,opacity:0,filter:"blur(12px)",duration:0.25,ease:"power3.in"},${r3(D - 0.25)});
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- event card
function eventScene(D) {
  const id = "event";
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #ev-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.7;}
    #ev-rays{position:absolute;left:-560px;top:-400px;width:2200px;height:2200px;border-radius:50%;${RAYS}}
    #ev-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(255,196,80,.28) 0%,rgba(10,18,60,0) 45%,rgba(2,5,20,.85) 100%);}
    #ev-b{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #ev-b0{position:absolute;left:0;top:250px;width:${W}px;text-align:center;font:800 36px/1 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.3em;padding-left:.3em;}
    #ev-b1{position:absolute;left:40px;top:320px;width:1000px;text-align:center;font:900 140px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05);}
    #ev-b2{position:absolute;left:40px;top:475px;width:1000px;text-align:center;font:900 66px/1.1 "Cinzel",serif;color:#fff;text-shadow:0 4px 0 #2a3a80;}
    #ev-b3{position:absolute;left:40px;top:565px;width:1000px;text-align:center;font:900 98px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05);}
    #ev-chip{position:absolute;left:300px;top:700px;width:480px;height:84px;border-radius:42px;background:linear-gradient(180deg,#ffe48a,#c88a14);box-shadow:0 0 40px rgba(255,200,80,.55);font:900 48px/84px "Cinzel",serif;color:#1a1204;text-align:center;}
    #ev-c1,#ev-c2{position:absolute;left:70px;width:940px;height:86px;border-radius:14px;border:2px solid #ffd36b;background:rgba(6,14,48,.82);font:800 34px/86px "MontserratX",sans-serif;color:#fff;text-align:center;letter-spacing:.04em;}
    #ev-c1{top:850px;} #ev-c2{top:960px;}
    #ev-c1 b,#ev-c2 b{color:#ffd66e;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <img id="ev-bg" src="assets/bg/mtt18.jpg" alt=""/>
    <div id="ev-rays" data-layout-ignore></div>
    <div id="ev-glow"></div>
    <div id="ev-b">
      <div id="ev-b0">KE PENTAS DUNIA</div>
      <div id="ev-b1">WORLD</div>
      <div id="ev-b2">TRADITIONAL MASSAGE</div>
      <div id="ev-b3">CHAMPIONSHIP</div>
      <div id="ev-chip">SINGAPORE 2026</div>
      <div id="ev-c1"><b>TARIKH:</b> 28 – 29 NOVEMBER 2026</div>
      <div id="ev-c2"><b>VENUE:</b> HOTEL CHANCELLOR @ ORCHARD</div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#ev-rays",{rotation:0},{rotation:${r3(D * 4)},duration:${r3(D)},ease:"none"},0);
    tl.fromTo("#ev-bg",{scale:1.12},{scale:1,duration:${r3(D)},ease:"none"},0);
    tl.fromTo("#ev-b0",{opacity:0,y:-12},{opacity:1,y:0,duration:0.3,ease:"expo.out"},0.05);
    ${slamTo("#ev-b1", 0.35, 1.7, 0.22)}
    tl.fromTo("#ev-b2",{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0px)",duration:0.18,ease:"power2.out"},0.5);
    ${slamTo("#ev-b3", 0.85, 1.7, 0.22)}
    tl.fromTo("#ev-chip",{opacity:0,scale:0.3},{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"},1.15);
    tl.fromTo("#ev-c1",{opacity:0,x:-60},{opacity:1,x:0,duration:0.45,ease:"expo.out"},1.5);
    tl.fromTo("#ev-c2",{opacity:0,x:60},{opacity:1,x:0,duration:0.45,ease:"expo.out"},1.65);
    tl.to("#ev-b",{scale:1.8,opacity:0,filter:"blur(10px)",duration:0.25,ease:"power3.in"},${r3(D - 0.25)});
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- MTT 18 poster tour
function mttGroupScene(D, s) {
  const id = "group";
  const IW = 1448, IH = 1086;
  const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const at = ([px, py], sc) => { const x = cl(px, W / 2 / sc, IW - W / 2 / sc), y = cl(py, H / 2 / sc, IH - H / 2 / sc); return { x: r3(W / 2 - x * sc), y: r3(H / 2 - y * sc), scale: sc }; };
  const fit = { x: 0, y: r3((H - IH * (W / IW)) / 2), scale: r3(W / IW) };
  const K = s.keys; // [{t, p:[x,y], s}]
  let js = `tl.fromTo("#gr-flash",{opacity:1},{opacity:0,duration:0.3,ease:"power2.out"},0);\n`;
  js += `    tl.fromTo("#gr-cam",${JSON.stringify(at(K[0].p, K[0].s * 1.1))},{...${JSON.stringify(at(K[0].p, K[0].s))},duration:${r3(K[1].t - 0.05)},ease:"power2.out"},0);\n`;
  for (let j = 1; j < K.length; j++) {
    const nextT = j + 1 < K.length ? K[j + 1].t : s.pullAt;
    js += `    tl.to("#gr-cam",{...${JSON.stringify(at(K[j].p, K[j].s))},duration:${r3(Math.min(1.15, nextT - K[j].t - 0.05))},ease:"power2.inOut"},${r3(K[j].t)});\n`;
  }
  js += `    tl.to("#gr-cam",{...${JSON.stringify(fit)},duration:${r3(s.land - s.pullAt)},ease:"power3.inOut"},${r3(s.pullAt)});\n`;
  js += `    tl.fromTo("#gr-logo",{opacity:0,scale:0.5},{opacity:1,scale:1,duration:0.45,ease:"back.out(1.6)"},${r3(s.land + 0.1)});\n`;
  js += `    ${slamTo("#gr-t1", s.land + 0.45, 1.8, 0.22)}\n`;
  js += `    tl.fromTo("#gr-t2",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.2,ease:"power2.out"},${r3(s.land + 0.75)});\n`;
  js += `    tl.to("#gr-flash",{opacity:1,duration:0.12,ease:"power2.in"},${r3(D - 0.13)});\n`;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #gr-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #gr-cam{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px;transform-origin:0 0;}
    #gr-img{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px;}
    #gr-top{position:absolute;left:0;top:40px;width:${W}px;height:220px;}
    #gr-logo{position:absolute;left:40px;top:30px;width:250px;height:148px;${LOGO_CSS}}
    #gr-t1{position:absolute;left:250px;top:30px;width:800px;text-align:center;font:900 116px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #gr-t2{position:absolute;left:250px;top:162px;width:800px;text-align:center;font:800 32px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.2em;padding-left:.2em;}
    #gr-flash{position:absolute;inset:0;background:#fff8e6;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <img id="gr-bg" src="assets/bg/mtt18.jpg" alt=""/>
    <div id="gr-cam" data-layout-allow-overflow><img id="gr-img" src="assets/posters/mtt18.jpg" alt=""/></div>
    <div id="gr-top"><img id="gr-logo" src="${LOGO}" alt=""/><div id="gr-t1">TAHNIAH!</div><div id="gr-t2">18 AHLI RASMI MTT</div></div>
    <div id="gr-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- "KAMI JUARA! KAMI JUARA!" full-frame slam
function juaraScene(id, D, w, posters) {
  const imgs = posters.map((p, n) => `<div class="ju-s" id="${id}-s${n}"><img class="ju-bg" src="assets/bg/${p.file}" alt=""/><img class="ju-p" src="assets/posters/${p.file}" alt="" style="left:${(W - (p.cw || 900)) / 2}px;width:${p.cw || 900}px"/></div>`).join("\n    ");
  const labels = ["KAMI", "JUARA!", "KAMI", "JUARA!"];
  let js = "";
  w.forEach((t, n) => {
    const nt = n + 1 < w.length ? w[n + 1] : D;
    js += `tl.fromTo("#${id}-s${n}",{opacity:0},{opacity:1,duration:0.01},${r3(Math.max(0, t - 0.04))});\n`;
    js += `    tl.fromTo("#${id}-s${n} .ju-p",{scale:1.25},{scale:1.05,duration:${r3(nt - t + 0.04)},ease:"power2.out"},${r3(Math.max(0, t - 0.04))});\n`;
    if (n + 1 < w.length) js += `    tl.to("#${id}-s${n}",{opacity:0,duration:0.01},${r3(nt - 0.05)});\n`;
    js += `    ${slamTo(`#${id}-w${n}`, t, n % 2 ? 2.4 : 1.9, 0.16)}\n`;
    if (n + 1 < w.length) js += `    tl.to("#${id}-w${n}",{opacity:0,duration:0.06,ease:"none"},${r3(nt - 0.08)});\n`;
    js += `    ${flashOn(`#${id}-flash`, t, n % 2 ? 0.75 : 0.4)}\n`;
    if (n % 2) js += `    ${shakeOn(`#${id}-txt`, t, 18)}\n`;
  });
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#02040f;}
    #root .ju-s{position:absolute;inset:0;opacity:0;}
    #root .ju-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #root .ju-p{position:absolute;top:0;height:1350px;}
    #${id}-dim{position:absolute;inset:0;background:radial-gradient(ellipse 80% 35% at 50% 50%,rgba(2,4,15,.85) 0%,rgba(2,4,15,.45) 70%,rgba(2,4,15,.3) 100%);}
    #${id}-txt{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #root .ju-k{position:absolute;left:0;top:520px;width:${W}px;text-align:center;font:400 300px/1 "Anton",sans-serif;color:#fff;letter-spacing:.04em;text-shadow:0 10px 0 #b3001b,0 0 60px rgba(0,0,0,.8);opacity:0;}
    #root .ju-j{position:absolute;left:0;top:540px;width:${W}px;text-align:center;font:900 230px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 8px 0 #5a3a05) drop-shadow(0 0 50px rgba(255,190,60,.6));opacity:0;}
    #${id}-flash{position:absolute;inset:0;background:#fff6dc;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    ${imgs}
    <div id="${id}-dim"></div>
    <div id="${id}-txt" data-layout-allow-overlap data-layout-allow-overflow>
      ${labels.map((l, n) => `<div class="${n % 2 ? "ju-j" : "ju-k"}" id="${id}-w${n}">${l}</div>`).join("\n      ")}
    </div>
    <div id="${id}-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    tl.to("#${id}-txt",{scale:2.2,opacity:0,filter:"blur(12px)",duration:0.2,ease:"power3.in"},${r3(D - 0.2)});
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- lyric lower-thirds (chorus lines, on the vocal)
function lyricsScene(D, lines) {
  const id = "lyrics";
  const html = lines.map((L, n) => {
    const chars = L.words.map((w) => w[0]).join(" ").length;
    const fs = Math.min(60, Math.floor(960 / (chars * 0.74)));
    return `<div class="ly-line" id="ly-${n}" style="font-size:${fs}px">${L.words.map((w, k) => `<span class="w" id="ly-${n}-${k}">${w[0]}</span>`).join(" ")}</div>`;
  }).join("\n      ");
  let js = "";
  lines.forEach((L, n) => {
    const t0 = L.words[0][1], t1 = L.end;
    js += `tl.fromTo("#ly-band",{opacity:0,scaleX:0.6},{opacity:1,scaleX:1,duration:0.22,ease:"expo.out"},${r3(Math.max(0, t0 - 0.2))});\n`;
    L.words.forEach((w, k) => {
      js += `    tl.fromTo("#ly-${n}-${k}",{opacity:0,filter:"blur(6px)",y:10},{opacity:1,filter:"blur(0px)",y:0,duration:0.16,ease:"power2.out"},${r3(Math.max(0, w[1] - 0.06))});\n`;
    });
    js += `    tl.to("#ly-${n}",{opacity:0,filter:"blur(6px)",duration:0.16,ease:"power2.in"},${r3(t1 - 0.16)});\n`;
    const next = lines[n + 1];
    if (!next || next.words[0][1] - t1 > 0.6) js += `    tl.to("#ly-band",{opacity:0,duration:0.2,ease:"power2.in"},${r3(t1 - 0.1)});\n`;
  });
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
    #ly-band{position:absolute;left:0;top:1176px;width:${W}px;height:132px;opacity:0;background:linear-gradient(90deg,rgba(3,8,30,0) 0%,rgba(3,8,30,.9) 14%,rgba(3,8,30,.9) 86%,rgba(3,8,30,0) 100%);}
    #ly-band:before,#ly-band:after{content:"";position:absolute;left:8%;width:84%;height:3px;background:linear-gradient(90deg,rgba(255,214,110,0),#ffd66e,rgba(255,214,110,0));}
    #ly-band:before{top:0;} #ly-band:after{bottom:0;}
    #root .ly-line{position:absolute;left:30px;top:1176px;width:1020px;height:132px;line-height:132px;text-align:center;font-family:"Cinzel",serif;font-weight:900;white-space:nowrap;}
    #root .ly-line .w{display:inline-block;opacity:0;${GOLD}filter:drop-shadow(0 3px 0 #4a2f04);}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}" data-layout-allow-caption-zone>
    <div id="ly-band"></div>
      ${html}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- finale: wall → MTT 18 poster → end card
function mttFinaleScene(D, s, posters) {
  const id = "finale";
  const tw = 180, th = 270, top = 270;
  const tiles = posters.map((p, n) => `<div class="fn-tile" id="fn-t${n}" style="left:${(n % 6) * tw}px;top:${Math.floor(n / 6) * th}px;background-image:url('assets/posters/${p.file}')"></div>`).join("\n        ");
  const [w0, w1, w2] = s.words;
  let js = "";
  js += `let seed = 20261128; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;\n`;
  js += `    for (let n = 0; n < ${posters.length}; n++) {\n      const rx = (rnd() - 0.5) * 1400, ry = (rnd() - 0.5) * 1400, rr = (rnd() - 0.5) * 70;\n      tl.fromTo("#fn-t" + n, {x: rx, y: ry, rotation: rr, scale: 0, opacity: 0}, {x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.55, ease: "expo.out"}, ${r3(s.beat)} * Math.floor(n / 2) * 0.5 + 0.05);\n    }\n`;
  js += `    tl.fromTo("#fn-wall",{scale:1},{scale:1.04,duration:${r3(w0 - 0.2)},ease:"none"},0);\n`;
  js += `    ${slamTo("#fn-a1", 1.2, 1.8, 0.22)}\n`;
  js += `    tl.fromTo("#fn-a2",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.2,ease:"power2.out"},1.5);\n`;
  // MALAYSIA — the wall becomes the team poster
  js += `    ${flashOn("#fn-flash", w0, 0.8)}\n`;
  js += `    tl.to(["#fn-wall","#fn-a"],{opacity:0,duration:0.05,ease:"none"},${r3(w0 - 0.05)});\n`;
  js += `    tl.fromTo("#fn-grp",{opacity:0,scale:1.08},{opacity:1,scale:1,duration:0.5,ease:"expo.out"},${r3(w0 - 0.02)});\n`;
  js += `    tl.to("#fn-grp",{scale:1.05,duration:${r3(s.endcard - w0 - 0.6)},ease:"none"},${r3(w0 + 0.5)});\n`;
  js += `    ${slamTo("#fn-m", w0, 2.0)}\n    ${shakeOn("#fn-topt", w0, 12)}\n`;
  js += `    tl.to("#fn-m",{opacity:0,filter:"blur(8px)",duration:0.12,ease:"power2.in"},${r3(w1 - 0.14)});\n`;
  js += `    ${slamTo("#fn-k", w1, 1.7)}\n`;
  js += `    ${slamTo("#fn-j", w2, 2.4, 0.2)}\n    ${shakeOn("#fn-topt", w2, 16)}\n    ${flashOn("#fn-flash", w2, 0.5)}\n`;
  js += `    tl.to(["#fn-k","#fn-j"],{opacity:0,filter:"blur(8px)",duration:0.15,ease:"power2.in"},${r3(w2 + 2.6)});\n`;
  js += `    ${slamTo("#fn-tah", w2 + 2.9, 1.8, 0.22)}\n`;
  js += `    tl.fromTo("#fn-b .w",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.14,stagger:0.09,ease:"power2.out"},${r3(w2 + 1.0)});\n`;
  // end card
  const E = s.endcard;
  js += `    tl.to(["#fn-grp","#fn-topt","#fn-b"],{scale:1.8,opacity:0,filter:"blur(12px)",duration:0.3,ease:"power3.in"},${r3(E - 0.3)});\n`;
  js += `    tl.fromTo("#fn-end",{opacity:0},{opacity:1,duration:0.2,ease:"none"},${r3(E - 0.05)});\n`;
  js += `    tl.fromTo("#fn-rays",{rotation:0},{rotation:${r3((D - E) * 5)},duration:${r3(D - E)},ease:"none"},${r3(E)});\n`;
  js += `    tl.fromTo("#fn-elogo",{scale:0.5,opacity:0,filter:"blur(12px)"},{scale:1,opacity:1,filter:"blur(0px)",duration:0.6,ease:"expo.out"},${r3(E)});\n`;
  js += `    ${slamTo("#fn-e1", E + 0.7, 1.7, 0.22)}\n`;
  js += `    tl.fromTo("#fn-e2",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.25,ease:"power2.out"},${r3(E + 1.2)});\n`;
  js += `    tl.fromTo("#fn-e3",{opacity:0,y:20},{opacity:1,y:0,duration:0.45,ease:"expo.out"},${r3(E + 1.8)});\n`;
  js += `    tl.fromTo("#fn-e4",{opacity:0,y:20},{opacity:1,y:0,duration:0.45,ease:"expo.out"},${r3(E + 2.1)});\n`;
  js += `    ${slamTo("#fn-boleh", s.boleh, 2.3, 0.2)}\n    ${shakeOn("#fn-end", s.boleh, 14)}\n    ${flashOn("#fn-flash", s.boleh, 0.6)}\n`;
  js += `    tl.fromTo("#fn-sweep",{x:-500,rotation:16},{x:1500,rotation:16,duration:1.1,ease:"power2.inOut"},${r3(E + 2.6)});\n`;
  js += `    tl.fromTo("#fn-sweep",{x:-500,rotation:16},{x:1500,rotation:16,duration:1.1,ease:"power2.inOut"},${r3(E + 5.2)});\n`;
  js += `    tl.fromTo("#fn-elogo",{scale:1},{scale:1.06,duration:${r3(s.boleh - E - 0.6)},ease:"power1.inOut"},${r3(E + 0.6)});\n`;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #fn-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #fn-wall{position:absolute;left:0;top:${top}px;width:1080px;height:810px;}
    #root .fn-tile{position:absolute;width:${tw}px;height:${th}px;background-size:cover;background-position:50% 0;}
    #fn-a{position:absolute;inset:0;}
    #fn-a1{position:absolute;left:0;top:70px;width:${W}px;text-align:center;font:900 140px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #fn-a2{position:absolute;left:0;top:1150px;width:${W}px;text-align:center;font:800 40px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.2em;padding-left:.2em;}
    #fn-grp{position:absolute;left:0;top:${top}px;width:1080px;height:810px;opacity:0;}
    #fn-topt{position:absolute;left:0;top:0;width:${W}px;height:${top}px;}
    #fn-m,#fn-tah{position:absolute;left:0;top:70px;width:${W}px;text-align:center;font:900 140px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));opacity:0;}
    #fn-k{position:absolute;left:20px;top:80px;width:330px;text-align:right;font:400 130px/1 "Anton",sans-serif;color:#fff;text-shadow:0 6px 0 #b3001b;opacity:0;}
    #fn-j{position:absolute;left:385px;top:66px;width:680px;text-align:left;font:900 140px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 6px 0 #5a3a05) drop-shadow(0 0 30px rgba(255,190,60,.5));opacity:0;}
    #fn-b{position:absolute;left:20px;top:1125px;width:1040px;text-align:center;font:800 34px/1.45 "MontserratX",sans-serif;color:#fff;letter-spacing:.04em;}
    #fn-end{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at 50% 38%,#13286e 0%,#060c2c 50%,#02040f 100%);}
    #fn-rays{position:absolute;left:-560px;top:-600px;width:2200px;height:2200px;border-radius:50%;${RAYS}}
    #fn-elogo{position:absolute;left:170px;top:120px;width:740px;height:437px;${LOGO_CSS}}
    #fn-e1{position:absolute;left:0;top:600px;width:${W}px;text-align:center;font:900 84px/1.1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05);}
    #fn-e2{position:absolute;left:0;top:800px;width:${W}px;text-align:center;font:800 32px/1 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.22em;padding-left:.22em;}
    #fn-e3{position:absolute;left:90px;top:870px;width:900px;height:84px;border-radius:42px;background:linear-gradient(180deg,#ffe48a,#c88a14);font:900 28px/84px "Cinzel",serif;color:#1a1204;text-align:center;box-shadow:0 0 40px rgba(255,200,80,.5);white-space:nowrap;}
    #fn-e4{position:absolute;left:0;top:985px;width:${W}px;text-align:center;font:800 32px/1.4 "MontserratX",sans-serif;color:#fff;letter-spacing:.06em;}
    #fn-boleh{position:absolute;left:0;top:1090px;width:${W}px;text-align:center;font:400 120px/1 "Anton",sans-serif;color:#fff;letter-spacing:.04em;text-shadow:0 7px 0 #b3001b,0 0 40px rgba(255,40,60,.5);opacity:0;}
    #fn-flash{position:absolute;inset:0;background:#fff6dc;opacity:0;}
    #fn-sweep{position:absolute;top:-10%;left:0;width:320px;height:120%;background:linear-gradient(90deg,rgba(255,240,200,0),rgba(255,244,210,.35),rgba(255,240,200,0));mix-blend-mode:screen;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <img id="fn-bg" src="assets/bg/mtt18.jpg" alt=""/>
    <div id="fn-wall" data-layout-allow-overflow>
        ${tiles}
    </div>
    <div id="fn-a"><div id="fn-a1">18 WIRA</div><div id="fn-a2">MALAYSIA THERAPISTS TEAM</div></div>
    <img id="fn-grp" src="assets/posters/mtt18.jpg" alt=""/>
    <div id="fn-topt" data-layout-allow-overlap data-layout-allow-overflow>
      <div id="fn-m">MALAYSIA</div>
      <div id="fn-k">KAMI</div><div id="fn-j">JUARA!</div>
      <div id="fn-tah">TAHNIAH!</div>
    </div>
    <div id="fn-b"><span class="w">SEMOGA</span> <span class="w">PULANG</span> <span class="w">DENGAN</span> <span class="w">KEJAYAAN</span><br/><span class="w">DAN</span> <span class="w">MENGHARUMKAN</span> <span class="w">NEGARA</span> <span class="w">YANG</span> <span class="w">TERCINTA</span></div>
    <div id="fn-end" data-layout-allow-overflow>
      <div id="fn-rays" data-layout-ignore></div>
      <img id="fn-elogo" src="${LOGO}" alt=""/>
      <div id="fn-e1">MALAYSIA<br/>THERAPISTS TEAM</div>
      <div id="fn-e2">ONE TOUCH, A THOUSAND HARMONY</div>
      <div id="fn-e3">WORLD TRADITIONAL MASSAGE CHAMPIONSHIP</div>
      <div id="fn-e4">SINGAPORE · 28 – 29 NOVEMBER 2026<br/>HOTEL CHANCELLOR @ ORCHARD</div>
      <div id="fn-boleh">MALAYSIA BOLEH!</div>
      <div id="fn-sweep" data-layout-ignore></div>
    </div>
    <div id="fn-flash" data-layout-ignore></div>

  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ================================================================ assemble
const OFF = cfg.offset;
const beatsSong = JSON.parse(fs.readFileSync(path.join(ROOT, "build/beats.json"), "utf8")).beatTimes;
const nearBeat = (t) => beatsSong.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a), beatsSong[0]);
const V = (song) => snap(song - OFF); // song time → video time (frame-snapped)
const SC = cfg.scenes;
const bnd = (k) => [k === "teaser" ? OFF : nearBeat(SC[k][0]), k === "finale" ? cfg.end : nearBeat(SC[k][1])];
const posters = cfg.posters;
const scenes = [];
const add = (id, s0, s1, html) => { const start = V(s0), end = V(s1); scenes.push({ id, start, dur: snap(end - start), html, s0 }); return { start, dur: snap(end - start), s0 }; };
const localBeats = (s0, s1) => beatsSong.filter((b) => b >= s0 - 1e-3 && b < s1).map((b) => r3(b - s0));

// teaser, chant, event
{ const [a, b] = bnd("teaser"); add("teaser", a, b, teaserScene(snap(b - a), posters, localBeats(a, b))); }
{ const [a, b] = [nearBeat(SC.chant[0]), nearBeat(SC.chant[1])]; add("chant", a, b, chantScene(snap(b - a), cfg.chant.words.map((w) => r3(w - a)))); }
{ const [a, b] = bnd("event"); add("event", a, b, eventScene(snap(b - a))); }
// group tour
{
  const [a, b] = bnd("group"); const g = cfg.group;
  add("group", a, b, mttGroupScene(snap(b - a), { keys: g.keys.map((k) => ({ t: r3(nearBeat(a + k.t) - a), p: k.p, s: k.s })), pullAt: r3(nearBeat(g.pullAt) - a), land: r3(g.land - a) }));
}
// posters and the two "Kami juara" slams
const juaraPick = (k) => [0, 1, 2, 3].map((n) => posters[(k + n * 5) % posters.length]);
const posterStarts = [];
function posterRun(list, idx0, s0, s1) {
  const n = list.length;
  const cuts = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? s0 : i === n ? s1 : nearBeat(s0 + ((s1 - s0) * i) / n)));
  list.forEach((p, j) => {
    const i = idx0 + j;
    const next = list[j + 1];
    p.flashIn = j === 0 || ["assemble", "face", "slice"].includes(p.enter);
    p.exit = !next ? "flash" : ({ whip: "whip", zoomin: "zoom", flip: "flipout", drop: "drop" }[next.enter] || "flash");
    const a = cuts[j], b = cuts[j + 1];
    const D = snap(V(b) - V(a));
    p.dur = D;
    const mid = nearBeat(a + D * 0.48) - a;
    p.punchAt = r3(Math.max(1.3, mid));
    p.sweepAt = p.enter === "assemble" || p.enter === "face" ? 1.0 : 0.6;
    const r = add(`p${String(i + 1).padStart(2, "0")}`, a, b, posterScene(p, i, posters.length));
    posterStarts.push(r.start);
  });
}
{ const [a, b] = bnd("juara1"); add("juara1", a, b, juaraScene("juara1", snap(V(b) - V(a)), cfg.juara1.words.map((w) => r3(w - a)), juaraPick(0))); }
{ const [a, b] = bnd("postersA"); posterRun(posters.slice(0, 15), 0, a, b); }
{ const [a, b] = bnd("juara2"); add("juara2", a, b, juaraScene("juara2", snap(V(b) - V(a)), cfg.juara2.words.map((w) => r3(w - a)), juaraPick(2))); }
{ const [a, b] = bnd("postersB"); posterRun(posters.slice(15), 15, a, b); }
// finale
let finaleInfo;
{
  const [a, b] = bnd("finale"); const f = cfg.finale;
  const beat = 60 / 154.1;
  finaleInfo = add("finale", a, b, mttFinaleScene(snap(V(b) - V(a)), { words: f.words.map((w) => r3(w - a)), endcard: r3(nearBeat(f.endcard) - a), boleh: r3(f.boleh - a), beat }, posters));
}
scenes.sort((x, y) => x.start - y.start);
const TOTAL = snap(V(cfg.end));
// make scenes contiguous (no gaps/overlaps from snapping)
for (let k = 0; k < scenes.length; k++) {
  const nextStart = k + 1 < scenes.length ? scenes[k + 1].start : TOTAL;
  scenes[k].dur = snap(nextStart - scenes[k].start);
}

fs.mkdirSync(path.join(ROOT, "compositions"), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, "compositions"))) fs.unlinkSync(path.join(ROOT, "compositions", f));
for (const s of scenes) fs.writeFileSync(path.join(ROOT, `compositions/${s.id}.html`), s.html);
fs.writeFileSync(path.join(ROOT, "compositions/dust.html"), dustScene(TOTAL));
const lyr = cfg.lyrics.map((L) => ({ words: L.words.map(([w, t]) => [w, r3(t - OFF)]), end: r3(L.end - OFF) }));
fs.writeFileSync(path.join(ROOT, "compositions/lyrics.html"), lyricsScene(TOTAL, lyr));

// ---------------------------------------------------------------- sound design (the anthem carries the film; effects sit under it)
const PEAK = { "whoosh": 0.162, "whoosh-high": 0.135, "whoosh-low": 0.202, "whoosh-cinematic": 2.503, "impact-bass-1": 0.073, "impact-deep": 0.086, "impact-bass-2": 1.986, "riser": 3.472, "sparkle": 0.027, "pop": 0.12 };
const DUR = { "whoosh": 0.575, "whoosh-high": 0.52, "whoosh-low": 0.76, "whoosh-cinematic": 5.544, "impact-bass-1": 2.116, "impact-deep": 2.53, "impact-bass-2": 2.592, "riser": 4.4, "sparkle": 1.802, "pop": 0.72 };
const sfx = [];
const hit = (name, songT, vol) => sfx.push({ name, start: Math.max(0, snap(songT - OFF + 1 / FPS - PEAK[name])), vol });
const SV = cfg.sfxGain ?? 1;
const T = (id) => scenes.find((s) => s.id === id);
const s0 = (id) => T(id).start + OFF; // scene start, song time
// teaser
hit("impact-deep", OFF + PEAK["impact-deep"] - 1 / FPS, 0.55 * SV);
{ const lb = localBeats(OFF, cfg.scenes.teaser[1]); hit("whoosh-cinematic", OFF + lb[12] - 0.05, 0.4 * SV); hit("impact-bass-1", OFF + lb[5], 0.45 * SV); }
hit("riser", s0("chant") - 0.05, 0.4 * SV);
// chant
cfg.chant.words.forEach((w, n) => { if (n !== 3) hit(n === 4 ? "impact-bass-2" : n === 2 ? "impact-deep" : "impact-bass-1", n === 4 ? w + 0.02 : w, (n === 4 ? 0.6 : 0.4) * SV); });
// event
hit("whoosh-high", s0("event") + 0.05, 0.3 * SV);
hit("impact-bass-1", s0("event") + 0.35, 0.35 * SV);
hit("pop", s0("event") + 1.35, 0.35 * SV);
// group
cfg.group.keys.slice(1).forEach((k, j) => { if (j % 2 === 0) hit(["whoosh-low", "whoosh"][j % 4 ? 1 : 0], nearBeat(s0("group") + k.t) + 0.5, 0.22 * SV); });
hit("whoosh-cinematic", cfg.group.land - 0.1, 0.3 * SV);
hit("impact-bass-2", cfg.group.land, 0.55 * SV);
hit("sparkle", cfg.group.land + 0.2, 0.3 * SV);
// juara slams
[cfg.juara1.words, cfg.juara2.words].forEach((ws) => ws.forEach((w, n) => hit(n % 2 ? "impact-bass-1" : "whoosh-high", w, (n % 2 ? 0.45 : 0.25) * SV)));
// posters
const whooshes = ["whoosh", "whoosh-high", "whoosh-low"];
posters.forEach((p, i) => {
  const st = posterStarts[i] + OFF, w = whooshes[i % 3], g = 0.75 * SV;
  switch (p.enter) {
    case "assemble": hit("impact-bass-1", st + 0.5, 0.4 * g); break;
    case "face": hit(w, st + 0.7, 0.3 * g); break;
    case "slice": hit("impact-deep", st + 0.3, 0.4 * g); break;
    case "whip": hit(w, st + 0.02, 0.35 * g); break;
    case "zoomin": hit("whoosh-high", st + 0.05, 0.3 * g); break;
    case "flip": hit(w, st + 0.18, 0.3 * g); break;
    case "drop": hit("impact-deep", st + 0.34, 0.38 * g); break;
  }
});
// finale
{
  const f = cfg.finale, a = s0("finale");
  hit("whoosh", a + 0.1, 0.3 * SV);
  hit("impact-bass-1", f.words[0], 0.5 * SV);
  hit("impact-bass-2", f.words[2] + 0.02, 0.55 * SV);
  hit("sparkle", f.words[2] + 0.3, 0.3 * SV);
  hit("whoosh-cinematic", nearBeat(f.endcard) - 0.15, 0.35 * SV);
  hit("impact-deep", f.boleh, 0.55 * SV);
}
const lanes = [];
sfx.sort((a, b) => a.start - b.start).forEach((c) => {
  const end = c.start + DUR[c.name];
  let l = lanes.findIndex((e) => e <= c.start + 1e-6);
  if (l < 0) { lanes.push(end); l = lanes.length - 1; } else lanes[l] = end;
  c.lane = 10 + l;
});

const sceneHosts = scenes.map((s, n) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${r3(s.start)}" data-duration="${r3(s.dur)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${n + 1}"></div>`).join("\n");
const sfxTags = sfx.map((c, n) => `      <audio id="sfx-${String(n + 1).padStart(2, "0")}" class="clip" src="assets/sfx/${c.name}.mp3" data-start="${r3(c.start)}" data-duration="${r3(Math.min(DUR[c.name], TOTAL - c.start))}" data-track-index="${c.lane}" data-volume="${r3(c.vol)}"></audio>`).join("\n");
const musicTag = `      <audio id="anthem" class="clip" src="${cfg.music.file}" data-start="0" data-duration="${r3(TOTAL)}" data-media-start="${OFF}" data-track-index="8" data-volume="${cfg.music.volume}"></audio>`;

const index = `<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>MTT Anthem — Malaysia Therapists Team, Singapore 2026</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      ${FONTS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #030716; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${r3(TOTAL)}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
${sceneHosts}
      <div id="lyrics" data-composition-id="lyrics" data-composition-src="compositions/lyrics.html" data-start="0" data-duration="${r3(TOTAL)}" data-track-index="3" data-track-kind="captions" data-width="${W}" data-height="${H}" style="z-index:95"></div>
      <div id="dust" data-composition-id="dust" data-composition-src="compositions/dust.html" data-start="0" data-duration="${r3(TOTAL)}" data-track-index="2" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:90"></div>
${musicTag}
${sfxTags}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), index);
fs.writeFileSync(path.join(ROOT, "build/cuts.json"), JSON.stringify({ total: TOTAL, scenes: scenes.map(({ id, start, dur }) => ({ id, start: r3(start), end: r3(start + dur), songStart: r3(start + OFF) })), sfx }, null, 1));
console.log(`built ${scenes.length} scenes + lyrics + dust, ${sfx.length} sfx, total ${r3(TOTAL)}s`);
