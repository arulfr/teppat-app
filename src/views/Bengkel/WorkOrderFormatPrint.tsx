import React, { forwardRef } from 'react';
import { formatCurrency } from "@/utils/helper";

interface Props {
  data: any;
  store: any;
  user?: any;
}

const WorkOrderFormatPrint = forwardRef<HTMLDivElement, Props>(({ data, store, user }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref} className="bg-white text-black p-6 font-sans text-xs max-w-4xl mx-auto print:p-10 print:w-full print:max-w-none print:shadow-none print:overflow-visible">
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4; margin: 0; }
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          html, body { width: 210mm; height: 297mm; }
        }
      ` }} />

      {/* Header Perusahaan */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-black uppercase leading-tight">{store?.nama_store || 'TEPPAT BENGKEL'}</h1>
          <div className="text-[10px] font-medium mt-1 leading-tight">
            <p>
              {store?.alamat || ''}
            </p>
            {store?.no_telp && <p>Telp/WA: {store.no_telp}</p>}
          </div>
          {store?.deskripsi && <p className="text-[9px] italic text-slate-500 mt-1">{store.deskripsi}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold border-b-2 border-black mb-1">WORK ORDER</h2>
          <div className="text-sm font-bold flex justify-end gap-4">
            <span>GR</span>
            <span className="uppercase">{data.id_kendaraan?.plat_nomor}</span>
          </div>
        </div>
      </div>

      {/* Informasi Utama - Tabel Grid */}
      <div className="border-2 border-black mb-2">
        <div className="grid grid-cols-2 divide-x-2 divide-black">
          
          {/* Kolom Kiri: Info WO & Kendaraan */}
          <div className="grid grid-cols-2 gap-1 p-2 text-[10px]">
            <div><span className="font-semibold">No. WO:</span> {data.no_spk}</div>
            <div><span className="font-semibold">Foreman:</span> {data.id_mekanik_utama?.nama_mekanik || '-'}</div>
            
            <div><span className="font-semibold">Tgl/Jam:</span> {new Date(data.tanggal_masuk).toLocaleString('id-ID')}</div>
            <div><span className="font-semibold">Teknisi:</span> {data.id_mekanik_utama?.nama_mekanik || '-'}</div>
            
            <div className="col-span-2">
                <span className="font-semibold">Tipe/Model:</span> {data.id_kendaraan?.merk} / {data.id_kendaraan?.model} | Tahun : {data.id_kendaraan?.tahun || '-'}
            </div>
            <div className="col-span-2">
                <span className="font-semibold">Warna/CC:</span> {data.id_kendaraan?.warna || '-'} / {data.id_kendaraan?.cc || '-'} | VN: {data.id_kendaraan?.vin || '-'}
            </div>
            
            <div className="col-span-2"><span className="font-semibold">Tgl. Penerimaan:</span> {new Date(data.tanggal_masuk).toLocaleDateString('id-ID')}</div>
            <div className="col-span-2"><span className="font-semibold">No. Engine:</span> {data.id_kendaraan?.nomor_mesin || '-'} | <span className="font-semibold">Bahan Bakar:</span> {data.id_kendaraan?.bahan_bakar || '-'}</div>
            
            <div className="col-span-2 font-bold text-sm mt-1">Odometer: {data.id_kendaraan?.odometer?.toLocaleString()} KM</div>
          </div>

          {/* Kolom Kanan: Info Pelanggan */}
          <div className="grid grid-cols-1 gap-1 p-2 text-[10px]">
            <div><span className="font-semibold">Nama Pemilik:</span> {data.id_pelanggan?.nama_pelanggan}</div>
            <div><span className="font-semibold">Alamat:</span> {data.id_pelanggan?.alamat || '-'}</div>
            <div className="flex gap-4">
              <span><span className="font-semibold">Telepon:</span> {data.id_pelanggan?.no_telp}</span>
              <span><span className="font-semibold">No. NPWP:</span> -</span>
            </div>
            <div className="flex gap-4">
              <span><span className="font-semibold">Contact Person:</span> {data.id_pelanggan?.nama_pelanggan}</span>
              <span><span className="font-semibold">HP. CP:</span> {data.id_pelanggan?.no_telp}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              <span><span className="font-semibold">Pergantian Part:</span> Izin</span>
              <span><span className="font-semibold">Level BBM:</span> [____|____|____]</span>
              <span><span className="font-semibold">Metode Pembayaran:</span> Cash/Transfer</span>
              <span><span className="font-semibold">Part Bekas:</span> Dikembalikan</span>
              <span><span className="font-semibold">Cuci Kendaraan:</span> Tidak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ketentuan */}
      <div className="border-2 border-black p-2 mb-2 text-[9px] leading-tight">
        <p className="font-bold underline mb-1">Ketentuan:</p>
        <ol className="list-decimal list-inside">
          <li>WO ini merupakan SURAT KUASA dari pelanggan kepada {store?.nama_store} untuk: (a) Mengerjakan pekerjaan sesuai yang di tulis pada Work Order (WO). (b) Izin mencoba kendaraan diluar bengkel.</li>
          <li>Jaminan pekerjaan berlaku untuk pekerjaan General Repair adalah 15 hari atau 1000km, tergantung yang mana tercapai lebih dulu.</li>
          <li>Apabila dalam 5 hari setelah pekerjaan part bekas tidak diambil maka kami berhak melakukan pemusnahan part tersebut.</li>
        </ol>
      </div>

      {/* Grid Utama: Jasa vs Parts */}
      <div className="grid grid-cols-2 gap-2 mb-2 items-start">
        
        {/* Kolom Kiri: Keluhan & Jasa */}
        <div className="flex flex-col gap-2">
          <div className="border-2 border-black min-h-[250px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black bg-gray-100">
                  <th className="p-1 border-r border-black w-8 text-center">No</th>
                  <th className="p-1 border-r border-black">Permintaan dan Keluhan / Jasa</th>
                  <th className="p-1 text-right w-24">Estimasi</th>
                </tr>
              </thead>
              <tbody>
                {data.item_layanan.map((layanan: any, i: number) => (
                  <tr key={i} className="border-b border-black">
                    <td className="p-1 border-r border-black text-center">{i + 1}</td>
                    <td className="p-1 border-r border-black">{layanan.nama_layanan}</td>
                    <td className="p-1 text-right">{layanan.sub_total.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Keluhan Pelanggan jika ada */}
                {data.deskripsi_keluhan && (
                   <tr className="border-b border-black italic text-slate-500">
                    <td className="p-1 border-r border-black text-center">-</td>
                    <td className="p-1 border-r border-black">Note: {data.deskripsi_keluhan}</td>
                    <td className="p-1 text-right">0</td>
                  </tr>
                )}
                {/* Spacer rows */}
                {[...Array(Math.max(0, 8 - data.item_layanan.length))].map((_, i) => (
                  <tr key={`spacer-jasa-${i}`} className="border-b border-black h-5">
                    <td className="border-r border-black"></td><td className="border-r border-black"></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* WAC Placeholder */}
          <div className="border-2 border-black p-2 text-[9px]">
            <div className="font-bold mb-1 border-b border-black pb-1 uppercase">Walk Around Check (WAC)</div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
              <div>Dongkrak: Ada/Tidak</div>
              <div>P3K: Ada/Tidak</div>
              <div>Tool Set: Ada/Tidak</div>
              <div>Ban Serep: Ada/Tidak</div>
              <div>STNK: Ada/Tidak</div>
              <div>AC: OK/NG</div>
              <div className="col-span-2">Kondisi Mobil: Kotor/Bersih</div>
            </div>
            <p className="mt-2 text-[8px] italic leading-tight">
              Note tanda (X) menunjukkan body mobil baret/penyok. Estimasi biaya dapat berubah sewaktu-waktu sesuai kondisi pengerjaan.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Part / Material */}
        <div className="border-2 border-black min-h-[350px]">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="p-1 border-r border-black w-6 text-center">No</th>
                <th className="p-1 border-r border-black">Part/Material</th>
                <th className="p-1 border-r border-black text-right w-16">Harga</th>
                <th className="p-1 border-r border-black text-center w-8">QTY</th>
                <th className="p-1 text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.item_sparepart.map((part: any, i: number) => (
                <tr key={i} className="border-b border-gray-400">
                  <td className="p-1 border-r border-black text-center">{i + 1}</td>
                  <td className="p-1 border-r border-black">{part.nama_barang}</td>
                  <td className="p-1 border-r border-black text-right">{part.harga_jual.toLocaleString()}</td>
                  <td className="p-1 border-r border-black text-center">{part.jumlah}</td>
                  <td className="p-1 text-right">{part.sub_total.toLocaleString()}</td>
                </tr>
              ))}
              {/* Spacer rows */}
              {[...Array(Math.max(0, 12 - data.item_sparepart.length))].map((_, i) => (
                <tr key={`spacer-part-${i}`} className="border-b border-gray-400 h-5">
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Tanda Tangan */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex flex-col justify-end">
          <p className="text-[10px] font-bold mb-1">*Mohon tidak meninggalkan barang berharga di dalam kendaraan</p>
          <p className="text-[10px] font-bold">*Simpan Lembar WO ini sebagai bukti serah terima kendaraan</p>
          
          <div className="mt-6 flex justify-around text-center">
            <div className="w-32">
                <p className="mb-10 text-[10px]">Pemilik Kendaraan</p>
                <div className="border-b border-black"></div>
                <p className="text-[9px] mt-1">{data.id_pelanggan?.nama_pelanggan}</p>
            </div>
            <div className="w-32">
                <p className="mb-10 text-[10px]">Service Advisor</p>
                <div className="border-b border-black"></div>
                <p className="text-[9px] mt-1">( ........................ )</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-black">
          <table className="w-full text-sm font-bold">
            <tbody>
              <tr className="border-b border-black">
                <td className="p-1 border-r border-black w-1/2 uppercase text-[10px]">Biaya Jasa</td>
                <td className="p-1 w-8 text-center">Rp</td>
                <td className="p-1 text-right">{data.total_biaya_jasa?.toLocaleString() || '0'}</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-1 border-r border-black uppercase text-[10px]">Biaya Part/Material</td>
                <td className="p-1 text-center">Rp</td>
                <td className="p-1 text-right">{data.total_biaya_sparepart?.toLocaleString() || '0'}</td>
              </tr>
              <tr className="border-b border-black bg-gray-200 text-base">
                <td className="p-2 border-r border-black uppercase text-xs">Total Estimasi</td>
                <td className="p-2 text-center">Rp</td>
                <td className="p-2 text-right">{data.total_tagihan?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div className="p-2 text-[10px] italic border-t border-black bg-gray-50">
            <span className="font-bold not-italic">Status: </span> 
            <span className="uppercase">{data.status}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[8px] text-center text-slate-400">
        Dicetak pada: {new Date().toLocaleString('id-ID')} | {store?.nama_store} System
      </div>

    </div>
  );
});

export default WorkOrderFormatPrint;