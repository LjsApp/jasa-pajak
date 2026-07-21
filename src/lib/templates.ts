// Account templates for Laba Rugi & Neraca.
// Each leaf account has a unique key used to store user-input values.

export type AccountLeaf = { key: string; label: string };
export type AccountGroup = { label: string; accounts: AccountLeaf[]; subtotalKey: string };
export type AccountSection = { label: string; groups: AccountGroup[] };

// ---------------------- LABA RUGI ----------------------
export const labaRugiSections: AccountSection[] = [
  {
    label: "PENDAPATAN",
    groups: [
      {
        label: "Penjualan",
        subtotalKey: "sub_penjualan",
        accounts: [{ key: "penjualan", label: "Penjualan" }],
      },
      {
        label: "Pengurang Penjualan",
        subtotalKey: "sub_retur",
        accounts: [{ key: "retur", label: "Retur Penjualan" }],
      },
    ],
  },
  {
    label: "HARGA POKOK PENJUALAN (HPP)",
    groups: [
      {
        label: "Pembelian",
        subtotalKey: "sub_pembelian",
        accounts: [{ key: "pembelian", label: "Pembelian Barang" }],
      },
      {
        label: "Persediaan",
        subtotalKey: "sub_persediaan",
        accounts: [{ key: "persediaan_akhir", label: "Persediaan Akhir" }],
      },
    ],
  },
  {
    label: "BIAYA OPERASIONAL",
    groups: [
      {
        label: "Biaya Gaji",
        subtotalKey: "sub_biaya_gaji",
        accounts: [{ key: "biaya_gaji", label: "Biaya Gaji" }],
      },
      {
        label: "Biaya Utilitas",
        subtotalKey: "sub_biaya_utilitas",
        accounts: [
          { key: "biaya_telp_internet", label: "Biaya Tlp & Internet" },
          { key: "biaya_pln", label: "Biaya PLN" },
          { key: "biaya_pdam", label: "Biaya PDAM" },
        ],
      },
      {
        label: "Biaya Operasional Kantor",
        subtotalKey: "sub_biaya_kantor",
        accounts: [{ key: "biaya_atk", label: "Biaya ATK" }],
      },
      {
        label: "Biaya Transportasi",
        subtotalKey: "sub_biaya_transport",
        accounts: [{ key: "biaya_bbm", label: "Biaya BBM dan Transportasi" }],
      },
      {
        label: "Biaya Lainnya",
        subtotalKey: "sub_biaya_lainnya",
        accounts: [{ key: "biaya_lainnya", label: "Biaya Lainnya" }],
      },
    ],
  },
  {
    label: "PAJAK",
    groups: [
      {
        label: "Pajak Penghasilan",
        subtotalKey: "sub_pajak",
        accounts: [
          { key: "pph_25", label: "PPh 25 (sudah dibayar)" },
        ],
      },
    ],
  },
];

// ---------------------- NERACA ----------------------
export type NeracaSubCategory = {
  label: string;
  subtotalKey: string;
  accounts: AccountLeaf[];
  isDeduction?: boolean;
};
export type NeracaCategory = { label: string; totalKey: string; sub: NeracaSubCategory[] };
export type NeracaSide = { label: string; categories: NeracaCategory[] };

export const neracaAset: NeracaSide = {
  label: "ASET",
  categories: [
    {
      label: "ASET LANCAR",
      totalKey: "total_aset_lancar",
      sub: [
        {
          label: "Kas dan Setara Kas",
          subtotalKey: "sub_kas",
          accounts: [
            { key: "kas_kecil", label: "Kas Kecil" },
            { key: "bank_bca", label: "Bank BCA" },
            { key: "shopee_pay", label: "Shopee Pay" },
            { key: "tokopedia", label: "Tokopedia" },
            { key: "bank_bri", label: "Bank BRI" },
          ],
        },
        {
          label: "Piutang Usaha",
          subtotalKey: "sub_piutang",
          accounts: [{ key: "piutang_usaha", label: "Piutang Usaha IDR" }],
        },
        {
          label: "Persediaan",
          subtotalKey: "sub_persediaan_neraca",
          accounts: [{ key: "persediaan_neraca", label: "Persediaan" }],
        },
        {
          label: "Aset Lancar Lainnya",
          subtotalKey: "sub_aset_lancar_lain",
          accounts: [
            { key: "sewa_dimuka", label: "Sewa Gedung Dibayar Dimuka" },
            { key: "jaminan_sewa", label: "Jaminan Sewa" },
            { key: "moka_dimuka", label: "Beban Moka Dibayar Dimuka" },
            { key: "iuran_dimuka", label: "Beban Iuran Pengelolaan Unit Dibayar Dimuka" },
            { key: "gaji_dimuka", label: "Gaji Dibayar Dimuka" },
          ],
        },
      ],
    },
    {
      label: "ASET TIDAK LANCAR",
      totalKey: "total_aset_tidak_lancar",
      sub: [
        {
          label: "Nilai Histori Aset Tetap",
          subtotalKey: "sub_nilai_histori",
          accounts: [
            { key: "peralatan", label: "Peralatan" },
            { key: "franchise", label: "Franchise" },
            { key: "stand", label: "Stand" },
          ],
        },
        {
          label: "Akumulasi Penyusutan",
          subtotalKey: "sub_akum_penyusutan",
          isDeduction: true,
          accounts: [
            { key: "akum_peralatan", label: "Akumulasi Penyusutan Peralatan" },
            { key: "akum_stand", label: "Akumulasi Penyusutan Stand" },
          ],
        },
      ],
    },
  ],
};

export const neracaPasiva: NeracaSide = {
  label: "LIABILITAS DAN EKUITAS",
  categories: [
    {
      label: "LIABILITAS JANGKA PENDEK",
      totalKey: "total_liab_pendek",
      sub: [
        {
          label: "Utang Usaha",
          subtotalKey: "sub_utang_usaha",
          accounts: [{ key: "utang_usaha", label: "Utang Usaha IDR" }],
        },
        {
          label: "Kewajiban Jangka Pendek Lainnya",
          subtotalKey: "sub_kewajiban_lain",
          accounts: [
            { key: "hutang_gaji", label: "Hutang Gaji" },
            { key: "hutang_pajak", label: "Hutang Pajak" },
            { key: "hutang_mgmt_fee", label: "Hutang Management Fee" },
            { key: "hutang_listrik", label: "Hutang Listrik" },
            { key: "hutang_pam", label: "Hutang PAM" },
            { key: "hutang_pajak_resto", label: "Hutang Pajak Restoran" },
            { key: "hutang_insentif", label: "Hutang Insentive" },
          ],
        },
      ],
    },
    {
      label: "EKUITAS",
      totalKey: "total_ekuitas",
      sub: [
        {
          label: "Modal & Saldo",
          subtotalKey: "sub_modal",
          accounts: [
            { key: "ekuitas_saldo_awal", label: "Ekuitas Saldo Awal" },
            { key: "laba_ditahan", label: "Laba Ditahan" },
            { key: "laba_tahun_berjalan", label: "Laba Tahun Berjalan" },
            { key: "prive", label: "Prive (pengurang)" },
          ],
        },
      ],
    },
  ],
};