import Button from '@/components/Base/Button';
import { Dialog } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import { useAppSelector } from '@/stores/hooks';
import React, { useState } from 'react'
import {z} from 'zod';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type deleteType = {
    batalkanPembelianConfirm:boolean
    setBatalkanPembelianConfirm:SetState<boolean>
    deleteButtonRef?:React.RefObject<HTMLButtonElement>
    submit?:()=>void
    no_pembelian?:string,
    alasanPembatalan:string,
    setAlasanPembatalan:SetState<string>
}

const alasanSchema = z.string().min(3, "Alasan pembatalan tidak boleh kosong!");


const BatalkanPembelianDialog = ({batalkanPembelianConfirm,setBatalkanPembelianConfirm,deleteButtonRef,submit,no_pembelian,alasanPembatalan,setAlasanPembatalan}:deleteType) => {

const pembelianSelected = useAppSelector(state=>state.PembelianSlice.pembelianList).find(item=>item.no_pembelian === no_pembelian)
const [errorMsg, setErrorMsg] = useState<string>("");

  const handleValidasiSubmit = () => {
    // safeParse tidak akan memunculkan error yang menghentikan aplikasi, ia hanya mengembalikan status success/error
    const hasilValidasi = alasanSchema.safeParse(alasanPembatalan);

    if (!hasilValidasi.success) {
      // Tangkap pesan error dari Zod dan tampilkan ke state
      setErrorMsg(hasilValidasi.error.issues[0].message);
      return; // HENTIKAN PROSES, jangan panggil submit API
    }

    // Jika lolos validasi, bersihkan error dan jalankan submit utama
    setErrorMsg("");
    if (submit) {
      submit();
    }
  };

const handleClose = () => {
    setBatalkanPembelianConfirm(false);
    setErrorMsg(""); // Bersihkan error saat modal ditutup
  };

  return (
    <>
      <Dialog
        open={Boolean(batalkanPembelianConfirm)}
        onClose={() => {
          setBatalkanPembelianConfirm(false);
        }}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="XCircle"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Apa anda yakin?</div>
            <div className="mt-2 text-slate-500">
              Apakah Benar anda akan melakukan pembatalan Transaksi dengan no pembelian {pembelianSelected?.no_pembelian} ? <br />
              Proses ini tidak bisa dikembalikan setelah selesai.
            </div>

            {/* AREA TAMBAHAN: FORM ALASAN VOID */}
            <div className="mt-6 text-left">
              <label htmlFor="alasan" className="block text-sm font-medium text-slate-700 mb-2">
                Alasan Pembatalan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="alasan"
                rows={3}
                // Ubah warna border menjadi merah jika ada error
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errorMsg 
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                  : "border-slate-300 focus:ring-slate-500 focus:border-slate-500"
                }`}                placeholder="Contoh: Salah input harga barang, retur total..."
                value={alasanPembatalan}
                onChange={(e) =>{
                  setAlasanPembatalan(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
              />

              {/* AREA PENAMPIL ERROR ZOD */}
              {errorMsg && (
                <p className="text-red-500 text-sm mt-1 text-left flex items-center gap-1">
                  <Lucide icon="Info" className="w-4 h-4" /> {errorMsg}
                </p>
              )}
            </div>
            {/* END AREA TAMBAHAN */}

          </div>
          <div className="px-5 pb-8 text-center flex justify-evenly">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={handleClose}
              className="w-24 mr-1"
            >
              Cancel
            </Button>
            <button
              type="button"
             className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex gap-2"
              ref={deleteButtonRef}
              onClick={handleValidasiSubmit}
            >
             Ya, Batalkan Transaksi
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}

export default BatalkanPembelianDialog