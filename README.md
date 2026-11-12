# MONDIS Web — Template RAW AI/AO 2026

Website statis: `index.html`, `styles.css`, `app.js`. Buka `index.html` pada browser atau unggah ketiganya ke root repository GitHub Pages. Tidak perlu Render atau Python.

## Kesesuaian workbook

Impor Excel membaca sheet **AI 2026 (template)**, **AO 2026**, **AI 2025**, dan **Copy of FINAL AO 2025**. Field utama mencakup nomor PRK, sumber anggaran, kontrak, pekerjaan, ULP, perusahaan, nilai SKKO/kontrak, tanggal, amandemen, risalah rapat, BA, tagihan, pembayaran, progres, status, kendala dan komitmen mitra. Tersedia ringkasan PRK, filter, dan backup JSON. Sheet pagu rekap tidak diimpor sebagai baris kontrak agar tidak menggandakan nilai.

**Impor membutuhkan koneksi internet** untuk memuat pustaka SheetJS dari CDN. Data dalam workbook **tidak disertakan** pada paket website. Impor dilakukan secara lokal di browser, bukan dikirim ke server.

## Batasan

Ini prototype, data disimpan pada `localStorage` perangkat/browser yang dipakai. Tidak ada sinkronisasi antarpegawai, autentikasi, audit trail atau database server. Jangan publikasikan data kontrak internal ke GitHub Pages atau perangkat bersama. Gunakan data dummy untuk uji coba. Backup JSON secara berkala; menghapus data browser akan menghilangkan data lokal.

Progres fisik dan nilai terbayar mengikuti data yang diinput/diimpor. Grafik mingguan dan validasi formula Excel yang rusak (`#REF!`) tidak direkonstruksi otomatis. Untuk penggunaan operasional, perlu backend, database persisten, kontrol akses, dan validasi data.
