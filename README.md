# vsce-lite 🚀

[![NPM Version](https://img.shields.io/npm/v/@antonpras/vsce-lite.svg)](https://www.npmjs.com/package/@antonpras/vsce-lite)
[![Lisensi: MIT](https://img.shields.io/badge/Lisensi-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**vsce-lite** adalah sebuah alat baris perintah (CLI) yang ringan, cepat, dan tanpa dependensi *native* untuk mengemas ekstensi Visual Studio Code menjadi file `.vsix`. Dibuat khusus untuk lingkungan pengembangan di mana `vsce` standar mungkin gagal, seperti Termux di Android.

Alat ini 100% ditulis dalam JavaScript, memastikan kompatibilitas lintas platform yang maksimal.

## ✨ Fitur Utama

- **✅ Pengemasan Cepat:** Mengubah direktori proyek Anda menjadi file `.vsix` yang siap didistribusikan.
- **🧠 Cerdas & Aman:** Secara otomatis membaca file `.vscodeignore` untuk mengecualikan file yang tidak perlu (seperti `node_modules/` atau `.git/`).
- **🤖 Otomatisasi Versi:** Naikkan versi ekstensi Anda langsung dari baris perintah dengan opsi `--patch`, `--minor`, atau `--major`.
- **🛡️ Validasi Manifest:** Memeriksa `package.json` Anda untuk field-field penting sebelum mengemas, mencegah error di tengah jalan.
- **📂 Output Fleksibel:** Tentukan di mana file `.vsix` akan disimpan menggunakan opsi `--out`.
- **💪 Tangguh:** Secara otomatis membuat direktori output jika belum ada.
- **📱 Kompatibel dengan Termux:** Dibangun dan diuji untuk bekerja dengan lancar di lingkungan Termux.

## 📦 Instalasi

Karena `vsce-lite` adalah alat baris perintah berbasis Node.js, Anda memerlukan Node.js dan npm terinstal di sistem Anda.

Instal secara global menggunakan npm:
```bash
npm install -g @antonpras/vsce-lite
```

## 🚀 Penggunaan

Penggunaan dasar sangat sederhana. Cukup arahkan ke direktori proyek ekstensi Anda.

```bash
# Jalankan dari direktori mana pun, menargetkan folder ekstensi
vsce-lite /path/to/your/extension
```

### Contoh Perintah

**1. Mengemas Proyek**
```bash
vsce-lite ~/my-vscode-extension
```
> Ini akan membuat `publisher.my-vscode-extension-1.0.0.vsix` di direktori saat ini.

**2. Menentukan Direktori Output**
Gunakan opsi `-o` atau `--out`.
```bash
vsce-lite ~/my-vscode-extension -o ~/Desktop/builds
```
> File `.vsix` akan disimpan di dalam folder `~/Desktop/builds`.

**3. Menaikkan Versi Secara Otomatis**
Gunakan opsi `--patch`, `--minor`, atau `--major`.
```bash
# Jika versi saat ini 1.0.0, ini akan mengubahnya menjadi 1.0.1
vsce-lite ~/my-vscode-extension --patch

# Jika versi saat ini 1.0.1, ini akan mengubahnya menjadi 1.1.0
vsce-lite ~/my-vscode-extension --minor
```
> Perintah ini akan **memodifikasi `package.json` Anda** dengan nomor versi baru sebelum mengemas.

---

Dibuat dengan ❤️ oleh [antonDpras / RyumaTsukiro](https://github.com/antonpras).
