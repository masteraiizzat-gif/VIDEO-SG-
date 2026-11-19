// Generates index.html + compositions/*.html for the "Wira Malaysia ke Singapore 2026" film.
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
    #${id}-card{position:absolute;left:90px;top:0;width:900px;height:1350px;overflow:hidden;box-shadow:0 0 60px rgba(255,200,80,.35);}
    #root .band,#root .strip{position:absolute;inset:0;background-size:900px 1350px;background-repeat:no-repeat;}
    #${id}-shk{position:absolute;inset:0;}
    #${id}-tahniah{transform-origin:50% 45.7%;}
    #${id}-sweep{position:absolute;top:-25%;left:0;width:300px;height:150%;background:linear-gradient(90deg,rgba(255,240,200,0) 0%,rgba(255,244,210,.55) 50%,rgba(255,240,200,0) 100%);mix-blend-mode:screen;}
    #${id}-edgeL,#${id}-edgeR{position:absolute;top:0;width:3px;height:1350px;background:linear-gradient(180deg,rgba(255,215,110,0),#ffd56a 20%,#fff1b8 50%,#ffd56a 80%,rgba(255,215,110,0));}
    #${id}-edgeL{left:87px;} #${id}-edgeR{left:990px;}
    #${id}-tag{position:absolute;right:12px;top:22px;width:66px;font:800 26px/1 "MontserratX",sans-serif;color:#ffe08a;text-align:center;letter-spacing:.02em;}
    #${id}-tag small{display:block;font-size:13px;color:rgba(255,255,255,.7);margin-top:4px;}
    #${id}-flash{position:absolute;inset:0;background:#fff8e6;opacity:0;}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
    <img id="${id}-bgimg" src="assets/bg/${p.file}" alt=""/>
    <div id="${id}-shade"></div>
    <div id="${id}-cam" data-layout-allow-overflow><div id="${id}-shk" data-layout-allow-overflow>
      <div id="${id}-edgeL"></div><div id="${id}-edgeR"></div>
      <div id="${id}-card" data-layout-allow-overflow>
        ${useStrips ? stripDivs : bandDivs}
        <div id="${id}-sweep"></div>
      </div>
    </div></div>
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
    ${exit}
    window.__timelines["${id}"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- hook scene
function hookScene(s, posters) {
  const id = "hook";
  const cols = [0, 1, 2].map((c) => {
    const list = [];
    for (let k = 0; k < 7; k++) list.push(posters[(c * 5 + k * 3) % posters.length].file);
    return `<div class="hk-col" id="hook-col${c}" style="left:${c * 360}px">${list.map((f) => `<img src="assets/posters/${f}" alt=""/>`).join("")}</div>`;
  }).join("\n    ");
  const D = s.dur;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #root .hk-col{position:absolute;top:0;width:360px;}
    #root .hk-col img{display:block;width:360px;height:540px;}
    #hook-reel{position:absolute;inset:0;}
    #hook-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 48%,rgba(3,7,24,.55) 0%,rgba(3,7,24,.88) 70%,rgba(1,3,12,.96) 100%);}
    #hook-txt{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #hook-l1{position:absolute;left:0;top:300px;width:${W}px;text-align:center;font:800 44px/1 "MontserratX",sans-serif;letter-spacing:.42em;color:#fff;padding-left:.42em;}
    #hook-l2{position:absolute;left:0;top:372px;width:${W}px;text-align:center;font:900 176px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 6px 0 #5a3a05) drop-shadow(0 0 30px rgba(255,190,60,.45));}
    #hook-l3{position:absolute;left:0;top:560px;width:${W}px;text-align:center;font:900 132px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 30px rgba(255,190,60,.45));}
    #hook-l4{position:absolute;left:0;top:742px;width:${W}px;text-align:center;font:400 118px/1 "Anton",sans-serif;color:#fff;letter-spacing:.02em;text-shadow:0 6px 0 #b3001b,0 0 40px rgba(255,40,60,.55);}
    #hook-chip{position:absolute;left:390px;top:900px;width:300px;height:84px;border-radius:42px;background:linear-gradient(180deg,#ffe48a,#c88a14);box-shadow:0 0 40px rgba(255,200,80,.6);font:900 56px/84px "Cinzel",serif;color:#1a1204;text-align:center;}
    #hook-l5{position:absolute;left:0;top:1040px;width:${W}px;text-align:center;font:800 34px/1.3 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.12em;}
    #hook-flash{position:absolute;inset:0;background:#fff6dc;opacity:0;}
  </style>
  <div id="root" data-composition-id="hook" data-width="${W}" data-height="${H}">
    <div id="hook-reel" data-layout-allow-overflow>
    ${cols}
    </div>
    <div id="hook-dim"></div>
    <div id="hook-txt" data-layout-allow-overflow>
      <div id="hook-l1">INILAH</div>
      <div id="hook-l2">WIRA</div>
      <div id="hook-l3">MALAYSIA</div>
      <div id="hook-l4">KE SINGAPORE!</div>
      <div id="hook-chip">2026</div>
      <div id="hook-l5"><span class="w">WORLD</span> <span class="w">TRADITIONAL</span> <span class="w">MASSAGE</span><br/><span class="w">CHAMPIONSHIP</span></div>
    </div>
    <div id="hook-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // reels: fast at frame 0, decelerating (motion inside the shot)
    tl.fromTo("#hook-col0",{y:-2300},{y:-700,duration:${r3(D)},ease:"expo.out"},0);
    tl.fromTo("#hook-col1",{y:-500},{y:-1900,duration:${r3(D)},ease:"expo.out"},0);
    tl.fromTo("#hook-col2",{y:-2100},{y:-520,duration:${r3(D)},ease:"expo.out"},0);
    // frame 0 already carries the line (thumbnail = hook)
    tl.fromTo("#hook-l1",{opacity:1,y:0},{opacity:1,y:0,duration:0.01},0);
    tl.fromTo("#hook-l2",{scale:1.18,opacity:1},{scale:1,opacity:1,duration:0.4,ease:"expo.out"},0);
    tl.fromTo("#hook-l3",{scale:1.18,opacity:1},{scale:1,opacity:1,duration:0.45,ease:"expo.out"},0.04);
    tl.fromTo("#hook-l4",{scale:2.4,opacity:0},{scale:1,opacity:1,duration:0.22,ease:"power4.in"},${r3(s.slamAt)});
    tl.fromTo("#hook-txt",{x:0,y:0},{x:-16,y:10,duration:0.034,ease:"none"},${r3(s.slamAt + 0.22)})
      .to("#hook-txt",{x:12,y:-8,duration:0.034,ease:"none"},${r3(s.slamAt + 0.254)})
      .to("#hook-txt",{x:0,y:0,duration:0.06,ease:"power2.out"},${r3(s.slamAt + 0.288)});
    tl.fromTo("#hook-flash",{opacity:0.0},{opacity:0.55,duration:0.03,ease:"none"},${r3(s.slamAt + 0.2)})
      .to("#hook-flash",{opacity:0,duration:0.25,ease:"power2.out"},${r3(s.slamAt + 0.23)});
    tl.fromTo("#hook-chip",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.4,ease:"back.out(2)"},${r3(s.chipAt)});
    tl.fromTo("#hook-l5 .w",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.14,stagger:0.08,ease:"power2.out"},${r3(s.chipAt + 0.35)});
    // exit: zoom through the title
    tl.to("#hook-txt",{scale:2.6,opacity:0,filter:"blur(10px)",duration:0.3,ease:"power3.in"},${r3(D - 0.3)});
    tl.to("#hook-reel",{scale:1.4,opacity:0,duration:0.3,ease:"power3.in"},${r3(D - 0.3)});
    window.__timelines["hook"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- intro (kinetic version of the reference voiceover)
function introScene(s) {
  const D = s.dur;
  const words1 = "DENGAN BANGGANYA KAMI PERKENALKAN".split(" ");
  const b = s.b2; // second card starts
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #intro-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75;}
    #intro-rays{position:absolute;left:-560px;top:-400px;width:2200px;height:2200px;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,210,110,.16) 0deg 5deg,rgba(255,210,110,0) 5deg 15deg);}
    #intro-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(255,196,80,.30) 0%,rgba(10,18,60,.0) 45%,rgba(2,5,20,.85) 100%);}
    #intro-a{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #intro-a1{position:absolute;left:60px;top:420px;width:960px;text-align:center;font:800 50px/1.35 "MontserratX",sans-serif;color:#fff;letter-spacing:.06em;}
    #intro-a2{position:absolute;left:40px;top:600px;width:1000px;text-align:center;font:900 92px/1.08 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.4));}
    #intro-b{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #intro-b0{position:absolute;left:0;top:300px;width:${W}px;text-align:center;font:800 34px/1 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.3em;padding-left:.3em;}
    #intro-b1{position:absolute;left:40px;top:370px;width:1000px;text-align:center;font:900 118px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05);}
    #intro-b2{position:absolute;left:40px;top:500px;width:1000px;text-align:center;font:900 64px/1.1 "Cinzel",serif;color:#fff;text-shadow:0 4px 0 #2a3a80;}
    #intro-b3{position:absolute;left:40px;top:650px;width:1000px;text-align:center;font:900 92px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05);}
    #intro-line{position:absolute;left:190px;top:790px;width:700px;height:4px;background:linear-gradient(90deg,rgba(255,214,110,0),#ffd66e,rgba(255,214,110,0));}
    #intro-c1,#intro-c2{position:absolute;left:70px;width:940px;height:86px;border-radius:14px;border:2px solid #ffd36b;background:rgba(6,14,48,.82);font:800 34px/86px "MontserratX",sans-serif;color:#fff;text-align:center;letter-spacing:.04em;}
    #intro-c1{top:840px;} #intro-c2{top:950px;}
    #intro-c1 b,#intro-c2 b{color:#ffd66e;}
  </style>
  <div id="root" data-composition-id="intro" data-width="${W}" data-height="${H}">
    <img id="intro-bg" src="assets/bg/group.jpg" alt=""/>
    <div id="intro-rays" data-layout-ignore></div>
    <div id="intro-glow"></div>
    <div id="intro-a">
      <div id="intro-a1">${words1.map((w) => `<span class="w">${w}</span>`).join(" ")}</div>
      <div id="intro-a2"><span class="w">BARISAN</span> <span class="w">WAKIL</span><br/><span class="w">TERAPIS</span> <span class="w">MALAYSIA</span></div>
    </div>
    <div id="intro-b">
      <div id="intro-b0">KE PENTAS DUNIA</div>
      <div id="intro-b1">WORLD</div>
      <div id="intro-b2">TRADITIONAL MASSAGE</div>
      <div id="intro-b3">CHAMPIONSHIP</div>
      <div id="intro-line"></div>
      <div id="intro-c1"><b>TARIKH:</b> 28 – 29 NOVEMBER 2026</div>
      <div id="intro-c2"><b>VENUE:</b> HOTEL CHANCELLOR @ ORCHARD</div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#intro-rays",{rotation:0},{rotation:${r3(D * 4)},duration:${r3(D)},ease:"none"},0);
    tl.fromTo("#intro-bg",{scale:1.12},{scale:1,duration:${r3(D)},ease:"none"},0);
    // card A — the reference's voiceover line, as type
    tl.fromTo("#intro-a1 .w",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.14,stagger:0.09,ease:"power2.out"},0.12);
    tl.fromTo("#intro-a2 .w",{opacity:0,scale:1.5},{opacity:1,scale:1,duration:0.22,stagger:0.12,ease:"power4.in"},0.5);
    tl.to("#intro-a",{opacity:0,filter:"blur(8px)",duration:0.18,ease:"power2.in"},${r3(b - 0.2)});
    // card B — the event
    tl.fromTo("#intro-b0",{opacity:0,y:-12},{opacity:1,y:0,duration:0.3,ease:"expo.out"},${r3(b)});
    tl.fromTo("#intro-b1",{opacity:0,scale:1.6},{opacity:1,scale:1,duration:0.22,ease:"power4.in"},${r3(b + 0.05)});
    tl.fromTo("#intro-b2",{opacity:0,filter:"blur(8px)"},{opacity:1,filter:"blur(0px)",duration:0.18,ease:"power2.out"},${r3(b + 0.3)});
    tl.fromTo("#intro-b3",{opacity:0,scale:1.6},{opacity:1,scale:1,duration:0.22,ease:"power4.in"},${r3(b + 0.45)});
    tl.fromTo("#intro-line",{scaleX:0},{scaleX:1,duration:0.5,ease:"expo.out"},${r3(b + 0.7)});
    tl.fromTo("#intro-c1",{opacity:0,x:-60},{opacity:1,x:0,duration:0.45,ease:"expo.out"},${r3(b + 0.85)});
    tl.fromTo("#intro-c2",{opacity:0,x:60},{opacity:1,x:0,duration:0.45,ease:"expo.out"},${r3(b + 0.97)});
    tl.to("#intro-b",{scale:1.8,opacity:0,filter:"blur(10px)",duration:0.25,ease:"power3.in"},${r3(D - 0.25)});
    window.__timelines["intro"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- group scene (camera tour of the team poster)
function groupScene(s) {
  const D = s.dur;
  // the poster is 1920x1080; camera keyframes are image points put at frame centre, with a scale
  const at = (px, py, sc) => ({ x: r3(W / 2 - px * sc), y: r3(H / 2 - py * sc), scale: sc });
  const k = [
    at(1010, 330, 2.05), // title + first row
    at(560, 360, 2.0),
    at(1420, 470, 2.0),
    at(520, 640, 2.0),
    at(1400, 720, 2.0),
  ];
  const fit = { x: 0, y: r3((H - 1080 * (W / 1920)) / 2), scale: r3(W / 1920) };
  const T = s.keys; // times of moves
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #group-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #group-cam{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;}
    #group-img{position:absolute;left:0;top:0;width:1920px;height:1080px;}
    #group-top{position:absolute;left:0;top:70px;width:${W}px;text-align:center;}
    #group-t1{font:900 124px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #group-t2{margin-top:16px;font:800 34px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.24em;padding-left:.24em;}
    #group-bot{position:absolute;left:0;top:1040px;width:${W}px;text-align:center;}
    #group-b1{display:inline-block;padding:0 40px;height:84px;border-radius:42px;background:linear-gradient(180deg,#ffe48a,#c88a14);font:900 44px/84px "Cinzel",serif;color:#1a1204;box-shadow:0 0 40px rgba(255,200,80,.5);}
    #group-b2{margin-top:22px;font:800 32px/1.3 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.08em;}
    #group-flash{position:absolute;inset:0;background:#fff8e6;opacity:0;}
  </style>
  <div id="root" data-composition-id="group" data-width="${W}" data-height="${H}">
    <img id="group-bg" src="assets/bg/group.jpg" alt=""/>
    <div id="group-cam" data-layout-allow-overflow><img id="group-img" src="assets/posters/group.jpg" alt=""/></div>
    <div id="group-top"><div id="group-t1">TAHNIAH!</div><div id="group-t2">BARISAN WAKIL MALAYSIA</div></div>
    <div id="group-bot"><div id="group-b1">28 – 29 NOV 2026</div><div id="group-b2">HOTEL CHANCELLOR @ ORCHARD · SINGAPORE</div></div>
    <div id="group-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#group-flash",{opacity:1},{opacity:0,duration:0.3,ease:"power2.out"},0);
    tl.fromTo("#group-cam",${JSON.stringify({ ...k[0], scale: k[0].scale * 1.12, x: r3(W / 2 - 1010 * k[0].scale * 1.12), y: r3(H / 2 - 330 * k[0].scale * 1.12) })},{...${JSON.stringify(k[0])},duration:${r3(T[0])},ease:"power2.out"},0);
    ${k.slice(1).map((kk, j) => `tl.to("#group-cam",{...${JSON.stringify(kk)},duration:${r3(T[j + 1] - T[j] - 0.05)},ease:"power2.inOut"},${r3(T[j])});`).join("\n    ")}
    tl.to("#group-cam",{...${JSON.stringify(fit)},duration:0.75,ease:"power3.inOut"},${r3(T[k.length])});
    tl.fromTo("#group-t1",{opacity:0,scale:1.8},{opacity:1,scale:1,duration:0.24,ease:"power4.in"},${r3(T[k.length] + 0.55)});
    tl.fromTo("#group-t2",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.2,ease:"power2.out"},${r3(T[k.length] + 0.85)});
    tl.fromTo("#group-b1",{opacity:0,scale:0.4},{opacity:1,scale:1,duration:0.4,ease:"back.out(1.8)"},${r3(T[k.length] + 1.0)});
    tl.fromTo("#group-b2",{opacity:0,y:16},{opacity:1,y:0,duration:0.4,ease:"expo.out"},${r3(T[k.length] + 1.15)});
    tl.to("#group-flash",{opacity:1,duration:0.14,ease:"power2.in"},${r3(D - 0.15)});
    window.__timelines["group"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- finale (poster wall + send-off line)
function finaleScene(s, posters) {
  const D = s.dur;
  const tw = 216, th = 324;
  const tiles = posters.map((p, n) => {
    const c = n % 5, r = Math.floor(n / 5);
    return `<img class="fn-tile" id="finale-t${n}" src="assets/posters/${p.file}" alt="" style="left:${c * tw}px;top:${r * th + 27}px"/>`;
  }).join("\n      ");
  const last = posters.length; // slot 20
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #finale-wall{position:absolute;inset:0;}
    #root .fn-tile{position:absolute;width:${tw}px;height:${th}px;}
    #finale-slot{position:absolute;left:${(last % 5) * tw}px;top:${Math.floor(last / 5) * th + 27}px;width:${tw}px;height:${th}px;background:linear-gradient(160deg,#0b1b5c,#050b26);border:3px solid #ffd36b;box-sizing:border-box;text-align:center;}
    #finale-slot b{display:block;margin-top:80px;font:900 64px/1 "Cinzel",serif;${GOLD}}
    #finale-slot i{display:block;margin-top:14px;font:800 28px/1.25 "MontserratX",sans-serif;font-style:normal;color:#fff;letter-spacing:.12em;}
    #finale-dim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(3,7,24,.72) 0%,rgba(2,5,18,.93) 80%);opacity:0;}
    #finale-txt{position:absolute;left:0;top:0;width:${W}px;height:${H}px;}
    #finale-l1{position:absolute;left:0;top:380px;width:${W}px;text-align:center;font:900 112px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #finale-l2{position:absolute;left:0;top:510px;width:${W}px;text-align:center;font:900 104px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #finale-l3{position:absolute;left:30px;top:665px;width:1020px;text-align:center;font:800 37px/1.4 "MontserratX",sans-serif;color:#fff;letter-spacing:.05em;}
    #finale-l4{position:absolute;left:0;top:860px;width:${W}px;text-align:center;font:400 64px/1 "Anton",sans-serif;color:#fff;letter-spacing:.04em;text-shadow:0 5px 0 #b3001b;}
    #finale-l5{position:absolute;left:0;top:960px;width:${W}px;text-align:center;font:800 30px/1.4 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.1em;}
  </style>
  <div id="root" data-composition-id="finale" data-width="${W}" data-height="${H}">
    <div id="finale-wall" data-layout-allow-overflow>
      ${tiles}
      <div id="finale-slot"><b>2026</b><i>WIRA<br/>NEGARA</i></div>
    </div>
    <div id="finale-dim"></div>
    <div id="finale-txt" data-layout-allow-overflow>
      <div id="finale-l1">SEMOGA</div>
      <div id="finale-l2">BERJAYA!</div>
      <div id="finale-l3"><span class="w">PULANG</span> <span class="w">DENGAN</span> <span class="w">KEJAYAAN</span> <span class="w">DAN</span><br/><span class="w">MENGHARUMKAN</span> <span class="w">NEGARA</span> <span class="w">YANG</span> <span class="w">TERCINTA</span></div>
      <div id="finale-l4">MALAYSIA BOLEH!</div>
      <div id="finale-l5">WORLD TRADITIONAL MASSAGE CHAMPIONSHIP<br/>SINGAPORE · 28 – 29 NOVEMBER 2026</div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    // seeded scatter so every render is identical
    let seed = 20261128; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const order = ${JSON.stringify(posters.map((_, n) => n))};
    order.forEach((n, j) => {
      const rx = (rnd() - 0.5) * 900, ry = (rnd() - 0.5) * 900, rr = (rnd() - 0.5) * 60;
      tl.fromTo("#finale-t" + n, {x: rx, y: ry, rotation: rr, scale: 0, opacity: 0}, {x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: "expo.out"}, 0.05 + j * 0.045);
    });
    tl.fromTo("#finale-slot",{scale:0,opacity:0},{scale:1,opacity:1,duration:0.45,ease:"back.out(1.8)"},0.95);
    tl.fromTo("#finale-wall",{scale:1},{scale:1.12,duration:${r3(D - 1.6)},ease:"power1.inOut"},1.6);
    tl.fromTo("#finale-dim",{opacity:0},{opacity:1,duration:0.5,ease:"power2.inOut"},${r3(s.textAt - 0.4)});
    tl.fromTo("#finale-l1",{opacity:0,scale:1.9},{opacity:1,scale:1,duration:0.24,ease:"power4.in"},${r3(s.textAt)});
    tl.fromTo("#finale-l2",{opacity:0,scale:1.9},{opacity:1,scale:1,duration:0.24,ease:"power4.in"},${r3(s.textAt + 0.36)});
    tl.fromTo("#finale-txt",{x:0,y:0},{x:-12,y:8,duration:0.034,ease:"none"},${r3(s.textAt + 0.6)})
      .to("#finale-txt",{x:9,y:-6,duration:0.034,ease:"none"},${r3(s.textAt + 0.634)})
      .to("#finale-txt",{x:0,y:0,duration:0.06,ease:"power2.out"},${r3(s.textAt + 0.668)});
    tl.fromTo("#finale-l3 .w",{opacity:0,filter:"blur(6px)"},{opacity:1,filter:"blur(0px)",duration:0.14,stagger:0.08,ease:"power2.out"},${r3(s.textAt + 0.85)});
    tl.fromTo("#finale-l4",{opacity:0,scale:2.2},{opacity:1,scale:1,duration:0.22,ease:"power4.in"},${r3(s.textAt + 1.9)});
    tl.fromTo("#finale-l5",{opacity:0,y:16},{opacity:1,y:0,duration:0.45,ease:"expo.out"},${r3(s.textAt + 2.3)});
    window.__timelines["finale"] = tl;
  </script>
</template>
`;
}

// ---------------------------------------------------------------- MTT members scene (official members poster, with logo)
function mttScene(s) {
  const D = s.dur;
  const IW = 1672, IH = 941;
  const at = (px, py, sc) => ({ x: r3(W / 2 - px * sc), y: r3(H / 2 - py * sc), scale: sc });
  const k0 = at(334, 215, 2.75), k1 = at(334, 215, 2.55);
  const fit = { x: 0, y: r3((H - IH * (W / IW)) / 2), scale: r3(W / IW) };
  const L = s.pullAt;
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:#030716;}
    #mtt-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
    #mtt-cam{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px;transform-origin:0 0;}
    #mtt-img{position:absolute;left:0;top:0;width:${IW}px;height:${IH}px;}
    #mtt-grad{position:absolute;left:0;top:700px;width:${W}px;height:650px;background:linear-gradient(180deg,rgba(3,7,22,0) 0%,rgba(3,7,22,.88) 40%,rgba(3,7,22,.95) 100%);}
    #mtt-a{position:absolute;left:0;top:1010px;width:${W}px;text-align:center;}
    #mtt-a1{font:800 40px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.36em;padding-left:.36em;}
    #mtt-a2{margin-top:22px;font:900 76px/1.1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #mtt-top{position:absolute;left:0;top:96px;width:${W}px;text-align:center;}
    #mtt-t0{font:800 36px/1 "MontserratX",sans-serif;color:#fff;letter-spacing:.3em;padding-left:.3em;}
    #mtt-t1{margin-top:18px;font:900 120px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 5px 0 #5a3a05) drop-shadow(0 0 26px rgba(255,190,60,.45));}
    #mtt-bot{position:absolute;left:0;top:1030px;width:${W}px;text-align:center;}
    #mtt-b1{display:inline-block;padding:0 44px;height:84px;border-radius:42px;background:linear-gradient(180deg,#ffe48a,#c88a14);font:900 44px/84px "Cinzel",serif;color:#1a1204;box-shadow:0 0 40px rgba(255,200,80,.5);}
    #mtt-b2{margin-top:22px;font:800 32px/1.3 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.08em;}
    #mtt-flash{position:absolute;inset:0;background:#fff8e6;opacity:0;}
  </style>
  <div id="root" data-composition-id="mtt" data-width="${W}" data-height="${H}">
    <img id="mtt-bg" src="assets/bg/mtt.jpg" alt=""/>
    <div id="mtt-cam" data-layout-allow-overflow><img id="mtt-img" src="assets/posters/mtt.jpg" alt=""/></div>
    <div id="mtt-grad"></div>
    <div id="mtt-a"><div id="mtt-a1">AHLI RASMI</div><div id="mtt-a2">MALAYSIA<br/>THERAPIST TEAM</div></div>
    <div id="mtt-top"><div id="mtt-t0">BANGGA BERSAMA</div><div id="mtt-t1">AHLI MTT</div></div>
    <div id="mtt-bot"><div id="mtt-b1">17 AHLI RASMI</div><div id="mtt-b2">MALAYSIA THERAPIST TEAM · SINGAPORE 2026</div></div>
    <div id="mtt-flash" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#mtt-flash",{opacity:1},{opacity:0,duration:0.25,ease:"power2.out"},0);
    tl.fromTo("#mtt-cam",${JSON.stringify(k0)},{...${JSON.stringify(k1)},duration:${r3(L)},ease:"power1.out"},0);
    tl.fromTo("#mtt-a1",{opacity:0,y:-10},{opacity:1,y:0,duration:0.3,ease:"expo.out"},0.2);
    tl.fromTo("#mtt-a2",{opacity:0,scale:1.6},{opacity:1,scale:1,duration:0.24,ease:"power4.in"},0.35);
    tl.to("#mtt-a",{opacity:0,filter:"blur(8px)",duration:0.18,ease:"power2.in"},${r3(L - 0.1)});
    tl.fromTo("#mtt-grad",{opacity:1},{opacity:0,duration:0.5,ease:"power2.inOut"},${r3(L)});
    tl.to("#mtt-cam",{...${JSON.stringify(fit)},duration:0.8,ease:"power3.inOut"},${r3(L)});
    tl.fromTo("#mtt-t0",{opacity:0,y:-12},{opacity:1,y:0,duration:0.3,ease:"expo.out"},${r3(L + 0.75)});
    tl.fromTo("#mtt-t1",{opacity:0,scale:1.8},{opacity:1,scale:1,duration:0.24,ease:"power4.in"},${r3(L + 0.85)});
    tl.fromTo("#mtt-b1",{opacity:0,scale:0.4},{opacity:1,scale:1,duration:0.4,ease:"back.out(1.8)"},${r3(L + 1.15)});
    tl.fromTo("#mtt-b2",{opacity:0,y:16},{opacity:1,y:0,duration:0.4,ease:"expo.out"},${r3(L + 1.3)});
    tl.to(["#mtt-cam","#mtt-top","#mtt-bot"],{opacity:0,filter:"blur(10px)",duration:0.2,ease:"power3.in"},${r3(D - 0.2)});
    window.__timelines["mtt"] = tl;
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

// ---------------------------------------------------------------- assemble the film
const posters = cfg.posters;
let t = 0;
const scenes = [];
const push = (id, dur, html, track = 1) => {
  const start = snap(t);
  const d = snap(dur);
  scenes.push({ id, start, dur: d, html, track });
  t = start + d;
  return start;
};

const hook = cfg.hook, intro = cfg.intro, group = cfg.group, finale = cfg.finale, mtt = cfg.mtt;
push("hook", hook.dur, hookScene(hook, posters));
push("intro", intro.dur, introScene(intro));
const groupStart = push("group", group.dur, groupScene(group));
const posterStarts = [];
posters.forEach((p, i) => {
  const next = posters[i + 1];
  p.flashIn = i === 0 || ["assemble", "face", "slice"].includes(p.enter);
  p.exit = !next ? "flash" : ({ whip: "whip", zoomin: "zoom", flip: "flipout", drop: "drop" }[next.enter] || "flash");
  posterStarts.push(push(`p${String(i + 1).padStart(2, "0")}`, p.dur, posterScene(p, i, posters.length)));
});
const mttStart = push("mtt", mtt.dur, mttScene(mtt));
const finaleStart = push("finale", finale.dur, finaleScene(finale, posters));
const TOTAL = snap(t);

fs.mkdirSync(path.join(ROOT, "compositions"), { recursive: true });
for (const s of scenes) fs.writeFileSync(path.join(ROOT, `compositions/${s.id}.html`), s.html);
fs.writeFileSync(path.join(ROOT, "compositions/dust.html"), dustScene(TOTAL));

// ---------------------------------------------------------------- sound design
// Each effect is placed so its measured peak lands one frame after its picture.
const PEAK = { "whoosh": 0.162, "whoosh-high": 0.135, "whoosh-low": 0.202, "whoosh-cinematic": 2.503, "impact-bass-1": 0.073, "impact-deep": 0.086, "impact-bass-2": 1.986, "riser": 3.472, "sparkle": 0.027, "pop": 0.12, "glitch-1": 0.82, "chime": 0.418 };
const DUR = { "whoosh": 0.575, "whoosh-high": 0.52, "whoosh-low": 0.76, "whoosh-cinematic": 5.544, "impact-bass-1": 2.116, "impact-deep": 2.53, "impact-bass-2": 2.592, "riser": 4.4, "sparkle": 1.802, "pop": 0.72, "glitch-1": 2.638, "chime": 2.544 };
const sfx = [];
const hit = (name, at, vol = 0.5) => sfx.push({ name, start: Math.max(0, snap(at + 1 / FPS - PEAK[name])), vol });

// hook
hit("impact-deep", 0.0 + PEAK["impact-deep"] - 1 / FPS, 0.75); // lands on frame 0
hit("impact-bass-1", hook.slamAt + 0.22, 0.8);
hit("pop", hook.chipAt + 0.2, 0.55);
hit("whoosh-cinematic", hook.dur - 0.05, 0.5);
// intro
const iS = scenes[1].start;
hit("impact-bass-1", iS + 0.62 + 0.22, 0.45);
hit("impact-bass-1", iS + intro.b2 + 0.27, 0.55);
hit("whoosh-high", iS + intro.b2 + 0.9, 0.35);
hit("riser", groupStart + group.keys[5] + 0.75, 0.55);
// group tour
group.keys.slice(0, 4).forEach((k, j) => hit(["whoosh-low", "whoosh", "whoosh-low", "whoosh"][j], groupStart + k + 0.45, 0.28));
hit("impact-bass-2", groupStart + group.keys[5] + 0.78, 0.7);
hit("sparkle", groupStart + group.keys[5] + 1.0, 0.4);
// posters
const whooshes = ["whoosh", "whoosh-high", "whoosh-low"];
posters.forEach((p, i) => {
  const s0 = posterStarts[i];
  const w = whooshes[i % 3];
  switch (p.enter) {
    case "assemble": hit("impact-bass-1", s0 + 0.5, 0.55); break;
    case "face": hit(w, s0 + 0.7, 0.4); break;
    case "slice": hit("impact-deep", s0 + 0.3, 0.55); break;
    case "whip": hit(w, s0 + 0.02, 0.45); break;
    case "zoomin": hit("whoosh-high", s0 + 0.05, 0.4); break;
    case "flip": hit(w, s0 + 0.18, 0.4); break;
    case "drop": hit("impact-deep", s0 + 0.34, 0.5); break;
  }
  if (p.sparkle) hit("sparkle", s0 + (p.sweepAt ?? 0.95) + 0.3, 0.3);
});
// MTT members
hit("impact-deep", mttStart + 0.0 + PEAK["impact-deep"] - 1 / FPS, 0.6);
hit("impact-bass-1", mttStart + 0.59, 0.5);
hit("whoosh-low", mttStart + mtt.pullAt + 0.4, 0.4);
hit("impact-bass-2", mttStart + mtt.pullAt + 0.8, 0.65);
hit("sparkle", mttStart + mtt.pullAt + 0.9, 0.35);
hit("pop", mttStart + mtt.pullAt + 1.3, 0.45);
hit("whoosh-high", mttStart + mtt.dur - 0.05, 0.35);
// finale
hit("whoosh", finaleStart + 0.1, 0.35);
hit("impact-bass-1", finaleStart + finale.textAt + 0.24, 0.7);
hit("impact-bass-1", finaleStart + finale.textAt + 0.6, 0.75);
hit("impact-deep", finaleStart + finale.textAt + 2.12, 0.8);
hit("sparkle", finaleStart + finale.textAt + 2.35, 0.35);

// lanes: a new clip goes on the lowest sfx lane where it overlaps nothing
const lanes = [];
sfx.sort((a, b) => a.start - b.start).forEach((c) => {
  const end = c.start + DUR[c.name];
  let l = lanes.findIndex((e) => e <= c.start + 1e-6);
  if (l < 0) { lanes.push(end); l = lanes.length - 1; } else lanes[l] = end;
  c.lane = 10 + l;
});

const music = cfg.music;
const sceneHosts = scenes.map((s, n) => `      <div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${r3(s.start)}" data-duration="${r3(s.dur)}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${n + 1}"></div>`).join("\n");
const sfxTags = sfx.map((c, n) => `      <audio id="sfx-${String(n + 1).padStart(2, "0")}" class="clip" src="assets/sfx/${c.name}.mp3" data-start="${r3(c.start)}" data-duration="${r3(Math.min(DUR[c.name], TOTAL - c.start))}" data-track-index="${c.lane}" data-volume="${c.vol}"></audio>`).join("\n");
const XF = 0.15; // music edit: crossfade at the MTT cut, masked by its flash + impact
const musicTag = music && music.file ? [
  `      <audio id="music" class="clip" src="${music.file}" data-start="0" data-duration="${r3(mttStart + XF)}" data-media-start="${music.offset || 0}" data-track-index="8" data-volume="${music.volume ?? 0.8}" data-fade-in="0.05" data-fade-out="${2 * XF}"></audio>`,
  `      <audio id="music-outro" class="clip" src="${music.file}" data-start="${r3(mttStart - XF)}" data-duration="${r3(TOTAL - mttStart + XF)}" data-media-start="${r3(music.outroFrom - XF)}" data-track-index="9" data-volume="${music.volume ?? 0.8}" data-fade-in="${2 * XF}" data-fade-out="${music.fadeOut ?? 2}"></audio>`,
].join("\n") : "";

const index = `<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Wira Malaysia ke Singapore 2026</title>
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
fs.writeFileSync(path.join(ROOT, "build/cuts.json"), JSON.stringify({ total: TOTAL, scenes: scenes.map(({ id, start, dur }) => ({ id, start: r3(start), end: r3(start + dur) })), sfx }, null, 1));
console.log(`built ${scenes.length} scenes + dust, ${sfx.length} sfx, total ${r3(TOTAL)}s`);
