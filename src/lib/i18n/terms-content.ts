import type { Locale } from "./locale";

export type TermsCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string }[];
};

const id: TermsCopy = {
  metaTitle: "Syarat & Ketentuan — Rampungin",
  metaDescription:
    "Syarat dan Ketentuan penggunaan layanan Rampungin, termasuk tanggung jawab konten yang dihasilkan pengguna dan batasan tanggung jawab pengelola.",
  title: "Syarat dan Ketentuan",
  updated: "Berlaku efektif: 25 Juli 2026",
  intro:
    "Dokumen ini mengatur akses dan penggunaan layanan Rampungin (“Layanan”). Dengan mengakses, mendaftar, atau menggunakan Layanan, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat pada Syarat dan Ketentuan ini (“Syarat”). Apabila Anda tidak menyetujui Syarat ini, Anda wajib segera menghentikan penggunaan Layanan.",
  sections: [
    {
      heading: "1. Definisi",
      body: "“Pengguna” berarti setiap individu yang mengakses atau menggunakan Layanan. “Kreator” berarti Pengguna yang membuat, mengunggah, mengubah, atau membagikan Prompt. “Prompt” berarti teks, templat, parameter, media, metadata, atau materi lain yang diunggah atau dipublikasikan melalui Layanan. “Pengelola” berarti pemilik dan/atau penyelenggara platform Rampungin.",
    },
    {
      heading: "2. Sifat layanan",
      body: "Rampungin merupakan platform komunitas yang menyediakan fasilitas untuk menemukan, menyimpan, menilai, dan membagikan Prompt. Pengelola tidak bertindak sebagai penulis, penerbit, penasihat profesional, maupun penjamin atas isi, kualitas, kelayakan, atau hasil penggunaan Prompt apa pun. Layanan disediakan “sebagaimana adanya” (as is) dan “sebagaimana tersedia” (as available).",
    },
    {
      heading: "3. Kelayakan dan akun",
      body: "Anda bertanggung jawab penuh atas kerahasiaan kredensial akun serta seluruh aktivitas yang terjadi di bawah akun Anda. Anda menjamin bahwa informasi yang Anda berikan adalah akurat dan bahwa Anda berwenang untuk mengikatkan diri pada Syarat ini. Pengelola berhak menolak, menangguhkan, atau mengakhiri akses apabila terdapat dugaan pelanggaran Syarat, penyalahgunaan, atau risiko hukum.",
    },
    {
      heading: "4. Konten yang dihasilkan pengguna",
      body: "Seluruh Prompt dan materi terkait yang dibuat atau dibagikan oleh Kreator merupakan tanggung jawab penuh dan eksklusif Kreator yang bersangkutan. Dengan mengunggah atau memublikasikan Prompt, Kreator menyatakan dan menjamin bahwa: (a) Kreator memiliki hak yang sah atas konten tersebut atau telah memperoleh izin yang diperlukan; (b) konten tidak melanggar hukum yang berlaku, hak kekayaan intelektual, privasi, publisitas, atau hak pihak ketiga lainnya; (c) konten tidak mengandung materi yang melanggar hukum, menipu, berbahaya, atau tidak pantas; dan (d) Kreator menanggung segala risiko, klaim, kerugian, dan akibat hukum yang timbul dari konten tersebut serta dari penggunaan konten oleh pihak mana pun.",
    },
    {
      heading: "5. Lisensi terbatas kepada platform",
      body: "Dengan mengunggah Prompt, Anda memberikan kepada Pengelola lisensi non-eksklusif, berlaku di seluruh dunia, bebas royalti, dan dapat dipindahtangankan sebatas yang diperlukan untuk mengoperasikan, menampilkan, menyimpan, mendistribusikan, dan mempromosikan Layanan, termasuk menampilkan Prompt kepada Pengguna lain sesuai pengaturan visibilitas yang Anda pilih. Kepemilikan substansi Prompt tetap pada Kreator, kecuali ditentukan lain secara tertulis.",
    },
    {
      heading: "6. Penggunaan yang diizinkan dan dilarang",
      body: "Anda setuju untuk menggunakan Layanan semata-mata untuk tujuan yang sah. Dilarang keras, tanpa batasan, untuk: (a) mengunggah malware, kode berbahaya, atau konten yang merusak sistem; (b) melakukan scraping, spam, atau gangguan terhadap Layanan; (c) melanggar hak pihak ketiga; (d) menyamar atau memberikan pernyataan palsu; (e) mencoba mengakses data atau akun tanpa otorisasi; dan/atau (f) menggunakan Prompt untuk tujuan yang melanggar hukum. Pengelola berhak, menurut diskresinya sendiri, untuk menghapus konten, membatasi fitur, atau menonaktifkan akun tanpa pemberitahuan terlebih dahulu apabila diperlukan untuk melindungi Layanan atau mematuhi hukum.",
    },
    {
      heading: "7. Penafian jaminan",
      body: "Sejauh diizinkan oleh hukum yang berlaku, Pengelola secara tegas menafikan segala jaminan, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan kelayakan untuk diperdagangkan, kesesuaian untuk tujuan tertentu, dan non-pelanggaran. Pengelola tidak menjamin bahwa Layanan akan berjalan tanpa gangguan, bebas kesalahan, aman, atau bahwa Prompt akan menghasilkan hasil tertentu, akurat, lengkap, atau mutakhir.",
    },
    {
      heading: "8. Batasan tanggung jawab",
      body: "Sejauh diizinkan oleh hukum yang berlaku, Pengelola tidak bertanggung jawab atas segala kerugian langsung, tidak langsung, insidental, khusus, konsekuensial, atau hukuman, termasuk kehilangan data, keuntungan, peluang usaha, atau reputasi, yang timbul dari atau terkait dengan: (a) akses atau penggunaan Layanan; (b) ketergantungan pada Prompt atau konten Pengguna lain; (c) tindakan atau kelalaian Kreator atau pihak ketiga; atau (d) penghentian, modifikasi, atau ketidaktersediaan Layanan. Penggunaan Prompt sepenuhnya menjadi risiko Pengguna sendiri.",
    },
    {
      heading: "9. Ganti rugi (indemnifikasi)",
      body: "Anda setuju untuk membela, mengganti rugi, dan membebaskan Pengelola beserta afiliasi, pejabat, karyawan, dan mitranya dari segala klaim, tuntutan, kerugian, kewajiban, biaya, dan pengeluaran (termasuk biaya hukum yang wajar) yang timbul dari atau terkait dengan: (a) konten yang Anda unggah atau bagikan; (b) pelanggaran Syarat ini oleh Anda; dan/atau (c) pelanggaran hak pihak ketiga akibat konten atau tindakan Anda.",
    },
    {
      heading: "10. Perubahan syarat",
      body: "Pengelola berhak mengubah Syarat ini dari waktu ke waktu. Versi yang berlaku akan ditampilkan pada halaman ini beserta tanggal efektifnya. Kelanjutan penggunaan Layanan setelah perubahan berlaku merupakan penerimaan Anda terhadap Syarat yang diperbarui. Apabila Anda tidak menyetujui perubahan, Anda wajib menghentikan penggunaan Layanan.",
    },
    {
      heading: "11. Hukum yang berlaku",
      body: "Syarat ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia, tanpa mengabaikan asas pertentangan hukum. Segala sengketa yang timbul sehubungan dengan Syarat atau Layanan akan diupayakan penyelesaiannya secara musyawarah; apabila tidak tercapai, sengketa akan diselesaikan melalui forum yang berwenang sesuai hukum yang berlaku.",
    },
    {
      heading: "12. Ketentuan penutup",
      body: "Apabila suatu ketentuan dalam Syarat ini dinyatakan tidak sah atau tidak dapat dilaksanakan, ketentuan tersebut akan ditegakkan sejauh diizinkan, dan ketentuan lainnya tetap berlaku penuh. Kegagalan Pengelola untuk menegakkan suatu hak tidak merupakan pengesampingan hak tersebut. Syarat ini merupakan keseluruhan kesepakatan antara Anda dan Pengelola mengenai pokok materinya dan menggantikan pemahaman sebelumnya mengenai hal yang sama, kecuali diatur lain secara tertulis.",
    },
  ],
};

const en: TermsCopy = {
  metaTitle: "Terms & Conditions — Rampungin",
  metaDescription:
    "Terms and Conditions governing use of Rampungin, including user-generated content liability and limitation of the operator’s liability.",
  title: "Terms & Conditions",
  updated: "Effective date: 25 July 2026",
  intro:
    "These Terms and Conditions (“Terms”) govern your access to and use of the Rampungin service (the “Service”). By accessing, registering for, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you must discontinue use of the Service immediately.",
  sections: [
    {
      heading: "1. Definitions",
      body: "“User” means any individual who accesses or uses the Service. “Creator” means a User who creates, uploads, modifies, or shares a Prompt. “Prompt” means any text, template, parameters, media, metadata, or other materials uploaded or published via the Service. “Operator” means the owner and/or operator of the Rampungin platform.",
    },
    {
      heading: "2. Nature of the service",
      body: "Rampungin is a community platform that enables Users to discover, save, rate, and share Prompts. The Operator does not act as author, publisher, professional adviser, or guarantor of the content, quality, fitness, or outcomes of any Prompt. The Service is provided on an “as is” and “as available” basis.",
    },
    {
      heading: "3. Eligibility and accounts",
      body: "You are solely responsible for safeguarding your account credentials and for all activity occurring under your account. You represent that the information you provide is accurate and that you have legal capacity to enter into these Terms. The Operator may refuse, suspend, or terminate access where there is suspected breach of these Terms, misuse, or legal risk.",
    },
    {
      heading: "4. User-generated content",
      body: "All Prompts and related materials created or shared by a Creator are the sole and exclusive responsibility of that Creator. By uploading or publishing a Prompt, the Creator represents and warrants that: (a) the Creator owns all necessary rights in the content or has obtained all required licences and permissions; (b) the content does not infringe applicable law or any intellectual property, privacy, publicity, or other third-party rights; (c) the content is not unlawful, deceptive, harmful, or otherwise inappropriate; and (d) the Creator assumes all risk, claims, losses, and legal consequences arising from such content and from any party’s use of it.",
    },
    {
      heading: "5. Limited licence to the platform",
      body: "By uploading a Prompt, you grant the Operator a non-exclusive, worldwide, royalty-free, sublicensable licence solely to the extent necessary to operate, display, store, distribute, and promote the Service, including making the Prompt available to other Users in accordance with the visibility settings you select. Subject to the foregoing, ownership of the Prompt remains with the Creator unless otherwise agreed in writing.",
    },
    {
      heading: "6. Acceptable use",
      body: "You agree to use the Service only for lawful purposes. Without limitation, you shall not: (a) upload malware, malicious code, or content that compromises systems; (b) engage in scraping, spamming, or interference with the Service; (c) infringe third-party rights; (d) impersonate others or make false statements; (e) attempt unauthorised access to data or accounts; and/or (f) use Prompts for unlawful purposes. The Operator may, in its sole discretion, remove content, restrict features, or disable accounts without prior notice where reasonably necessary to protect the Service or comply with law.",
    },
    {
      heading: "7. Disclaimer of warranties",
      body: "To the maximum extent permitted by applicable law, the Operator expressly disclaims all warranties, whether express, implied, or statutory, including without limitation implied warranties of merchantability, fitness for a particular purpose, and non-infringement. The Operator does not warrant that the Service will be uninterrupted, error-free, or secure, or that any Prompt will produce particular results or be accurate, complete, or current.",
    },
    {
      heading: "8. Limitation of liability",
      body: "To the maximum extent permitted by applicable law, the Operator shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including loss of data, profits, business opportunity, or goodwill, arising out of or in connection with: (a) access to or use of the Service; (b) reliance on any Prompt or other User content; (c) any act or omission of a Creator or third party; or (d) any suspension, modification, or unavailability of the Service. Use of any Prompt is entirely at the User’s own risk.",
    },
    {
      heading: "9. Indemnification",
      body: "You agree to defend, indemnify, and hold harmless the Operator and its affiliates, officers, employees, and partners from and against any claims, demands, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to: (a) content you upload or share; (b) your breach of these Terms; and/or (c) your infringement of any third-party right.",
    },
    {
      heading: "10. Amendments",
      body: "The Operator may amend these Terms from time to time. The prevailing version will be posted on this page together with its effective date. Your continued use of the Service after an amendment becomes effective constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Service.",
    },
    {
      heading: "11. Governing law",
      body: "These Terms are governed by and construed in accordance with the laws of the Republic of Indonesia, without regard to conflict-of-law principles. Any dispute arising out of or in connection with these Terms or the Service shall first be attempted to be resolved amicably; failing which, it shall be submitted to the competent forum in accordance with applicable law.",
    },
    {
      heading: "12. General provisions",
      body: "If any provision of these Terms is held to be invalid or unenforceable, that provision shall be enforced to the maximum extent permitted, and the remaining provisions shall continue in full force and effect. Failure by the Operator to enforce any right shall not constitute a waiver of that right. These Terms constitute the entire agreement between you and the Operator concerning the subject matter hereof and supersede prior understandings relating thereto, except as otherwise agreed in writing.",
    },
  ],
};

export function getTermsCopy(locale: Locale): TermsCopy {
  return locale === "en" ? en : id;
}

export function termsCheckboxLabel(locale: Locale): string {
  return locale === "en"
    ? "I have read and agree to the Terms & Conditions. I acknowledge that I am solely responsible for any Prompt I create or publish, and that the Operator shall have no liability arising therefrom."
    : "Saya telah membaca dan menyetujui Syarat dan Ketentuan. Saya mengakui bahwa saya bertanggung jawab penuh atas setiap Prompt yang saya buat atau publikasikan, dan bahwa Pengelola tidak memiliki tanggung jawab yang timbul darinya.";
}
