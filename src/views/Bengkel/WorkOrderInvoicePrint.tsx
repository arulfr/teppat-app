import React, { forwardRef } from 'react';

interface Props {
  data: any;
  store: any;
  user?: any;
}

const WorkOrderInvoicePrint = forwardRef<HTMLDivElement, Props>(({ data, store, user }, ref) => {
  if (!data) return null;
  return (
    <div ref={ref} className="bg-white text-black p-6 font-sans text-xs max-w-4xl mx-auto print:p-10 print:w-full print:max-w-none print:shadow-none print:overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 0; }
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          html, body { width: 210mm; height: 297mm; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:w-full { width: 100% !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:overflow-visible { overflow: visible !important; }
        }
      ` }} />
      
      {/* HEADER: KOP SURAT & LOGO */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-0.5 leading-tight">
          <h1 className="text-2xl font-black uppercase tracking-tight">{store?.nama_store || 'TEPPAT BENGKEL'}</h1>
          <div className="text-[10px] font-bold">
            <p>
              {store?.alamat || ''}
            </p>
            {store?.no_telp && <p>Telp/WA: {store.no_telp}</p>}
          </div>
        </div>
        {/* Logo dihapus sesuai permintaan */}
      </div>

      {/* JUDUL DOKUMEN DENGAN GARIS PEMISAH */}
      <div className="border-t-[2px] border-black w-full"></div>
      <h2 className="text-center font-bold text-[11px] py-1 tracking-wider uppercase">Invoice</h2>
      <div className="border-t-[1.5px] border-black w-full mb-3"></div>

      {/* METADATA: INFO PELANGGAN & DETAIL INVOICE */}
      <div className="flex justify-between mb-4">
        {/* Kolom Kiri: Info Pelanggan */}
        <div className="w-1/2">
          <table className="text-[10px] font-bold w-full leading-tight">
            <tbody>
              <tr><td className="w-24 pb-0.5">Nama Pelanggan</td><td className="w-4 pb-0.5">:</td><td className="pb-0.5">{data.id_pelanggan?.nama_pelanggan || '-'}</td></tr>
              <tr><td className="align-top pb-1">Alamat</td><td className="align-top pb-1">:</td><td className="pb-1">{data.id_pelanggan?.alamat || '-'}</td></tr>
              
              <tr><td className="pb-0.5">No Telp</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_pelanggan?.no_telp || '-'}</td></tr>
              <tr><td className="pb-0.5">No Polisi</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.plat_nomor || '-'}</td></tr>
              <tr><td className="pb-0.5">Jenis</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.merk} {data.id_kendaraan?.model}</td></tr>
              <tr><td className="pb-0.5">Merk</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.merk || '-'}</td></tr>
              <tr><td className="pb-0.5">Tahun</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.tahun || '-'}</td></tr>
              <tr><td className="pb-0.5">Kilometer</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.odometer?.toLocaleString()} KM</td></tr>
            </tbody>
          </table>
        </div>
        
        {/* Kolom Kanan: Detail WO/Invoice */}
        <div className="w-[45%] leading-tight">
          <table className="text-[10px] font-bold w-full">
            <tbody>
              <tr>
                <td className="w-28 pb-0.5">No Invoice</td>
                <td className="w-4 pb-0.5">:</td>
                <td className="pb-0.5">
                  {/* Prioritas menampilkan no_invoice permanen dari DB */}
                  {data.no_invoice || 
                   // Fallback: Coba konversi dari no_spk jika no_invoice belum ada
                   (data.no_spk 
                     ? data.no_spk.replace('WO-', 'INV/').replace(/(\w{3})(\d{2})(\d{2})(\d{3})$/, '$1$2-$3-$4')
                     : '-'
                   )
                  }
                </td>
              </tr>
              <tr><td className="pb-0.5">Hari/Tgl Masuk</td><td className="pb-0.5">:</td><td className="pb-0.5">{new Date(data.tanggal_masuk).toLocaleDateString('id-ID')}</td></tr>
              <tr><td className="pb-0.5">Hari/Tgl Keluar</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.tanggal_selesai_aktual ? new Date(data.tanggal_selesai_aktual).toLocaleDateString('id-ID') : '-'}</td></tr>
              <tr><td className="pb-0.5">Jam Masuk</td><td className="pb-0.5">:</td><td className="pb-0.5">{new Date(data.tanggal_masuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td></tr>
              <tr><td className="pb-0.5">Jam Keluar</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.tanggal_selesai_aktual ? new Date(data.tanggal_selesai_aktual).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td></tr>
              <tr><td className="pb-0.5">No Rangka</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.nomor_rangka || '-'}</td></tr>
              <tr><td className="pb-0.5">No Mesin</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.id_kendaraan?.nomor_mesin || '-'}</td></tr>
              <tr><td className="pb-0.5">Admin</td><td className="pb-0.5">:</td><td className="pb-0.5">{store?.nama_owner || '-'}</td></tr>
              <tr><td className="pb-0.5">No. WO</td><td className="pb-0.5">:</td><td className="pb-0.5">{data.no_spk || '-'}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TABEL 1: PEKERJAAN (JASA) */}
      <table className="w-full text-[10px] mb-2">
        <thead>
          <tr className="border-t-[1.5px] border-b border-black text-left leading-none">
            <th className="py-1 font-bold w-8 text-center" rowSpan={2}>No</th>
            <th className="py-1 font-bold w-20" rowSpan={2}>Kode</th>
            <th className="py-1 font-bold" rowSpan={2}>Pekerjaan</th>
            <th className="py-1 font-bold w-24 text-right" rowSpan={2}>Harga</th>
            <th className="pt-1 font-bold text-center border-b border-transparent" colSpan={2}>Discount</th>
            <th className="py-1 font-bold w-24 text-right" rowSpan={2}>Total Harga</th>
          </tr>
          <tr className="border-b border-black">
            <th className="pb-1 font-bold w-12 text-center text-[8px]">%</th>
            <th className="pb-1 font-bold w-20 text-right text-[8px]">Rp</th>
          </tr>
        </thead>
        <tbody>
          {data.item_layanan.map((l: any, i: number) => (
            <tr key={i} className="leading-tight">
              <td className="py-1 text-center border-r border-black">{i + 1}</td>
              <td className="py-1 border-r border-black"></td> {/* Kode Jasa */}
              <td className="py-1 px-1 border-r border-black">{l.nama_layanan}</td>
              <td className="py-1 px-1 text-right border-r border-black">{l.harga_satuan?.toLocaleString() || '0'}</td>
              <td className="py-1 text-center border-r border-black"></td> {/* Discount % */}
              <td className="py-1 px-1 text-right border-r border-black">-</td> {/* Discount Rp */}
              <td className="py-1 text-right">{l.sub_total?.toLocaleString() || '0'}</td>
            </tr>
          ))}
          
          {/* Baris Total Jasa */}
          <tr className="border-t-[1.5px] border-b border-black font-bold">
            <td colSpan={4} className="py-1 text-center uppercase text-[9px]">Total Jasa</td>
            <td className="py-1 text-right">:</td>
            <td className="py-1 text-right">Rp</td>
            <td className="py-1.5 text-right">{data.total_biaya_jasa?.toLocaleString() || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 2: PART / MATERIAL */}
      <table className="w-full text-[10px] mb-2">
        <thead>
          <tr className="border-t-[1.5px] border-b border-black text-left leading-none">
            <th className="py-1 font-bold w-8 text-center" rowSpan={2}>No</th>
            <th className="py-1 font-bold w-24" rowSpan={2}>No.Part/<br/>Material</th>
            <th className="py-1 font-bold text-center" rowSpan={2}>Item ( Part )</th>
            <th className="py-1 font-bold w-10 text-center" rowSpan={2}>Qty</th>
            <th className="py-1 font-bold w-20 text-right" rowSpan={2}>Harga</th>
            <th className="py-1 font-bold w-20 text-right" rowSpan={2}>Bruto</th>
            <th className="pt-1 font-bold text-center" colSpan={2}>Discount</th>
            <th className="py-1 font-bold w-24 text-right" rowSpan={2}>Netto</th>
          </tr>
          <tr className="border-b border-black">
            <th className="pb-1 font-bold w-10 text-center text-[8px]">%</th>
            <th className="pb-1 font-bold w-20 text-right text-[8px]">Rp</th>
          </tr>
        </thead>
        <tbody>
          {data.item_sparepart.map((s: any, i: number) => (
            <tr key={i} className="leading-tight">
              <td className="py-1 text-center border-r border-black">{i + 1}</td>
              <td className="py-1 px-1 border-r border-black">{s.kode_barang || '-'}</td>
              <td className="py-1 px-1 border-r border-black">{s.nama_barang}</td>
              <td className="py-1 text-center border-r border-black">{s.jumlah}</td>
              <td className="py-1 px-1 text-right border-r border-black">{Number(s.harga_jual || 0).toLocaleString()}</td>
              <td className="py-1 px-1 text-right border-r border-black">{(Number(s.harga_jual || 0) * Number(s.jumlah || 0))?.toLocaleString() || '0'}</td>
              <td className="py-1 text-center border-r border-black"></td>
              <td className="py-1 px-1 text-right border-r border-black">-</td>
              <td className="py-1 text-right">{s.sub_total?.toLocaleString() || '0'}</td> {/* Netto */}
            </tr>
          ))}
          
          {/* Subtotal Part (Total Qty dan Total Bruto) */}
          <tr className="border-t border-black font-bold">
            <td colSpan={3} className="border-r border-black"></td>
            <td className="py-1 text-center border-r border-black">{data.item_sparepart.reduce((a: number, b: any) => a + b.jumlah, 0)}</td>
            <td colSpan={2} className="py-1 text-right border-r border-black">{data.item_sparepart.reduce((a: number, b: any) => a + (b.harga_jual * b.jumlah), 0).toLocaleString()}</td>
            <td colSpan={2} className="border-r border-black"></td>
            <td className="py-1 text-right">{data.total_biaya_sparepart?.toLocaleString() || '0'}</td>
          </tr>

          {/* Baris Total Part */}
          <tr className="border-t-[1.5px] border-b border-black font-bold">
            <td colSpan={5} className="py-1 text-center uppercase text-[9px]">Total Part</td>
            <td className="py-1 text-right">:</td>
            <td colSpan={2} className="py-1 text-right">Rp</td>
            <td className="py-1.5 text-right">{data.total_biaya_sparepart?.toLocaleString() || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* TABEL 3: OLI (Placeholder) */}
      <table className="w-full text-[10px] mb-4">
        <thead>
          <tr className="border-t-[1.5px] border-b border-black text-left leading-tight">
            <th className="py-0.5 font-bold w-8 text-center">No</th>
            <th className="py-0.5 font-bold w-32">No. Material</th>
            <th className="py-0.5 font-bold">Oli</th>
            <th className="py-0.5 font-bold w-12 text-center">Qty</th>
            <th className="py-0.5 font-bold w-24 text-right">Price</th>
            <th className="py-0.5 font-bold w-24 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* Saat ini tidak ada data oli di model, jadi ini tetap placeholder */}
          <tr className="h-5"><td className="py-0.5 text-center">1</td><td></td><td></td><td></td><td></td><td className="py-0.5 text-right">-</td></tr>
          <tr className="h-5"><td className="py-0.5 text-center">2</td><td></td><td></td><td></td><td></td><td className="py-0.5 text-right">-</td></tr>
        </tbody>
      </table>

      {/* FOOTER: KALKULASI & TERBILANG */}
      <div className="flex justify-between items-start border-t-[1.5px] border-black pt-2 mb-6">
        
        {/* Kiri: Terbilang */}
        <div className="w-[60%] flex gap-4 pt-4">
          <span className="font-bold italic">Terbilang</span>
          <span className="font-bold">:</span>
          <span className="italic font-bold">Status: {data.status?.toUpperCase()}</span> {/* Placeholder, bisa diganti fungsi terbilang */}
        </div>

        {/* Kanan: Ringkasan Total */}
        <div className="w-[40%]">
          <table className="w-full text-[10px] font-bold">
            <tbody>
              <tr>
                <td className="py-0.5 text-center">Total Oli</td>
                <td className="py-0.5 w-4">:</td>
                <td className="py-0.5 w-8">Rp</td>
                <td className="py-0.5 text-right">-</td>
              </tr>
              <tr>
                <td className="py-0.5 text-center">Total ( Jasa + Part + Oli )</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">Rp</td>
                <td className="py-0.5 text-right">{data.total_tagihan?.toLocaleString() || '0'}</td>
              </tr>
              <tr>
                <td className="py-0.5 text-center italic">DP</td>
                <td className="py-0.5">:</td>
                <td className="py-0.5">Rp</td>
                <td className="py-0.5 text-right">-</td>
              </tr>
              <tr className="border-t border-black">
                <td className="py-1 text-center uppercase">Grand Total</td>
                <td className="py-1">:</td>
                <td className="py-1">Rp</td>
                <td className="py-1 text-right">{data.total_tagihan?.toLocaleString() || '0'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CATATAN & TANDA TANGAN (Mencegah Terpotong) */}
      <div className="text-[9px] mb-8">
        <p>Note :</p>
        <p>* Garansi 15 Hari atau 1.000km ( yg mana tercapai lebih dulu )</p>
        <p>* Garansi Perkerjaan / Tidak Garansi Sparepart</p>
      </div>

      <div className="flex justify-between items-end mt-12 px-8">
        {/* Tanda Tangan Bengkel */}
        <div className="text-center w-40">
          <p className="mb-16 text-left">Hormat Kami,</p>
          <div className="border-t border-black w-full pt-1">
            {store?.nama_store || 'B.A Carindo'}
          </div>
        </div>

        {/* Tanda Tangan Pelanggan */}
        <div className="text-center w-40">
          <div className="border-t border-black w-full pt-1">
            {data.id_pelanggan?.nama_pelanggan || 'Pelanggan'}
          </div>
        </div>
      </div>

      {/* KETERANGAN ARSIP */}
      <div className="mt-8 text-right text-[9px] italic font-semibold">
        Putih = Costumer, Merah = Admin, Kuning = Teknisi/Arsip
      </div>
    </div>
  );
});

export default WorkOrderInvoicePrint;