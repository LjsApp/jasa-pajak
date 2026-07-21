import { useEffect, useState } from "react";
import { formatInputRupiah, parseRupiah } from "@/lib/format";

type Props = {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
};

export function MoneyInput({ value, onChange, placeholder = "0", className = "" }: Props) {
  const [text, setText] = useState(formatInputRupiah(value));

  useEffect(() => {
    setText(formatInputRupiah(value));
  }, [value]);

  return (
    <input
      inputMode="numeric"
      className={`num-input w-40 px-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent ${className}`}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const n = parseRupiah(e.target.value);
        setText(formatInputRupiah(n));
        onChange(n);
      }}
      onFocus={(e) => e.currentTarget.select()}
    />
  );
}