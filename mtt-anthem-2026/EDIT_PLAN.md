# MTT Anthem: Malaysia Therapists Team ke Singapore 2026

Video khas untuk 18 ahli rasmi MTT, disunting ikut lagu **"Lagu MTT anthem V4"** (penuh, 2:31.5).
Format 1080×1350 (4:5, sama seperti video contoh), 30 fps.

## 1. Transkrip lagu (Whisper large-v3, per tetingkap 24 s)

Vokal agak tenggelam dalam muzik, jadi lirik di bawah ialah **anggaran ASR**. Hanya frasa korus yang yakin dipaparkan di skrin.

| Masa lagu | Bahagian | Lirik |
| --- | --- | --- |
| 0:01.5 | Muzik bermula | |
| 0:13.7 – 0:20 | Chant intro | "Malaysia… Therapists… Team… kami juara!" |
| 0:26 – 0:44 | Verse 1 | "Dari tangan yang lembut memberi, terbit cahaya kasih sejati, sentuhan halus dari bumi bertuah, mengubat jiwa seluruh dunia. Langkah kami satu irama, dari hati penuh cinta." |
| 0:44 – 1:12 | **Korus 1** | "Malaysia berdiri megah, menyentuh dunia dengan jiwa. Kami juara, kami juara, suara dunia dengar nama kita. Malaysia Therapists Team bersatu tenaga, di persada dunia, kita bersinar selamanya." |
| 1:12 – 1:24 | Break muzik | |
| 1:24 – 1:48 | Verse 2 | "…tradisi disulam dengan ilmu, timur dan barat berpadu. Oh kasih harmoni… dari Kuala Lumpur merantau sedunia…" |
| 1:48 – 2:03 | **Korus 2** | "Malaysia terukir abadi, kami juara, kami juara, sentuhan suci dari jiwa bangsa, MTT berdiri di puncak dunia, membawa damai, membawa cahaya, Malaysia." |
| 2:10 – 2:13 | Tag outro | "Malaysia, kami juara!" |
| 2:13 – 2:33 | Outro muzik, tamat semula jadi | |

## 2. Apa yang lebih gempak berbanding video contoh

| Video contoh | Video MTT ini |
| --- | --- |
| 14.5 s pembaca berita, bar hitam | Frame 0 terus dinding 18 wajah + "18 WIRA", kotak emas melompat wajah ke wajah ikut beat |
| Muzik latar biasa | Lagu anthem MTT sendiri, **setiap cut pada beat** (154 BPM) |
| Teks tak ikut lagu | Perkataan dihentak **tepat pada vokal**: "MALAYSIA / THERAPISTS / TEAM / KAMI JUARA!" |
| Lirik tak dipapar | Lirik korus muncul perkataan demi perkataan sebagai lower-third emas, ikut masa nyanyian |
| Satu animasi diulang | 7 gaya masuk + punch-in ke wajah pada setiap poster + kilauan cahaya emas |
| Jeda kosong antara poster | Tiada frame kosong |
| | 2 slam skrin penuh "KAMI! JUARA! KAMI! JUARA!" (wajah bertukar setiap perkataan) |
| | Penutup: dinding 18 poster → poster MTT 18 → kad logo "ONE TOUCH, A THOUSAND HARMONY" → "MALAYSIA BOLEH!" pada hit terakhir lagu |

## 3. Struktur (masa video; video bermula pada 1.45 s lagu, iaitu bila muzik mula)

| Masa | Scene | Isi |
| --- | --- | --- |
| 0:00 – 0:12.2 | Teaser | Dinding 18 wajah + "18 WIRA / MALAYSIA THERAPISTS TEAM / KE SINGAPORE 2026!" → zoom tembus → strobe 8 poster (2 beat setiap satu): "SATU PASUKAN. SATU MISI. SATU MALAYSIA!" → cahaya membesar |
| 0:12.2 – 0:18.8 | Chant | Logo MTT + sinar emas; perkataan atas vokal; "JUARA!" + flash + letupan cahaya |
| 0:18.8 – 0:24.7 | Kejohanan | WORLD / TRADITIONAL MASSAGE / CHAMPIONSHIP, SINGAPORE 2026, tarikh, venue |
| 0:24.7 – 0:49.2 | Poster MTT 18 (verse 1) | Kamera meninjau 18 wajah baris demi baris; zoom keluar tepat pada korus → "TAHNIAH! 18 AHLI RASMI MTT" + lirik "Malaysia berdiri megah…" |
| 0:49.2 – 0:52.3 | Slam 1 | KAMI! JUARA! KAMI! JUARA! |
| 0:52.3 – 1:48.2 | 15 poster individu | ~3.7 s setiap satu, lirik korus di bawah |
| 1:48.2 – 1:51.3 | Slam 2 | KAMI! JUARA! KAMI! JUARA! |
| 1:51.3 – 2:02.9 | 3 poster terakhir | lirik korus 2 |
| 2:02.9 – 2:31.5 | Penutup | Dinding 18 poster → "MALAYSIA… KAMI JUARA!" (atas tag outro) → poster MTT 18 + "TAHNIAH! Semoga pulang dengan kejayaan…" → kad logo → "MALAYSIA BOLEH!" |

**Susunan 18 ahli** (ikut poster MTT 18): Shah, Mohamad, Rex, Akmal, Sukri, Sherry Soep, Lynd. A. Robert, Adriana Jane, Marinda Majapin, Lucia, Izza, Norashikin, Siti Hamidah, Rias, Leo Zackery, Qaizil, Roslan, Sam Yong.

## 4. Fail

- `build/timeline.json`: semua masa (dalam masa **lagu**), susunan poster, gaya masuk, lirik
- `build/beats.json`: grid beat lagu
- `build/build.mjs`: penjana (`node build/build.mjs`)
