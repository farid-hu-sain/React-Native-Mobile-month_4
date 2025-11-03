1. Jelaskan konsep dasar React Native sebagai framework cross-platform, termasuk perbedaan utamanya dengan React untuk web. Sertakan penjelasan singkat tentang peran New Architecture di React Native v0.80 dan bagaimana hal itu memengaruhi performa aplikasi mobile.

jawaban : 
React Native adalah framework cross-platform yang memungkinkan pengembang membangun aplikasi mobile untuk Android dan iOS menggunakan JavaScript dan konsep React. Prinsip dasarnya adalah “write once, run anywhere” — kode logika dan antarmuka ditulis satu kali namun dapat dijalankan di berbagai platform, karena React Native menerjemahkan komponen JavaScript menjadi komponen native milik sistem operasi target. Dengan pendekatan ini, aplikasi yang dihasilkan tetap memiliki tampilan dan performa layaknya aplikasi native murni, bukan sekadar aplikasi web yang dibungkus.

Sementara itu, React untuk web beroperasi sepenuhnya di dalam browser. Ia merender elemen-elemen UI ke dalam Document Object Model (DOM) menggunakan HTML dan CSS, serta memanfaatkan API browser untuk interaksi dasar seperti event, animasi, atau penyimpanan lokal. React di web berfokus pada tampilan berbasis halaman dan interaksi pengguna melalui media browser, bukan pada integrasi mendalam dengan perangkat.

Perbedaan paling mencolok antara keduanya terletak pada lingkungan eksekusi dan target rendering. React di web hanya berinteraksi dengan elemen HTML dan gaya CSS yang diatur oleh browser, sedangkan React Native langsung merender antarmuka menggunakan komponen UI asli seperti View, Text, atau Image, yang masing-masing akan diterjemahkan menjadi elemen visual native di Android dan iOS. Dengan demikian, React Native tidak menghasilkan HTML sama sekali, melainkan langsung membangun tampilan dari elemen native perangkat.

Dari sisi styling, React Native tidak menggunakan CSS tradisional, melainkan sistem gaya berbasis StyleSheet API. Meskipun sintaksnya mirip dengan CSS, ia sebenarnya berupa objek JavaScript yang dikompilasi ke properti native. Pendekatan ini memastikan performa lebih cepat sekaligus tetap memberi fleksibilitas dalam mengatur tata letak.

Selain itu, React Native juga memiliki kemampuan untuk berinteraksi langsung dengan fitur-fitur native seperti kamera, GPS, sensor, atau penyimpanan lokal melalui Native Modules. Hal ini tidak dimiliki React untuk web, yang terbatas pada API yang disediakan browser.

Peran New Architecture di React Native v0.80

Mulai versi 0.80, React Native memperkenalkan New Architecture yang secara fundamental mengubah cara JavaScript berkomunikasi dengan kode native. Sistem lama menggunakan “bridge” berbasis serialisasi JSON yang menyebabkan komunikasi dua arah menjadi lambat dan tidak efisien. Kini, New Architecture membawa tiga elemen utama:

- JSI (JavaScript Interface) — menggantikan bridge lama dengan jembatan langsung antara JavaScript dan native, tanpa proses serialisasi.

- TurboModules — modul native dimuat hanya saat dibutuhkan (lazy loading), mempercepat waktu awal aplikasi terbuka.

- Fabric Renderer — mesin render baru yang lebih efisien dalam mengatur UI native dan mempercepat pembaruan tampilan.

Dengan arsitektur baru ini, komunikasi antar layer menjadi lebih cepat, UI terasa lebih responsif, dan penggunaan memori lebih efisien. Hasilnya, performa aplikasi meningkat secara signifikan, terutama pada animasi kompleks atau interaksi berat dengan modul native.

Secara keseluruhan, React Native menggabungkan kenyamanan pengembangan React dengan kekuatan performa native, sementara New Architecture di versi 0.80 menjadi fondasi baru yang membawa framework ini menuju performa yang setara dengan aplikasi native murni


2. Bandingkan React Native CLI dan Expo dari segi arsitektur serta proses build. Diskusikan satu kelebihan dan satu kekurangan masing-masing, lalu berikan contoh skenario proyek di mana Anda akan memilih salah satu di atas, beserta alasannya.

jawaban : 
React Native CLI dan Expo sebenarnya berada di jalur yang sama, namun dengan filosofi pengembangan yang berbeda. React Native CLI memberikan kendali penuh terhadap lapisan native, sedangkan Expo menawarkan kenyamanan dan kecepatan dengan sistem yang lebih tertutup.
Pada React Native CLI, arsitekturnya terbuka sehingga pengembang bisa langsung berinteraksi dengan struktur proyek native di dalam folder android/ dan ios/. Proses build dilakukan secara manual menggunakan Android Studio dan Xcode, memberi fleksibilitas tinggi untuk menambahkan modul native, mengonfigurasi dependensi, atau mengoptimalkan performa sesuai kebutuhan aplikasi. Pendekatan ini cocok bagi proyek yang memerlukan kustomisasi mendalam atau integrasi SDK pihak ketiga seperti sistem pembayaran, kamera lanjutan, atau Bluetooth. Namun, konsekuensinya adalah proses setup yang lebih rumit—developer harus menyiapkan environment Android dan iOS lengkap, serta menangani sendiri berbagai konfigurasi build yang bisa memakan waktu.

Berbeda dengan itu, Expo menghadirkan pendekatan managed framework yang jauh lebih praktis. Ia membungkus React Native dengan serangkaian alat bantu, SDK, dan layanan build terintegrasi bernama Expo Application Services (EAS). Dengan Expo, developer bisa memulai proyek dan membangun aplikasi tanpa perlu menyentuh kode native sama sekali. Semua konfigurasi Android dan iOS sudah diatur secara otomatis, sehingga proses pengembangan jauh lebih cepat. Expo juga menyediakan banyak modul siap pakai seperti kamera, notifikasi, dan sensor perangkat, sehingga sangat ideal untuk membuat prototipe atau aplikasi dengan kebutuhan standar.

Namun, karena bersifat tertutup, Expo membatasi akses terhadap fitur native tertentu. Jika proyek membutuhkan library di luar ekosistem Expo, pengembang harus melakukan proses eject—mengubah proyek menjadi format React Native CLI agar bisa mengedit lapisan native secara langsung. Proses ini sering kali membuat proyek kehilangan sebagian kemudahan yang sebelumnya ditawarkan Expo.

Sebagai ilustrasi, jika Anda membangun aplikasi skala besar dengan fitur kompleks dan ketergantungan tinggi terhadap kode native—misalnya aplikasi marketplace yang butuh integrasi pembayaran lokal atau akses kamera tingkat rendah—React Native CLI adalah pilihan tepat karena memberi kebebasan penuh dalam kontrol teknis dan optimisasi performa.
Sebaliknya, bila Anda ingin membuat aplikasi ringan seperti katalog produk, aplikasi event, atau prototipe internal yang harus cepat dirilis, Expo akan jauh lebih efisien. Anda bisa fokus ke logika aplikasi tanpa terbebani oleh konfigurasi build atau setup SDK native.
Singkatnya, React Native CLI adalah jalan bagi mereka yang butuh fleksibilitas dan kendali, sedangkan Expo lebih cocok bagi yang mengutamakan kecepatan dan kemudahan dalam pengembangan.


3. Dalam setup environment Android menggunakan command-line tools, jelaskan mengapa SDK Platforms (android-35), Build Tools (35.0.0), dan Platform Tools masing-masing diperlukan untuk React Native. Berikan contoh bagaimana ketidakhadiran salah satu komponen tersebut dapat menyebabkan masalah saat menjalankan proyek pertama Anda di VS Code.


jawaban :
Dalam setup Android via command-line, tiga komponen utama — SDK Platforms, Build Tools, dan Platform Tools — punya fungsi penting agar proyek React Native bisa dibangun dan dijalankan dengan benar.

A> SDK Platforms (android-35)
Menyediakan API dan library Android untuk kompilasi sesuai versi target (misalnya Android 14).
    ➤ Tanpa ini, Gradle akan gagal menemukan target platform dan menampilkan error seperti:
    Failed to find target with hash string 'android-35'.

B. Build Tools (35.0.0)
Berisi alat kompilasi seperti aapt dan apksigner yang mengubah kode menjadi APK/AAB.
    ➤ Jika hilang, build berhenti dengan pesan:
    Failed to find Build Tools revision 35.0.0.

C. Platform Tools
Menyediakan adb untuk komunikasi dengan emulator atau perangkat fisik.
    ➤ Tanpanya, proyek tidak bisa dijalankan karena perangkat tidak terdeteksi:
    No connected devices found.


4. Bahas prasyarat umum setup React Native CLI v0.80, seperti Node.js, Watchman, dan Yarn, termasuk alasan mengapa masing-masing diperlukan untuk menjembatani JavaScript ke native runtime.

jawaban : 
Dalam setup React Native CLI v0.80, ada beberapa prasyarat penting yang wajib diinstal agar lingkungan pengembangan dapat berjalan stabil dan mampu menjembatani eksekusi JavaScript ke native runtime. Tiga di antaranya adalah Node.js, Watchman, dan Yarn — masing-masing memiliki peran khusus dalam proses build dan runtime React Native.

1. Node.js

Node.js berfungsi sebagai mesin eksekusi JavaScript di luar browser. React Native menggunakan Node.js untuk menjalankan Metro bundler — alat yang menggabungkan seluruh kode JavaScript, komponen React, dan dependensi menjadi satu bundle yang kemudian dikirim ke aplikasi mobile saat dijalankan.

Tanpa Node.js, kode React (JSX/TSX) tidak bisa ditranspilasi dan dikomunikasikan ke native runtime. Singkatnya, Node.js adalah “otak” yang mengeksekusi dan menyalurkan logika JavaScript ke dunia native.

2. Watchman

Watchman (dibuat oleh Meta) berfungsi untuk memantau perubahan file secara real-time. Ketika pengembang menyimpan perubahan pada kode, Watchman memberi tahu Metro bundler untuk melakukan hot reload atau fast refresh tanpa perlu membangun ulang seluruh aplikasi.

Tanpa Watchman, proses pengembangan akan terasa lambat karena setiap perubahan kecil harus dijalankan ulang secara manual. Watchman memastikan pengalaman “live coding” React Native tetap cepat dan responsif.

3. Yarn

Yarn adalah package manager alternatif selain npm, yang digunakan untuk mengelola dependensi proyek React Native. Ia menyediakan instalasi yang lebih cepat dan deterministik (menggunakan file yarn.lock), sehingga versi library antara developer tetap konsisten.

Peran Yarn dalam menjembatani JavaScript ke native runtime terletak pada pengelolaan modul JavaScript dan Native Modules. Ia memastikan dependensi seperti react-native, metro, atau modul pihak ketiga yang berisi jembatan ke kode native terpasang dengan benar dan dalam versi yang sesuai.


5. Deskripsikan struktur folder utama dalam proyek React Native CLI, termasuk fungsi folder android/, ios/, dan file-file JS seperti App.js serta metro.config.js. Jelaskan bagaimana struktur ini mendukung pengembangan cross-platform dan navigasi di VS Code.

jawaban :
📁 1. Folder android/

Berisi seluruh kode dan konfigurasi untuk platform Android.
Di dalamnya terdapat proyek Gradle lengkap dengan struktur seperti aplikasi native pada umumnya (app/src/main/java/, AndroidManifest.xml, dan build.gradle).

Fungsinya:

Menyimpan kode native berbasis Java atau Kotlin.

Mengatur dependensi Android, versi SDK, dan izin aplikasi.

Menjadi tempat build file .apk atau .aab yang akan dijalankan di emulator/perangkat.

Jika pengembang ingin menambahkan Native Module khusus Android (misalnya integrasi dengan API kamera atau Bluetooth), semua modifikasi dilakukan di sini.

🍏 2. Folder ios/

Berisi proyek Xcode untuk platform iOS.
Di dalamnya terdapat file seperti AppDelegate.m, Info.plist, dan konfigurasi CocoaPods (Podfile).

Fungsinya:

Menampung kode native berbasis Objective-C atau Swift.

Mengatur izin sistem dan integrasi pustaka pihak ketiga melalui Pods.

Menjadi dasar saat aplikasi dikompilasi menjadi .ipa untuk dijalankan di simulator atau perangkat iPhone.

Dengan struktur ini, React Native bisa memanfaatkan fitur native iOS sambil tetap berbagi logika utama dengan Android.

💻 3. File JavaScript Utama
App.js

Merupakan titik masuk utama aplikasi React Native di sisi JavaScript. File ini mendefinisikan root component dan logika UI menggunakan React. Semua tampilan, state, dan navigasi biasanya dimulai dari sini.

Contohnya:

import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View>
      <Text>Hello React Native!</Text>
    </View>
  );
}


App.js adalah tempat di mana React Native menggabungkan logika JavaScript dengan komponen native seperti View dan Text, yang kemudian dirender secara langsung di masing-masing platform.

index.js

File ini mendaftarkan komponen utama aplikasi (App) ke dalam AppRegistry, yang menjadi penghubung antara dunia JavaScript dan native runtime:

import { AppRegistry } from 'react-native';
import App from './App';
AppRegistry.registerComponent('MyApp', () => App);


Tanpa index.js, React Native tidak tahu komponen mana yang harus dirender pertama kali.

 4. File Konfigurasi
metro.config.js

Digunakan untuk mengatur perilaku Metro bundler, yaitu alat yang memproses semua file JavaScript, gambar, dan aset sebelum dikirim ke aplikasi.
File ini memungkinkan penyesuaian seperti alias path, ekstensi tambahan, atau optimasi build.

Fungsinya penting karena Metro bertugas menjembatani logika JavaScript agar bisa dipahami oleh runtime native.

 5. Dukungan Cross-Platform dan Navigasi di VS Code

Struktur ini mendukung pengembangan lintas platform dengan cara memisahkan lapisan native dan JavaScript secara bersih:

Semua logika UI dan bisnis ditulis di file JavaScript (berbagi antara Android dan iOS).

Folder android/ dan ios/ hanya digunakan bila ada kebutuhan spesifik platform.

Di VS Code, struktur ini mempermudah navigasi:

Developer bisa berpindah cepat antara lapisan JavaScript (misalnya App.js) dan konfigurasi native (android/build.gradle atau ios/Info.plist).

Dukungan linting dan autocompletion di VS Code membantu mendeteksi kesalahan lintas platform dengan efisien.