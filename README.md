# TIFA — Tracking Investment, Finance & Activities

Aplikasi monitoring AI & AO PLN UP3 Jayapura dengan identitas visual khas Papua (tifa).

## Isi paket
- `index.html`: halaman web utama
- `styles.css`: desain responsif warna biru, kuning, putih
- `app.js`: dashboard, AI/AO 2025–2026, PRK, Monev, impor Excel, backup JSON
- `assets/tifa-logo.svg`: logo vektor TIFA

## Menjalankan
Ekstrak ZIP, lalu buka `index.html` pada browser. Untuk GitHub Pages, unggah seluruh file termasuk folder `assets` ke root repository dan aktifkan Settings → Pages → Deploy from a branch.

Impor Excel menggunakan pustaka SheetJS dari CDN dan memerlukan internet. Pemetaan kolom impor mengikuti prototipe MONDIS sebelumnya; verifikasi hasil terhadap workbook sebelum digunakan.

## Penting
Penyimpanan menggunakan `localStorage` browser. Tidak ada backend, autentikasi, sinkronisasi multiuser, maupun audit trail. Jangan gunakan data operasional sensitif pada situs publik. Untuk produksi, perlu backend aman, autentikasi, database persisten dan backup terkelola.

Logo ini adalah konsep identitas TIFA, bukan logo resmi PLN; jangan mengganti logo resmi PLN tanpa persetujuan.


## Modul baru: Progres Fisik & Kurva S per pekerjaan
- Pilih pekerjaan dari data AI/AO yang sudah dibuat atau diimpor.
- Klik **+ Item pekerjaan** untuk mengisi uraian RAB, satuan, volume rencana, volume realisasi dan harga satuan.
- Bobot item dihitung dari nilai item dibanding total RAB; progres fisik berbobot dari realisasi volume.
- Klik **+ Periode** untuk mencatat rencana dan realisasi kumulatif (0–100%) setiap bulan.
- Grafik Kurva S, deviasi dan tabel historis ditampilkan khusus untuk pekerjaan yang dipilih.
- Backup JSON sekarang menyertakan data item RAB dan periode Kurva S.
- Data tetap di browser lokal, bukan server. Jangan masukkan data sensitif operasional.

**Catatan:** Progres fisik berbobot dan realisasi Kurva S adalah dua indikator berbeda: Kurva S diinput per periode secara manual, tidak otomatis tersinkron dengan perhitungan volume RAB. Periode yang dimasukkan tidak boleh duplikat per pekerjaan.
