import Lucide from "@/components/Base/Lucide";
import { IBarang } from "@/utils/types";
import { useState, useEffect, useRef } from "react";

interface ScanInputProps {
  items: IBarang[];              // Data semua barang
  onSelect: (item: IBarang) => void; // Apa yang terjadi saat barang dipilih
}

export const ScanInput = ({ items, onSelect }: ScanInputProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<IBarang[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Logika Filter (Jalan otomatis saat mengetik)
  useEffect(() => {
    if (query.length > 1) {
      const hasil = items.filter((item) =>
        item.nama_barang.toLowerCase().includes(query.toLowerCase()) ||
        item.barcode?.includes(query) ||
        item.kode_barang?.toLowerCase().includes(query.toLowerCase())
      );
      setFiltered(hasil);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query, items]);

  // 2. Handle Tombol Enter (Logika Scanner)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      
      // Cari yang COCOK PERSIS (Logic Scanner)
      const exactMatch = items.find(
        (b) => b.barcode === query || b.kode_barang === query
      );

      if (exactMatch) {
        pilihBarang(exactMatch);
      } else if (filtered.length === 1) {
        // Kalau user ngetik manual dan cuma sisa 1 pilihan
        pilihBarang(filtered[0]);
      }
    }
  };

  // 3. Fungsi Finalisasi Pilih Barang
  const pilihBarang = (item: IBarang) => {
    onSelect(item);   // Kirim data ke induk
    setQuery("");     // Kosongkan input
    setIsOpen(false); // Tutup dropdown
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12 border-r rounded-l-md border-slate-200 bg-slate-50">
          <Lucide icon="Barcode" className="w-6 h-6 text-slate-500" />
      </div>
      <input
        type="text"
        className="form-input w-full text-lg py-2 pl-14 pr-4 border border-gray-300 rounded focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        placeholder="Scan Barcode / Ketik Nama..."
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay biar bisa diklik
        onFocus={() => query.length > 1 && setIsOpen(true)}
      />

      {/* Dropdown List */}
      {isOpen && filtered.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-md mt-1 max-h-60 overflow-y-auto">
          {filtered.map((item) => (
            <li
              key={item._id}
              // PENTING: Pakai onMouseDown supaya tereksekusi sebelum onBlur input
              onMouseDown={() => pilihBarang(item)}
              className="p-3 border-b hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
            >
              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {item.nama_barang}
                  {/* Badge kecil di sebelah nama */}
                  <span className="text-[10px] font-normal bg-gray-100 text-gray-600 px-1.5 rounded border border-gray-300">
                      {item.satuan}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {item.kode_barang} | {item.barcode}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold border border-green-200">
                  Stok: {item.stok} {item.satuan}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && filtered.length === 0 && (
         <div className="absolute z-50 w-full bg-white border p-3 text-red-500 text-sm shadow-md mt-1">
            Barang tidak ditemukan.
         </div>
      )}
    </div>
  );
};