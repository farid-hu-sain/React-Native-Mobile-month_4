1. Jelaskan definisi Mobile App Development sesuai pemahaman anda beserta fokus utama dan output teknisnya!

jawaban :
Proses merancang, membangun, dan memelihata aplikasi berjalan pada perangkat mobile seperti smartphone dan tablet. tujuannya untuk menciptakan pengalaman pengguna yang optimal di perangkat bergerak (dari antarmuka sentuh, performa cepat, hingga akses fitur hardware seperti kamera, GPS, dan sensor)


2. Bandingkan perbedaan mendasar antara Web Development dan Mobile App Development dalam aspek target eksekusi, distribusi, dan akses hardware. Berikan contoh implikasi praktis dari perbedaan tersebut dalam pengembangan aplikasi sehari-hari.

jawaban :
web Development => target = Browser (Chrome, Safari, dll)
                   distribusi = melalui URL, server web
                   Akses Hardware = Via API web

MobileApp Development => target = sistem operasi (android atau ios)
                         distribusi = melalui app store (Google play, App store)
                         Akses Hardware = kamera, GPS, sensor, dll


3. Uraikan tahapan Discovery & Requirement dalam siklus hidup aplikasi mobile. Bagaimana tahap ini memengaruhi keputusan target platform (Android/iOS) dan kebutuhan offline/online?

jawaban :
1. identifikasi kebutuhan pengguna 
2. Analisis kompetitor dan benchmark UX
3. penentuan fitur inti dan MVP
4. Keputusan platform target
5. Evaluasi kebutuhan offline/online

dampaknya => - jika target market nya kebanyakan user android, maka android lebih prioritas
             - jika perlu offline mode, maka perlu strategi seperti SQlite? async storage sejak awal


4. Deskripsikan tahapan Perancangan Arsitektur & Teknologi dalam Mobile App Development, khususnya dalam konteks React Native sesuai pemahaman anda. Mengapa pemilihan strategi state management dan navigasi menjadi krusial di tahap ini?

jawaban : 
Di tahap ini, developer menentukan struktur logika, komponen, dan alur data aplikasi.

Dalam konteks React Native:
- Menentukan struktur folder dan modularisasi komponen.
- Menentukan navigasi: react-navigation (stack, tab, drawer).
- Menentukan state management: Context API, Redux, Zustand, atau Recoil.

5. Jelaskan perbedaan antara pendekatan Native Development dan Hybrid Development dalam pengembangan aplikasi mobile. Sertakan keuntungan serta kekurangan masing-masing, dan berikan contoh framework yang relevan selain dari yang telah disampaikan di materi.

jawaban :

Native Development => Teknologi = Kotlin/Java (Android), Swift (iOS)
                      Performa = Sangat cepat (native API langsung)
                      UI/UX = Sesuai standar platform
                      Akses Hardware = lengkap
                      Contoh Framework = Android Studio, Xcode

Hybrid Development => Teknologi = HTML, CSS, JS dalam webview
                      Performa = Lebih lambat (layer web di atas native)
                      UI/UX = Kadang terasa tidak natural
                      Akses Hardware = tidak lengkap
                      Contoh Framework = Ionic, Cordova, Framework7


6. Apa yang dimaksud dengan Cross-Platform Native Development? Bandingkan keuntungan dan kekurangannya dengan pendekatan native.

jawaban :
istilahnya pendekatan menulis satu basis kode yang dikompilasi menjadi app native di Android & iOS.

keuntungan = - Kode tunggal untuk dua platform
             - Lebih cepat dan hemat biaya
             - Komunitas besar & library banyak

kekurangan =  - Integrasi hardware kadang rumit
              - Performa bisa sedikit di bawah native
              - Debugging lintas platform kompleks


7. Posisikan React Native dalam ekosistem pengembangan aplikasi mobile. Bagaimana React Native berbeda dari ReactJS dalam hal target, sintaks dasar, dan styling?

jawaban :
ReactNative => Target = Android & iOS
               Sintaks dasar = Mirip React (komponen, props, hooks)
               styling = Menggunakan StyleSheet (mirip CSS tapi JS-based)
               DOM = Tidak ada DOM, tapi native view

ReactJs => Target = Browser web
           Sintaks dasar = React standar
           styling = CSS / Tailwind / styled-components
           DOM = HTML DOM

8. Analisis tantangan utama dalam pengembangan aplikasi mobile dibandingkan dengan web. Bagaimana pendekatan cross-platform seperti React Native mengatasi tantangan ini?

jawaban : 
Tantangan => - Banyak ukuran layar dan OS versi berbeda
             - Performa & resource terbatas
             - Harus lewat App Store/Play Store
             - Harus pakai izin & API spesifik
bagaimana cara React native membantu =>
- Cross-platform single codebase → kurangi overhead tim ganda.
- Native module bridging → tetap bisa akses fitur device.
- Hot reload → percepat development dan debugging.
           

9. Uraikan tahapan Pengujian dan Build, Signing, serta Release dalam Mobile App Development menggunakan React Native!

jawaban :
1. Testing 
- Unit test: Jest, React Native Testing Library.
- Integration test: Detox / Appium.
- Manual test: di emulator atau device fisik.

2. Build
- Android → gradlew assembleRelease menghasilkan .apk / .aab.
- iOS → Xcode build menghasilkan .ipa.

3. Signing
- Android: menggunakan keystore (.jks).
- iOS: menggunakan certificate dan provisioning profile.

4. Release
- Upload ke Play Console / App Store Connect.
- Lakukan review, metadata, screenshot, dan deploy ke publik.


10. Berdasarkan penjelasan diatas, jelaskan kenapa React native menjadi pilihan dalam development application mobile saat ini?

jawaban :
a. Efisiensi waktu & biaya — satu basis kode untuk dua platform.
b. Performa mendekati native — tidak seperti webview hybrid.
c. Hot Reload & Live Reload — iterasi super cepat.
d. Komunitas besar & library melimpah.
e. Integrasi mudah dengan modul native (kamera, notifikasi, maps).
f. Dipakai perusahaan besar: Meta, Shopify, Tesla, Microsoft, dan lainnya.

Singkatnya, React Native adalah “sweet spot” antara kecepatan hybrid dan performa native.