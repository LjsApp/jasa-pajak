import { labaRugiSections, neracaAset, neracaPasiva } from "./templates";

export type Values = Record<string, number>;

const v = (vals: Values, k: string) => vals[k] ?? 0;

export type LabaRugiResult = {
  totalPenjualan: number;
  totalRetur: number;
  pendapatanBersih: number;
  totalPembelian: number;
  persediaanAkhir: number;
  hpp: number;
  labaKotor: number;
  totalBiayaOperasional: number;
  labaSebelumPajak: number;
  pphTerutang: number;
  pph25Dibayar: number;
  pph29: number;
  labaBersih: number;
  pph25Bulanan: number;
  groupSubtotals: Record<string, number>;
};

/**
 * PPh Badan UMKM (PP 55/2022): 0.5% omzet untuk omzet ≤ 4.8M (skema final).
 * Untuk simplifikasi: pakai tarif PPh Badan 22% atas Laba Sebelum Pajak.
 * User dapat sesuaikan via input PPh 25 yang sudah dibayar.
 */
export function calcLabaRugi(values: Values, taxRate = 0.22): LabaRugiResult {
  const groupSubtotals: Record<string, number> = {};
  for (const sec of labaRugiSections) {
    for (const g of sec.groups) {
      groupSubtotals[g.subtotalKey] = g.accounts.reduce((s, a) => s + v(values, a.key), 0);
    }
  }
  const totalPenjualan = groupSubtotals["sub_penjualan"];
  const totalRetur = groupSubtotals["sub_retur"];
  const pendapatanBersih = totalPenjualan - totalRetur;

  const totalPembelian = groupSubtotals["sub_pembelian"];
  const persediaanAkhir = groupSubtotals["sub_persediaan"];
  const hpp = totalPembelian - persediaanAkhir;

  const labaKotor = pendapatanBersih - hpp;

  const opGroupKeys = ["sub_biaya_gaji", "sub_biaya_utilitas", "sub_biaya_kantor", "sub_biaya_transport", "sub_biaya_lainnya"];
  const totalBiayaOperasional = opGroupKeys.reduce((s, k) => s + groupSubtotals[k], 0);

  const labaSebelumPajak = labaKotor - totalBiayaOperasional;
  const pphTerutang = Math.max(0, Math.round(labaSebelumPajak * taxRate));
  const pph25Dibayar = v(values, "pph_25");
  const pph29 = pphTerutang - pph25Dibayar;
  const labaBersih = labaSebelumPajak - pphTerutang;
  const pph25Bulanan = Math.max(0, Math.round(pphTerutang / 12));

  return {
    totalPenjualan, totalRetur, pendapatanBersih,
    totalPembelian, persediaanAkhir, hpp,
    labaKotor, totalBiayaOperasional, labaSebelumPajak,
    pphTerutang, pph25Dibayar, pph29, labaBersih, pph25Bulanan,
    groupSubtotals,
  };
}

export type NeracaResult = {
  totalAsetLancar: number;
  totalAsetTidakLancar: number;
  totalAset: number;
  totalLiabilitas: number;
  totalEkuitas: number;
  totalLiabilitasEkuitas: number;
  selisih: number;
  isBalanced: boolean;
  subtotals: Record<string, number>;
  categoryTotals: Record<string, number>;
};

export function calcNeraca(values: Values): NeracaResult {
  const subtotals: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};

  for (const cat of neracaAset.categories) {
    let catTotal = 0;
    for (const sub of cat.sub) {
      const sum = sub.accounts.reduce((s, a) => s + v(values, a.key), 0);
      subtotals[sub.subtotalKey] = sum;
      catTotal += sub.isDeduction ? -sum : sum;
    }
    categoryTotals[cat.totalKey] = catTotal;
  }

  for (const cat of neracaPasiva.categories) {
    let catTotal = 0;
    for (const sub of cat.sub) {
      const sum = sub.accounts.reduce((s, a) => {
        const val = v(values, a.key);
        return a.key === "prive" ? s - val : s + val;
      }, 0);
      subtotals[sub.subtotalKey] = sum;
      catTotal += sum;
    }
    categoryTotals[cat.totalKey] = catTotal;
  }

  const totalAsetLancar = categoryTotals["total_aset_lancar"];
  const totalAsetTidakLancar = categoryTotals["total_aset_tidak_lancar"];
  const totalAset = totalAsetLancar + totalAsetTidakLancar;
  const totalLiabilitas = categoryTotals["total_liab_pendek"];
  const totalEkuitas = categoryTotals["total_ekuitas"];
  const totalLiabilitasEkuitas = totalLiabilitas + totalEkuitas;
  const selisih = totalAset - totalLiabilitasEkuitas;

  return {
    totalAsetLancar, totalAsetTidakLancar, totalAset,
    totalLiabilitas, totalEkuitas, totalLiabilitasEkuitas,
    selisih, isBalanced: Math.abs(selisih) < 1,
    subtotals, categoryTotals,
  };
}