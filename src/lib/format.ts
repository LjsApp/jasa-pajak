export const formatRupiah = (n: number, opts?: { withSymbol?: boolean }) => {
  if (!Number.isFinite(n)) n = 0;
  const abs = Math.abs(Math.round(n));
  const str = abs.toLocaleString("id-ID");
  const sign = n < 0 ? `(${str})` : str;
  return opts?.withSymbol ? `Rp ${sign}` : sign;
};

export const parseRupiah = (s: string): number => {
  if (!s) return 0;
  const cleaned = s.replace(/[^\d-]/g, "");
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
};

export const formatInputRupiah = (n: number): string => {
  if (!n) return "";
  return Math.round(n).toLocaleString("id-ID");
};