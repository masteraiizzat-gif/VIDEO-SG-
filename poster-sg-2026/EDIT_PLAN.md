# Wira Malaysia ke Singapore 2026: pelan suntingan

## 1. Transkrip video contoh (`Poster Malaysia.mp4`, 2:28, 1080×1350)

Ditranskripsi dengan Whisper large-v3 (Bahasa Melayu).

| Masa | Ucapan |
| --- | --- |
| 0:00 – 0:07 | "Dengan bangganya, kami memperkenalkan barisan wakil terapi yang membawa nama Malaysia ke pertandingan antarabangsa di Singapura." |
| 0:07 – 0:14.5 | "Mereka adalah yang akan membuat Malaysia bangga di Pertandingan Kejohanan Holistik Masaj Dunia Singapura 2025." |
| 0:14.5 – 2:28 | Tiada ucapan, hanya muzik. Whisper ada "mendengar" *"Terima kasih kerana menonton"* empat kali di sini, tetapi itu halusinasi atas muzik, bukan suara sebenar. |

## 2. Masalah dalam video contoh yang dibuang

| Masalah | Di mana | Apa yang saya buat |
| --- | --- | --- |
| Hook lemah: 14.5 s pembaca berita, video 16:9 dengan bar hitam | 0:00 – 0:14.5 | Frame pertama terus tunjuk teks emas besar **"INILAH WIRA MALAYSIA"** atas reel poster yang bergerak laju, kemudian **"KE SINGAPORE!"** dihentak masuk pada 0.85 s |
| Animasi sama diulang 49 kali (bulatan emas → gambar kabur → teks taip) | 0:26 – 2:28 | 7 gaya masuk yang berbeza, disusun supaya dua poster bersebelahan tak pernah sama |
| Jeda janggal: bulatan emas kosong ~0.5 s antara setiap poster | setiap pertukaran | Tiada frame kosong. Setiap cut berlaku pada frame paling laju dalam pergerakan (whip / zoom / flash / flip) |
| Terlalu panjang | 2:28 | 1:22 (19 poster individu + 1 poster kumpulan) |
| Teks naratif hanya didengar | 0:00 – 0:14 | Ayat pembaca berita dijadikan kinetic typography (scene "intro") |

## 3. Struktur video baharu (1080×1350, 30 fps, 81.8 s)

| Masa | Scene | Animasi / motion graphics | Sound FX |
| --- | --- | --- | --- |
| 0.0 – 3.4 | **Hook** | 3 lajur reel poster (laju → perlahan), "INILAH WIRA MALAYSIA" sudah ada pada frame 0, "KE SINGAPORE!" slam + gegar + flash, cip "2026" pop, nama kejohanan blur-in perkataan demi perkataan, keluar dengan zoom-through | impact pada frame 0, bass hit pada slam, pop pada cip, whoosh sinematik |
| 3.4 – 8.7 | **Intro** | Sinar emas berputar, "Dengan bangganya kami perkenalkan" → "BARISAN WAKIL TERAPIS MALAYSIA" (slam perkataan), kemudian WORLD / TRADITIONAL MASSAGE / CHAMPIONSHIP + cip tarikh dan venue | 2 hit, whoosh, riser ke scene seterusnya |
| 8.7 – 17.7 | **Poster kumpulan** | Kamera meninjau 4 baris wajah (pan ular), kemudian zoom keluar ke poster penuh + "TAHNIAH! MALAYSIA THERAPIST TEAM" + cip tarikh | whoosh setiap pan, impact pada pull-out, sparkle |
| 17.7 – 73.8 | **19 poster individu** (2.9 – 3.4 s setiap satu) | Gaya masuk: *assemble* (poster dipotong jadi 6 jalur: gambar turun, nama wipe, TAHNIAH slam), *face* (mula zoom pada muka, tarik keluar), *slice* (3 jalur menegak), *whip*, *zoom-in*, *flip 3D*, *drop*. Setiap poster: kilauan cahaya emas, garis emas di tepi, kaunter 01/19 | whoosh (3 variasi pitch berputar), impact pada slam/landing, sparkle pada 5 poster |
| 73.8 – 81.8 | **Penutup** | 19 poster terbang ke dinding grid 5×4, "SEMOGA BERJAYA!" slam, "Pulang dengan kejayaan dan mengharumkan negara yang tercinta", "MALAYSIA BOLEH!", tarikh dan venue, tahan 3 s | whoosh, 2 bass hit, impact dalam, sparkle |

Habuk emas bergerak perlahan di atas semua scene.

## 4. Muzik

Laman muzik stok disekat dalam persekitaran ini, jadi muzik dijana secara lokal dengan **MusicGen** (bebas royalti, buatan sendiri). Gaya: *epic cinematic sports anthem: brass, taiko, staccato strings, heroic*. Cut disusun ikut beat lagu.

Kalau anda ada lagu sendiri (mp3), letak dalam `assets/music/` dan saya selaraskan semula semua cut dengan beat lagu itu.

## 5. Fail

- `build/timeline.json`: susunan poster, tempoh, gaya masuk (ubah di sini)
- `build/build.mjs`: penjana semua scene (`node build/build.mjs`)
- `index.html` + `compositions/*.html`: projek HyperFrames
- `assets/`: poster, latar kabur, font, SFX, muzik
