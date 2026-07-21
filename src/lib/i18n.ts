import { useEffect, useState } from "react";
import { getLang, setLang, type Lang } from "./store";

export type { Lang };

const dict = {
  id: {
    nav_home: "Beranda", nav_about: "Tentang Kami", nav_services: "Layanan",
    nav_packages: "Paket", nav_blog: "Artikel", nav_calc: "Kalkulator",
    nav_faq: "FAQ", nav_contact: "Kontak",
    cta_wa: "WhatsApp", cta_consult: "Konsultasi Sekarang",
    cta_see_services: "Lihat Layanan", cta_pick_package: "Pilih Paket",
    badge_trusted: "Konsultan Pajak Terpercaya",
    hero_title: "Solusi Perpajakan Profesional untuk Bisnis & UMKM",
    hero_sub: "Membantu pelaporan, konsultasi, pembetulan, dan pengurusan pajak dengan proses cepat, aman, dan terpercaya.",
    trust_fast: "Respon cepat", trust_safe: "Data aman & rahasia", trust_support: "Support online/offline",
    sec_about_kicker: "Tentang Kami", sec_about_title: "Mitra Perpajakan Bisnis Anda",
    sec_about_desc: "Kami adalah penyedia jasa perpajakan yang membantu individu, UMKM, dan perusahaan dalam pengelolaan administrasi dan pelaporan pajak secara profesional dan terpercaya.",
    label_visi: "Visi", label_misi: "Misi",
    sec_services_kicker: "Layanan Kami", sec_services_title: "Solusi Lengkap Perpajakan",
    sec_packages_kicker: "Paket Layanan", sec_packages_title: "Pilih Paket Sesuai Kebutuhan",
    label_popular: "PALING POPULER", label_bonus: "Bonus Gratis", label_excludes: "Tidak Termasuk",
    sec_why_kicker: "Mengapa Kami", sec_why_title: "Mengapa Memilih Kami",
    sec_how_kicker: "Cara Kerja", sec_how_title: "Proses Sederhana, Hasil Maksimal",
    step_1: "Konsultasi", step_1_d: "Diskusi kebutuhan Anda",
    step_2: "Kirim Dokumen", step_2_d: "Lengkapi dokumen yang diperlukan",
    step_3: "Proses Tim", step_3_d: "Tim ahli kami menyelesaikan",
    step_4: "Selesai", step_4_d: "Laporan diserahkan tepat waktu",
    sec_test_kicker: "Testimoni", sec_test_title: "Apa Kata Client Kami",
    sec_faq_kicker: "FAQ", sec_faq_title: "Pertanyaan Umum",
    sec_blog_kicker: "Artikel", sec_blog_title: "Insight & Update Pajak",
    sec_blog_view_all: "Lihat semua artikel",
    cta_final_title: "Konsultasikan Permasalahan Pajak Anda Sekarang",
    cta_final_sub: "Tim kami siap membantu kebutuhan perpajakan bisnis Anda dengan proses yang aman dan profesional.",
    cta_final_btn: "Hubungi WhatsApp",
    footer_desc: "Konsultan pajak profesional yang membantu individu, UMKM, dan korporasi dalam pengelolaan perpajakan.",
    footer_menu: "Menu", footer_contact: "Kontak", footer_hours: "Senin – Sabtu, 09.00 – 17.00",
    services_excluded: "Tidak termasuk: biaya pengurusan ke kantor pajak, denda pajak, dan biaya materai.",
    why: ["Proses cepat & transparan","Data aman & rahasia","Pendampingan sampai selesai","Tim profesional & berpengalaman","Konsultasi mudah & jelas","Support online & offline"],
    services: [
      { t: "Pelaporan SPT", d: "Membantu pelaporan pajak tahunan dan bulanan secara tepat waktu." },
      { t: "Konsultasi Pajak", d: "Diskusi dan solusi untuk berbagai kebutuhan perpajakan bisnis." },
      { t: "Pembetulan Pajak", d: "Pendampingan revisi dan pembetulan laporan perpajakan." },
      { t: "Pengurusan NPWP & PKP", d: "Pendaftaran dan pengurusan legalitas perpajakan usaha." },
      { t: "Pembukuan Usaha", d: "Pencatatan transaksi dan laporan keuangan usaha." },
      { t: "Pendampingan Pemeriksaan", d: "Pendampingan saat pemeriksaan atau klarifikasi pajak." },
    ],
    faqs: [
      { q: "Apa itu layanan jasa pajak?", a: "Layanan jasa pajak adalah layanan profesional yang membantu individu, UMKM, dan perusahaan dalam mengelola kewajiban perpajakan, termasuk pelaporan SPT, konsultasi pajak, pengurusan NPWP/PKP, pembukuan usaha, pembetulan pajak, dan pendampingan pemeriksaan pajak." },
      { q: "Apa saja bentuk layanan jasa pajak yang tersedia?", a: "Layanan meliputi: (1) Pelaporan SPT tahunan dan bulanan, (2) Konsultasi pajak untuk bisnis dan UMKM, (3) Pembetulan laporan pajak, (4) Pengurusan NPWP dan PKP, (5) Pembukuan dan pencatatan keuangan usaha, (6) Pendampingan saat pemeriksaan pajak oleh otoritas." },
      { q: "Berapa biaya layanan jasa pajak?", a: "Biaya layanan jasa pajak bervariasi tergantung jenis dan kompleksitas pekerjaan. Kami menyediakan beberapa paket layanan yang bisa disesuaikan dengan kebutuhan dan skala bisnis Anda. Hubungi kami untuk konsultasi gratis dan penawaran harga." },
      { q: "Apakah layanan ini melayani UMKM?", a: "Ya, kami melayani UMKM, freelancer, pedagang online, hingga perusahaan skala besar. Kami memahami kebutuhan khusus UMKM dalam perpajakan, termasuk pemanfaatan tarif PPh Final 0,5% sesuai PP 55/2022." },
      { q: "Apakah konsultasi pajak bisa dilakukan secara online?", a: "Ya, konsultasi dapat dilakukan secara online melalui WhatsApp, telepon, atau video call, maupun offline di kantor kami. Proses pengiriman dokumen juga dapat dilakukan secara digital untuk kemudahan Anda." },
      { q: "Apakah data wajib pajak klien terjamin keamanannya?", a: "Kerahasiaan data klien adalah prioritas utama kami. Seluruh informasi dan dokumen perpajakan Anda dijaga dengan standar keamanan tinggi dan hanya diakses oleh tim profesional yang berwenang." },
      { q: "Apa perbedaan SPT Tahunan dan SPT Masa?", a: "SPT Tahunan adalah laporan pajak yang disampaikan setahun sekali, mencakup total penghasilan dan pajak terutang selama satu tahun pajak. SPT Masa adalah laporan pajak yang disampaikan setiap bulan, seperti laporan PPh Pasal 21 karyawan atau PPN. Kami membantu keduanya." },
    ],
    testi: [
      { q: "Pelayanan cepat dan sangat membantu pengurusan pajak usaha kami.", n: "Budi S.", r: "Pemilik UMKM" },
      { q: "Admin responsif dan prosesnya jelas dari awal sampai selesai.", n: "Sari W.", r: "Direktur CV" },
      { q: "Sangat membantu UMKM yang belum memahami perpajakan.", n: "Andi P.", r: "Wiraswasta" },
    ],
    calc_title: "Kalkulator Pajak", calc_sub: "Estimasi cepat untuk PPh 21 dan PPh UMKM (PP 55/2022).",
    calc_back: "Kembali ke beranda",
    calc_tab_pph21: "PPh 21 (Karyawan)", calc_tab_umkm: "PPh UMKM 0,5%",
    calc_monthly_salary: "Gaji bruto per bulan", calc_status: "Status (PTKP)",
    calc_dependents: "Jumlah tanggungan (max 3)",
    calc_yearly_income: "Penghasilan bruto setahun", calc_ptkp: "PTKP",
    calc_pkp: "PKP (Penghasilan Kena Pajak)", calc_pph_year: "PPh terutang setahun",
    calc_pph_month: "PPh per bulan", calc_takehome: "Take home / bulan",
    calc_omzet: "Omzet bulanan", calc_omzet_year: "Omzet tahunan",
    calc_pph_umkm: "PPh Final 0,5%/bulan", calc_pph_umkm_year: "PPh Final 0,5%/tahun",
    calc_disclaimer: "Hasil di atas adalah estimasi sederhana. Konsultasikan dengan kami untuk perhitungan yang akurat sesuai kondisi Anda.",
    blog_title: "Artikel & Insight Pajak", blog_sub: "Tips, panduan, dan update peraturan perpajakan terbaru.",
    blog_empty: "Belum ada artikel.", blog_back: "← Kembali ke artikel",
    blog_published: "Diterbitkan",
  },
  en: {
    nav_home: "Home", nav_about: "About", nav_services: "Services",
    nav_packages: "Packages", nav_blog: "Articles", nav_calc: "Calculator",
    nav_faq: "FAQ", nav_contact: "Contact",
    cta_wa: "WhatsApp", cta_consult: "Consult Now",
    cta_see_services: "See Services", cta_pick_package: "Choose Package",
    badge_trusted: "Trusted Tax Consultant",
    hero_title: "Professional Tax Solutions for Business & SMEs",
    hero_sub: "Helping with reporting, consulting, corrections, and tax administration — fast, safe, and reliable.",
    trust_fast: "Fast response", trust_safe: "Secure & confidential", trust_support: "Online/offline support",
    sec_about_kicker: "About Us", sec_about_title: "Your Business Tax Partner",
    sec_about_desc: "We provide tax services for individuals, SMEs, and companies — handling administration and reporting professionally and reliably.",
    label_visi: "Vision", label_misi: "Mission",
    sec_services_kicker: "Our Services", sec_services_title: "Complete Tax Solutions",
    sec_packages_kicker: "Service Packages", sec_packages_title: "Choose the Right Package",
    label_popular: "MOST POPULAR", label_bonus: "Free Bonus", label_excludes: "Not Included",
    sec_why_kicker: "Why Us", sec_why_title: "Why Choose Us",
    sec_how_kicker: "How It Works", sec_how_title: "Simple Process, Maximum Results",
    step_1: "Consultation", step_1_d: "Discuss your needs",
    step_2: "Send Documents", step_2_d: "Submit required documents",
    step_3: "Team Process", step_3_d: "Our experts handle it",
    step_4: "Done", step_4_d: "Report delivered on time",
    sec_test_kicker: "Testimonials", sec_test_title: "What Our Clients Say",
    sec_faq_kicker: "FAQ", sec_faq_title: "Common Questions",
    sec_blog_kicker: "Articles", sec_blog_title: "Tax Insights & Updates",
    sec_blog_view_all: "View all articles",
    cta_final_title: "Talk to Us About Your Tax Issues Today",
    cta_final_sub: "Our team is ready to help your business with safe and professional tax handling.",
    cta_final_btn: "Contact WhatsApp",
    footer_desc: "Professional tax consultant helping individuals, SMEs, and corporations with tax management.",
    footer_menu: "Menu", footer_contact: "Contact", footer_hours: "Mon – Sat, 09.00 – 17.00",
    services_excluded: "Not included: tax office processing fees, tax penalties, and stamp duties.",
    why: ["Fast & transparent process","Secure & confidential data","End-to-end support","Professional & experienced team","Easy & clear consultation","Online & offline support"],
    services: [
      { t: "Tax Reporting (SPT)", d: "Help with monthly and annual tax reporting on time." },
      { t: "Tax Consulting", d: "Discussion and solutions for business tax needs." },
      { t: "Tax Correction", d: "Assistance for revising and correcting tax reports." },
      { t: "NPWP & PKP Registration", d: "Registration and management of tax legality." },
      { t: "Bookkeeping", d: "Transaction recording and financial reporting." },
      { t: "Audit Assistance", d: "Support during tax audits or clarifications." },
    ],
    faqs: [
      { q: "Can I consult online?", a: "Yes, consultation can be done online or offline as you prefer." },
      { q: "What documents are needed?", a: "It depends on the chosen service. Our team will guide you." },
      { q: "Is client data safe?", a: "All client data is kept strictly confidential by our team." },
      { q: "Do you serve SMEs?", a: "Yes, we serve SMEs, freelancers, and large companies." },
      { q: "How long does it take?", a: "It depends on service type and document completeness. Estimates given at consultation." },
    ],
    testi: [
      { q: "Fast service and very helpful with our business tax matters.", n: "Budi S.", r: "SME Owner" },
      { q: "Responsive admin and clear process from start to finish.", n: "Sari W.", r: "CV Director" },
      { q: "Very helpful for SMEs unfamiliar with taxes.", n: "Andi P.", r: "Entrepreneur" },
    ],
    calc_title: "Tax Calculator", calc_sub: "Quick estimate for PPh 21 and SME Final Tax (PP 55/2022).",
    calc_back: "Back to home",
    calc_tab_pph21: "PPh 21 (Employee)", calc_tab_umkm: "SME Final 0.5%",
    calc_monthly_salary: "Monthly gross salary", calc_status: "Status (PTKP)",
    calc_dependents: "Dependents (max 3)",
    calc_yearly_income: "Annual gross income", calc_ptkp: "PTKP",
    calc_pkp: "PKP (Taxable Income)", calc_pph_year: "Annual tax owed",
    calc_pph_month: "Monthly tax", calc_takehome: "Take home / month",
    calc_omzet: "Monthly revenue", calc_omzet_year: "Annual revenue",
    calc_pph_umkm: "Final 0.5% tax/month", calc_pph_umkm_year: "Final 0.5% tax/year",
    calc_disclaimer: "Above is a simple estimate. Consult us for accurate calculation based on your situation.",
    blog_title: "Articles & Tax Insights", blog_sub: "Tips, guides, and the latest tax regulation updates.",
    blog_empty: "No articles yet.", blog_back: "← Back to articles",
    blog_published: "Published",
  },
} as const;

export type Dict = typeof dict["id"];

export function useT() {
  const [lang, setL] = useState<Lang>(() => getLang());
  useEffect(() => {
    const h = () => setL(getLang());
    window.addEventListener("ljs-lang-change", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("ljs-lang-change", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  const t = dict[lang] as Dict;
  return { t, lang, setLang: (l: Lang) => setLang(l) };
}
