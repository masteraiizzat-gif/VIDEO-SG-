// Generates index.html + compositions/*.html for the "MTT Anthem — Malaysia Therapists Team, Singapore 2026" film.
// Edit build/timeline.json (durations, order, entrance styles), then: node build/build.mjs
import fs from "node:fs";
import path from "node:path";
import { W, H, FPS, r3, snap, FONTS, GOLD, BANDS, STRIPS, posterScene, dustScene, LOGO, LOGO_CSS, RAYS, slamTo, shakeOn, flashOn, teaserScene, chantScene, eventScene, mttGroupScene, juaraScene, lyricsScene, mttFinaleScene, wallHookScene } from "./scenes.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "build/timeline.json"), "utf8"));
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
