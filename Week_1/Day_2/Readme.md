1. Jelaskan konsep dasar React Native sebagai framework cross-platform, termasuk perbedaan utamanya dengan React untuk web. Sertakan penjelasan singkat tentang peran New Architecture di React Native v0.80 dan bagaimana hal itu memengaruhi performa aplikasi mobile.

jawaban: 
React Native adalah framework cross-platform yang dikembangkan oleh Meta (Facebook) untuk membangun aplikasi mobile native (Android & iOS) menggunakan JavaScript dan React.

perbedaan utama 
React web => target: Browser (HTML, CSS, JS)
             Rendering Engine: DOM & CSS
             styling: CSS / Styled Components
             Navigasi: React Router
             Akses Hardware: Browser API
             build output: SPA / Web App

React Native => target: Mobile (Android & iOS)
                Rendering Engine: Native Components (via Bridge / Fabric)
                styling: StyleSheet (mirip CSS tapi berbasis JS)
                Navigasi: React Navigation / Native Stack Navigator
                Akses Hardware: Luas (Camera, GPS, Bluetooth, dll lewat Native Modules)
                build output: Native App (.apk / .ipa)

penjelasan: 
New Architecture di React Native v0.80 adalah pembaruan besar yang menggantikan sistem lama berbasis Bridge dengan teknologi baru seperti JSI (JavaScript Interface), Fabric Renderer, dan TurboModules.

Perannya adalah mempercepat komunikasi antara kode JavaScript dan komponen native tanpa perlu serialisasi data, membuat UI dirender lebih halus, startup aplikasi lebih cepat, dan penggunaan memori lebih efisien.

Hasilnya, performa aplikasi React Native kini jauh lebih mendekati aplikasi native sesungguhnya — lebih responsif, stabil, dan modern.



2. Bandingkan React Native CLI dan Expo dari segi arsitektur serta proses build. Diskusikan satu kelebihan dan satu kekurangan masing-masing, lalu berikan contoh skenario proyek di mana Anda akan memilih salah satu di atas, beserta alasannya.

jawaban:
React Native CLI memberi akses penuh ke kode native (Android & iOS).
Developer mengatur konfigurasi sendiri, termasuk android/ dan ios/ folders, Gradle, dan Xcode. Proses build dilakukan langsung lewat Android Studio / Xcode / Metro bundler, dengan fleksibilitas penuh untuk menambah native module atau library pihak ketiga.

Expo adalah wrapper framework di atas React Native. Ia menyembunyikan kompleksitas native layer dan menyediakan managed workflow — artinya kamu tidak perlu menyentuh kode native sama sekali. Build dijalankan melalui Expo CLI dan bisa dikirim ke server build milik Expo (EAS Build), membuat prosesnya cepat dan mudah, tapi lebih terbatas.

Kelebihan React Native CLI => Fleksibel dan bebas menulis/mengubah kode native (Java, Kotlin, Swift, Objective-C). Cocok untuk aplikasi kompleks atau integrasi hardware khusus.
Kelemahan React Native CLI => Setup dan proses build lebih rumit; butuh Android Studio/Xcode dan konfigurasi manual.

kelebihan Expo => Cepat dan mudah digunakan — tinggal npx create-expo-app, langsung jalan tanpa konfigurasi native. Ideal untuk prototipe cepat.
kelemahan Ecpo => idak semua library native didukung (kecuali eject ke Bare Workflow). Akses ke kode native terbatas.

skenario proyek :
Gunakan Expo jika proyekmu fokus pada kecepatan pengembangan dan tidak memerlukan modul native khusus.
 Contoh: aplikasi event atau katalog produk sederhana dengan fitur standar (UI, API fetch, dan push notification dasar).

Gunakan React Native CLI jika kamu butuh kontrol penuh terhadap native layer atau integrasi tingkat rendah.
 Contoh: aplikasi e-commerce dengan kamera barcode scanner, Bluetooth, atau sistem pembayaran yang butuh SDK native.



3. Dalam setup environment Android menggunakan command-line tools, jelaskan mengapa SDK Platforms (android-35), Build Tools (35.0.0), dan Platform Tools masing-masing diperlukan untuk React Native. Berikan contoh bagaimana ketidakhadiran salah satu komponen tersebut dapat menyebabkan masalah saat menjalankan proyek pertama Anda di VS Code.

jawaban:

A. SDK Platforms (android-35)
fungsi :
- Berisi API level Android (API 35) yang menjadi target build dan tempat compiler mencari framework classes (seperti android.app.Activity, android.view.View, dll).
- React Native (dan Gradle) membutuhkan SDK platform compileSdkVersion di android/app/build.gradle.

kalau tidak ada :
Gradle akan gagal saat compile time, karena tidak tahu ke mana harus merujuk API Android.

B. Build Tools (35.0.0)
fungsi : 
- Menyediakan utilitas untuk build process, seperti aapt2, dx, zipalign, dan apksigner.
-  Tanpa build tools yang cocok, Gradle tidak bisa mengonversi, mengompresi, atau menandatangani file APK/AAB.

kalau tidak ada : 
Proses build akan berhenti di tengah progress

C. Platform Tools 
fungsi : 
- Berisi alat komunikasi antara host dan perangkat Android seperti adb, fastboot, dan dmtracedump.
- React Native CLI menggunakan adb untuk men-deploy app ke emulator/device dan untuk menjalankan Metro bundler pada perangkat.

kalau tidak ada :
Aplikasi berhasil dibuild tapi tidak bisa dijalankan di emulator atau device — kayak masak sudah matang tapi nggak punya piring buat nyaji.



4. Bahas prasyarat umum setup React Native CLI v0.80, seperti Node.js, Watchman, dan Yarn, termasuk alasan mengapa masing-masing diperlukan untuk menjembatani JavaScript ke native runtime.

jawaban :
1. Node.js

fungsi :
- Menjalankan JavaScript bundler (Metro), yang membungkus seluruh kode JS + dependencies menjadi satu file (index.bundle)
- Node.js juga digunakan oleh React Native CLI untuk menjalankan perintah build, start, dan debug via script JS.

mengapa penting :
- Node menyediakan lingkungan eksekusi untuk membangun bundle JS yang nantinya dikirim ke native runtime Hermes di perangkat.
- Jadi Node = “pabrik bundle” sebelum kode JS dikonsumsi oleh native engine.

2. Watchman 

fungsi : 
- Tool buatan Meta untuk memantau perubahan file secara real-time.
- Digunakan oleh Metro bundler agar update kode JS langsung ter-refleksi (Hot Reload / Fast Refresh) tanpa restart server.

mengapa penting :
- Saat kamu ubah kode JS, Watchman mendeteksi perubahan dan memberi tahu Metro agar mengirim update ke runtime native.
- Ini menjaga sync state antara development server (JS) dan native app (emulator/device).

3. Yarn atau npm

fungsi :
- Mengelola dependencies React Native dan modul native (misalnya react-native-gesture-handler, react-native-reanimated, dll).
- Yarn memastikan versi library yang digunakan konsisten dan cepat diinstal.

mengapa penting :
- Banyak package React Native memiliki binding ke native code (C++, Java, Swift).
- Yarn memastikan integrasi antara JS dependencies dan native module build tetap selaras (misal di node_modules + android/settings.gradle).



5. Deskripsikan struktur folder utama dalam proyek React Native CLI, termasuk fungsi folder android/, ios/, dan file-file JS seperti App.js serta metro.config.js. Jelaskan bagaimana struktur ini mendukung pengembangan cross-platform dan navigasi di VS Code.

Struktur Umum Proyek React Native CLI
my-react-native-app/
├── android/
├── ios/
├── node_modules/
├── app.json
├── package.json
├── index.js
├── App.js
├── metro.config.js
├── babel.config.js
└── .watchmanconfig 

1. android/

Isi: kode native Android dalam Java/Kotlin dan konfigurasi Gradle.

Fungsi:
Tempat Gradle build system mengatur compile SDK, dependencies, dan build APK/AAB.

File penting:
- android/app/build.gradle → konfigurasi app-level (misalnya applicationId, compileSdkVersion, dll).
- MainActivity.java & MainApplication.java → entry point Android native.
- AndroidManifest.xml → izin dan metadata aplikasi Android.

Peran cross-platform:
- Folder ini memungkinkan React Native menjalankan kode JavaScript di atas Android runtime, sementara logika JS tetap sama dengan iOS.

2. ios/

Isi: kode native iOS dalam Objective-C/Swift dan proyek Xcode (.xcworkspace).

Fungsi:
Menyimpan konfigurasi build Xcode untuk menghasilkan .app atau .ipa.

File penting:
- ios/MyApp/AppDelegate.m → entry point native untuk iOS.
- Info.plist → metadata dan izin iOS (kamera, lokasi, dll).

Peran cross-platform:
- Sama seperti android/, folder ini menghubungkan jembatan JS dengan native iOS melalui bridge modules.

3. App.js

Fungsi:
- File komponen utama React Native — biasanya memanggil komponen, navigasi, atau konteks global pertama kali.

Peran cross-platform:
- Kode di sini 100% JavaScript (atau TypeScript), jadi bisa berjalan di Android dan iOS tanpa ubahan.
- React Native runtime-lah yang men-translate elemen seperti <View> menjadi native view setempat (Android ViewGroup / iOS UIView).

4. index.js

Fungsi:
- Entry point aplikasi JavaScript.
- Mendaftarkan App ke registry React Native
- Saat app dijalankan di Android/iOS, runtime memanggil fungsi ini dulu.

Peran cross-platform:
- Satu titik masuk (entry point) untuk dua platform — React Native runtime akan memutuskan layer mana yang dipanggil.

5. metro.config.js

Fungsi:
- Konfigurasi Metro bundler, alat yang membundel semua file JS menjadi satu.
- Digunakan untuk menambah alias, custom resolver, atau asset plugin.

Peran cross-platform:
- Metro mem-bundle kode JS yang sama untuk kedua platform, menjamin konsistensi dan efisiensi saat build.

6. babel.config.js

Fungsi:
- Menentukan cara Babel mentranspilasi sintaks modern JS (ESNext, JSX) agar bisa dipahami oleh Metro dan native engine (Hermes).

Peran cross-platform:
- Babel memastikan kode yang sama bisa dijalankan di dua runtime berbeda tanpa konflik versi JS engine.

7. package.json

Fungsi:
- Daftar dependencies dan script CLI (react-native run-android, start, test, dll).
- Menjadi penghubung antar library JS dan native (via autolinking).

8. node_modules/

Fungsi:
- Tempat semua dependencies (React, React Native core, dan modul pihak ketiga) disimpan.
- Termasuk modul native dengan binding (misalnya react-native-reanimated punya kode C++ di sini).


# Navigasi di VS Code
Struktur ini sangat  terorganisir untuk kerja lintas platform:
- Kamu menulis logic dan UI di App.js dan folder src/ (kalau kamu buat) → berlaku di Android & iOS.
- Kalau perlu ubah perilaku native tertentu → buka android/ atau ios/.
- VS Code bisa dengan mudah:
    - Melakukan search project-wide (Ctrl+Shift+F) lintas platform.
    - Menjalankan task terminal (npx react-native run-android) langsung di dalam editor.
    - Memberikan IntelliSense untuk JS dan native bridge (jika plugin disetup).