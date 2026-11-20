// WhatsApp Status cut (9:16, under 60 s) of the MTT anthem film.
// The anthem is edited on its beat grid into a few song segments; the 4:5 stage sits in a 1080x1920 frame.
// Config: build/cut-wa.json (song times). Output: ../mtt-wa-status/ (a HyperFrames project of its own).
//   node build/build-wa.mjs
import fs from "node:fs";
import path from "node:path";
import { W, H, FPS, r3, snap, FONTS, GOLD, LOGO, LOGO_CSS, RAYS, posterScene, dustScene, chantScene, mttGroupScene, juaraScene, lyricsScene, mttFinaleScene, wallHookScene } from "./scenes.mjs";

const SRC = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const full = JSON.parse(fs.readFileSync(path.join(SRC, "build/timeline.json"), "utf8"));
const cut = JSON.parse(fs.readFileSync(path.join(SRC, "build/cut-wa.json"), "utf8"));
const OUT = path.resolve(SRC, cut.outDir);
const FW = 1080, FH = 1920, STAGE_Y = (FH - H) / 2; // 285

const beatsSong = JSON.parse(fs.readFileSync(path.join(SRC, "build/beats.json"), "utf8")).beatTimes;
const nearBeat = (t) => beatsSong.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a), beatsSong[0]);

// ---- song segments → piecewise video clock
const segs = [];
{
  let v = 0;
  cut.segments.forEach(([a, b], k) => {
    const sa = k === 0 ? a : nearBeat(a), sb = k === cut.segments.length - 1 ? b : nearBeat(b);
    segs.push({ a: sa, b: sb, v0: v });
    v = snap(v + (sb - sa));
  });
}
const TOTAL = snap(segs.at(-1).v0 + (segs.at(-1).b - segs.at(-1).a));
const V = (song) => {
  const s = segs.find((g) => song >= g.a - 1e-6 && song <= g.b + 1e-6);
  if (!s) throw new Error(`song time ${song} is outside the cut`);
  return snap(s.v0 + (song - s.a));
};
const inCut = (song) => segs.some((g) => song >= g.a && song <= g.b);

// ---- posters (same order and art as the full film; short entrances for a fast montage)
const fast = ["whip", "zoomin", "slice", "flip", "drop"];
const posters = full.posters.map((p, i) => ({ ...p, enter: fast[i % fast.length] }));

const scenes = [];
const add = (id, songA, songB, html, vA, vB) => {
  const start = vA ?? V(songA), end = vB ?? V(songB);
  scenes.push({ id, start, dur: snap(end - start), html });
  return { start, dur: snap(end - start) };
};
const localBeats = (s0, s1) => beatsSong.filter((b) => b >= s0 - 1e-3 && b < s1).map((b) => r3(b - s0));

const [S1, S2, S3, S4] = segs;
// hook + chant (segment 1)
const chantA = nearBeat(cut.chantStart);
add("hook", S1.a, chantA, wallHookScene(snap(V(chantA) - V(S1.a)), posters, localBeats(S1.a, chantA)));
add("chant", chantA, S1.b, chantScene(snap(V(S1.b) - V(chantA)), full.chant.words.map((w) => r3(w - chantA))));
// chorus (segment 2): team poster pull-out, 3 posters, slam, 15 posters
const gB = nearBeat(cut.groupEnd);
add("group", S2.a, gB, mttGroupScene(snap(V(gB) - V(S2.a)), { keys: [{ t: 0, p: cut.groupFrom, s: 2.0 }], pullAt: 0.08, land: r3(full.group.land - S2.a) }));
const posterStarts = [];
function posterRun(list, idx0, a, b) {
  const n = list.length;
  const cuts = Array.from({ length: n + 1 }, (_, i) => (i === 0 ? a : i === n ? b : nearBeat(a + ((b - a) * i) / n)));
  list.forEach((p, j) => {
    const next = list[j + 1];
    p.flashIn = j === 0 || p.enter === "slice";
    p.exit = !next ? "flash" : ({ whip: "whip", zoomin: "zoom", flip: "flipout", drop: "drop" }[next.enter] || "flash");
    p.dur = snap(V(cuts[j + 1]) - V(cuts[j]));
    p.punchAt = null;
    p.sweepAt = 0.35;
    posterStarts.push(add(`p${String(idx0 + j + 1).padStart(2, "0")}`, cuts[j], cuts[j + 1], posterScene(p, idx0 + j, posters.length)).start);
  });
}
const j1 = [nearBeat(full.scenes.juara1[0]), nearBeat(full.scenes.juara1[1])];
posterRun(posters.slice(0, 3), 0, gB, j1[0]);
add("juara1", j1[0], j1[1], juaraScene("juara1", snap(V(j1[1]) - V(j1[0])), full.juara1.words.map((w) => r3(w - j1[0])), [0, 5, 10, 15].map((k) => posters[k])));
posterRun(posters.slice(3), 3, j1[1], S2.b);
// finale across segments 3 + 4 (team poster + tag "Malaysia, kami juara!", then the logo card on the ending)
{
  const fA = V(S3.a);
  add("finale", null, null, mttFinaleScene(snap(TOTAL - fA), { noWall: true, words: full.finale.words.map((w) => r3(V(w) - fA)), endcard: r3(V(S4.a) - fA), boleh: r3(V(full.finale.boleh) - fA), beat: 60 / 154.1 }, posters), fA, TOTAL);
}
scenes.sort((x, y) => x.start - y.start);
for (let k = 0; k < scenes.length; k++) scenes[k].dur = snap((k + 1 < scenes.length ? scenes[k + 1].start : TOTAL) - scenes[k].start);

// ---- frame around the 4:5 stage (bands stay clear of WhatsApp's top bar and reply bar)
function frameScene(D) {
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,#0f2160 0%,#050b2a 55%,#02040f 100%);}
    #fr-rays{position:absolute;left:-560px;top:-140px;width:2200px;height:2200px;border-radius:50%;${RAYS}opacity:.7;}
    #fr-l1,#fr-l2{position:absolute;left:0;width:${FW}px;height:4px;background:linear-gradient(90deg,rgba(255,214,110,0),#ffd66e 20%,#fff1b8 50%,#ffd66e 80%,rgba(255,214,110,0));}
    #fr-l1{top:${STAGE_Y - 4}px;} #fr-l2{top:${STAGE_Y + H}px;}
    #fr-top{position:absolute;left:0;top:168px;width:${FW}px;height:${STAGE_Y - 172}px;}
    #fr-logo{position:absolute;left:36px;top:2px;width:150px;height:89px;${LOGO_CSS}}
    #fr-t1{position:absolute;left:196px;top:10px;width:850px;font:900 50px/1 "Cinzel",serif;${GOLD}filter:drop-shadow(0 3px 0 #5a3a05);white-space:nowrap;}
    #fr-t2{position:absolute;left:198px;top:66px;width:850px;font:800 28px/1 "MontserratX",sans-serif;color:#ffe9b0;letter-spacing:.2em;}
    #fr-bot{position:absolute;left:0;top:${STAGE_Y + H + 18}px;width:${FW}px;text-align:center;}
    #fr-b1{font:900 34px/1.2 "Cinzel",serif;${GOLD}}
    #fr-b2{margin-top:10px;font:800 28px/1.2 "MontserratX",sans-serif;color:#fff;letter-spacing:.03em;white-space:nowrap;}
    #fr-sweep{position:absolute;left:0;top:${STAGE_Y + H + 6}px;width:260px;height:110px;background:linear-gradient(90deg,rgba(255,240,200,0),rgba(255,244,210,.35),rgba(255,240,200,0));mix-blend-mode:screen;}
  </style>
  <div id="root" data-composition-id="frame" data-width="${FW}" data-height="${FH}">
    <div id="fr-rays" data-layout-ignore></div>
    <div id="fr-top"><img id="fr-logo" src="${LOGO}" alt=""/><div id="fr-t1">MALAYSIA THERAPISTS TEAM</div><div id="fr-t2">KE SINGAPORE 2026 · KAMI JUARA!</div></div>
    <div id="fr-l1"></div><div id="fr-l2"></div>
    <div id="fr-bot"><div id="fr-b1">WORLD TRADITIONAL MASSAGE CHAMPIONSHIP</div><div id="fr-b2">28 – 29 NOVEMBER 2026 · HOTEL CHANCELLOR @ ORCHARD</div></div>
    <div id="fr-sweep" data-layout-ignore></div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#fr-rays",{rotation:0},{rotation:${r3(D * 3)},duration:${r3(D)},ease:"none"},0);
    for (let k = 0; k < ${Math.floor(D / 6)}; k++) tl.fromTo("#fr-sweep",{x:-300},{x:1400,duration:1.2,ease:"power2.inOut"},2 + k * 6);
    window.__timelines["frame"] = tl;
  </script>
</template>
`;
}

// ---- write the project
fs.mkdirSync(path.join(OUT, "compositions"), { recursive: true });
for (const f of fs.readdirSync(path.join(OUT, "compositions"))) fs.unlinkSync(path.join(OUT, "compositions", f));
fs.cpSync(path.join(SRC, "assets"), path.join(OUT, "assets"), { recursive: true });
for (const f of ["hyperframes.json", "AGENTS.md", "CLAUDE.md"]) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify({ id: "mtt-wa-status", name: "mtt-wa-status" }, null, 2));
fs.writeFileSync(path.join(OUT, "package.json"), fs.readFileSync(path.join(SRC, "package.json"), "utf8").replace(/mtt-anthem-2026/g, "mtt-wa-status"));
for (const s of scenes) fs.writeFileSync(path.join(OUT, `compositions/${s.id}.html`), s.html);
fs.writeFileSync(path.join(OUT, "compositions/dust.html"), dustScene(TOTAL));
fs.writeFileSync(path.join(OUT, "compositions/frame.html"), frameScene(TOTAL));
const lyr = full.lyrics.filter((L) => L.words.every(([, t]) => inCut(t)) && inCut(L.end)).map((L) => ({ words: L.words.map(([w, t]) => [w, r3(V(t))]), end: r3(V(L.end)) }));
fs.writeFileSync(path.join(OUT, "compositions/lyrics.html"), lyricsScene(TOTAL, lyr));

// ---- sound: the anthem, edited; a few effects on the slams and joins
const XF = 0.12;
const music = segs.map((g, k) => {
  const first = k === 0, last = k === segs.length - 1;
  const st = first ? 0 : g.v0 - XF, ms = first ? g.a : g.a - XF;
  const len = (g.b - g.a) + (first ? 0 : XF) + (last ? 0 : XF);
  return `      <audio id="anthem-${k + 1}" class="clip" src="${full.music.file}" data-start="${r3(st)}" data-duration="${r3(Math.min(len, TOTAL - st))}" data-media-start="${r3(ms)}" data-track-index="${8 + (k % 2)}" data-volume="${cut.musicVolume}"${first ? "" : ` data-fade-in="${2 * XF}"`}${last ? "" : ` data-fade-out="${2 * XF}"`}></audio>`;
}).join("\n");
const PEAK = { "whoosh": 0.162, "whoosh-high": 0.135, "whoosh-low": 0.202, "whoosh-cinematic": 2.503, "impact-bass-1": 0.073, "impact-deep": 0.086, "impact-bass-2": 1.986, "sparkle": 0.027 };
const DUR = { "whoosh": 0.575, "whoosh-high": 0.52, "whoosh-low": 0.76, "whoosh-cinematic": 5.544, "impact-bass-1": 2.116, "impact-deep": 2.53, "impact-bass-2": 2.592, "sparkle": 1.802 };
const sfx = [];
const hitV = (name, vt, vol) => sfx.push({ name, start: Math.max(0, snap(vt + 1 / FPS - PEAK[name])), vol });
const hit = (name, song, vol) => inCut(song) && hitV(name, V(song), vol);
hitV("impact-deep", PEAK["impact-deep"] - 1 / FPS, 0.5);
full.chant.words.forEach((w, n) => { if (n !== 3) hit(n === 4 ? "impact-bass-2" : n === 2 ? "impact-deep" : "impact-bass-1", n === 4 ? w + 0.02 : w, n === 4 ? 0.55 : 0.4); });
hitV("whoosh-high", V(S2.a) + 0.1, 0.3);
hit("impact-bass-2", full.group.land, 0.5);
full.juara1.words.forEach((w, n) => hit(n % 2 ? "impact-bass-1" : "whoosh-high", w, n % 2 ? 0.42 : 0.22));
posterStarts.forEach((st, i) => { if (i % 3 === 1) hitV(["whoosh", "whoosh-high", "whoosh-low"][i % 3], st + 0.02, 0.22); });
hit("impact-bass-1", full.finale.words[0], 0.5);
hit("impact-bass-2", full.finale.words[2] + 0.02, 0.5);
hitV("whoosh-cinematic", V(S4.a) - 0.15, 0.32);
hit("impact-deep", full.finale.boleh, 0.5);
const lanes = [];
sfx.sort((a, b) => a.start - b.start).forEach((c) => {
  const end = c.start + DUR[c.name];
  let l = lanes.findIndex((e) => e <= c.start + 1e-6);
  if (l < 0) { lanes.push(end); l = lanes.length - 1; } else lanes[l] = end;
  c.lane = 10 + l;
});
const sfxTags = sfx.map((c, n) => `      <audio id="sfx-${String(n + 1).padStart(2, "0")}" class="clip" src="assets/sfx/${c.name}.mp3" data-start="${r3(c.start)}" data-duration="${r3(Math.min(DUR[c.name], TOTAL - c.start))}" data-track-index="${c.lane}" data-volume="${r3(c.vol)}"></audio>`).join("\n");

const host = (id, s, d, extra = "", w = W, h = H, kind = "graphics", track = 1) => `        <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${r3(s)}" data-duration="${r3(d)}" data-track-index="${track}" data-track-kind="${kind}" data-width="${w}" data-height="${h}" style="${extra}"></div>`;
const index = `<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${FW}, height=${FH}" />
    <title>MTT Anthem — WhatsApp Status</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      ${FONTS}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${FW}px; height: ${FH}px; overflow: hidden; background: #02040f; }
      #root { position: relative; width: ${FW}px; height: ${FH}px; overflow: hidden; }
      #stage { position: absolute; left: 0; top: ${STAGE_Y}px; width: ${W}px; height: ${H}px; overflow: hidden; z-index: 5; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${r3(TOTAL)}" data-width="${FW}" data-height="${FH}" data-fps="${FPS}">
${host("frame", 0, TOTAL, "z-index:1", FW, FH, "graphics", 0)}
      <div id="stage">
${scenes.map((s, n) => host(s.id, s.start, s.dur, `z-index:${n + 1}`)).join("\n")}
${host("lyrics", 0, TOTAL, "z-index:95", W, H, "captions", 3)}
${host("dust", 0, TOTAL, "z-index:90", W, H, "graphics", 2)}
      </div>
${music}
${sfxTags}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync(path.join(OUT, "index.html"), index);
fs.writeFileSync(path.join(OUT, "cuts.json"), JSON.stringify({ total: TOTAL, segments: segs, scenes: scenes.map(({ id, start, dur }) => ({ id, start: r3(start), end: r3(start + dur) })) }, null, 1));
console.log(`WhatsApp cut: ${scenes.length} scenes, ${sfx.length} sfx, ${lyr.length} lyric lines, total ${r3(TOTAL)}s`);
