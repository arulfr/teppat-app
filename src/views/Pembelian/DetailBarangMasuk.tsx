import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getPembelian, getPembelianItem, pembelianBatal } from '@/stores/PembelianSlice';
import { ArrowLeft, CornerDownLeft, CrossIcon, PrinterIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import BatalkanPembelianDialog from './BatalkanPembelianDialog';
import { toast } from 'react-toastify';
import { exportFakturPDF } from '@/utils/ExportHelper';
import { IPembelian, IPembelianItem } from '@/utils/types';
import { Printer } from 'lucide';
import Lucide from '@/components/Base/Lucide';
import { Menu } from '@/components/Base/Headless';

const DetailBarangMasuk = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useAppDispatch()
     //panggil url
    const no_pembelian = params.no_pembelian;
    const barangMasukSelect = useAppSelector(state=>state.PembelianSlice.pembelianItem);

    useEffect(()=>{
        if(no_pembelian){
            dispatch(getPembelianItem(no_pembelian));
        }
    },[dispatch,no_pembelian]);
    
    const [selectId,setSelectId] = useState<string>('');
    const [alasanPembatalan,setAlasanPembatalan] = useState<string>('');

    const [batalkanPembelianConfirm,setBatalkanPembelianConfirm] = useState(false);

    // E. HITUNG GRAND TOTAL (Otomatis)
    const grandTotal = useMemo(() => {
        return (barangMasukSelect?.items || []).reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);
    }, [barangMasukSelect]);

    const submitPembatalan = async() =>{
      try {
        await dispatch(pembelianBatal({id:selectId,alasan_void:alasanPembatalan})).unwrap();
        toast.success('Transaksi Pembelian Berhasil Diinput'); 
        setBatalkanPembelianConfirm(false);
        navigate(-1)
      } catch (error:string | any) {
        toast.error(error);
      }
    }

    const handleDownloadFaktur = (opsi:string) => {
    // Pastikan Anda memetakan state detail barang dari Redux ke format interface ItemFaktur
    const formatItems = (barangMasukSelect?.items || []).map((barang: any) => ({
        nama_barang: barang.nama_barang,
        qty: `${barang.jumlah} ${barang.satuan_pembelian || ''}`,
        harga: barang.harga_beli, // Sesuaikan dengan nama properti di database Anda
        sub_total: Number(barang.subtotal || barang.total_harga || 0)
    }));

    exportFakturPDF(
        barangMasukSelect?.no_pembelian || '',
        new Date(barangMasukSelect?.tanggal_pembelian || new Date()).toLocaleDateString('id-ID'),
        formatItems || [],
        Number(barangMasukSelect?.total_harga) || 0,
        opsi as 'print' | 'pdf',
        'pembelian'
    );
};

  return (
    <>
    <div className="flex items-center mt-12 intro-y relative z-[60]">
        <h2 className="mr-auto text-lg font-medium">Detail Transaksi Barang Masuk</h2>
          <Menu>
            <Menu.Button as={Button} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex gap-2">
                <Lucide icon="Download" className="w-4 h-4" /> Download
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 z-50 bg-white border rounded shadow-lg focus:outline-none">
              <Menu.Item onClick={()=>handleDownloadFaktur('print')}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={()=>handleDownloadFaktur('pdf')}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to
                PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>
        {/* <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex gap-2"
        onClick={handleDownloadFaktur} >
          <PrinterIcon size={20} />
          Print
        </button> */}
      </div>
      <div className="grid grid-cols-12 gap-6 mt-5 relative z-10">
        <div className="col-span-12 intro-y lg:col-span-12">
          {/* BEGIN: Form Layout */}

          <div className="p-5 intro-y box grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="no_pembelian">No Transaksi Pembelian: </FormLabel>
              <FormInput
                id="no_pembelian"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={no_pembelian}
                readOnly
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="nama_kategori">tanggal Transaksi</FormLabel>
            <FormInput
                id="no_pembelian"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={new Date(barangMasukSelect?.tanggal_pembelian || '').toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
                readOnly
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="no_pembelian">Supplier: </FormLabel>
              <FormInput
                id="no_pembelian"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={barangMasukSelect?.kode_supplier || ''}
                readOnly
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel>User:</FormLabel>
              <FormInput
                type="text"
                className="w-full bg-slate-100"
                value={
                  (barangMasukSelect as any)?.username 
                    ? `${(barangMasukSelect as any).username} (${(barangMasukSelect as any).kode_user})` 
                    : (barangMasukSelect as any)?.kode_user || '-'
                }
                readOnly
              />
            </div>
            {/* buat garis pembatas */}
            <div className='col-span-12 sm:col-span-12'>
                <hr className='border-t-2 border-gray-700 w-full' />
            </div>
            {/* 2. AREA TABEL */}
      <div className="bg-white rounded-lg shadow overflow-hidden border col-span-12 ">
        <div className='w-full overflow-x-auto'>
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-gray-100 uppercase text-gray-600 font-bold">
              <tr>
                <th className="p-4">Nama Barang</th>
                <th className="p-4 w-24">Qty</th>
                <th className="p-4 w-40">Harga Beli</th>
                <th className="p-4 w-40">Subtotal</th>
              </tr>
            </thead>
            <tbody>
                {barangMasukSelect?.items?.map((item: any, index: number)=>(
                <tr className='hover:bg-gray-50' key={index}>
                    <th className='p-4 font-medium text-gray-900' >{item.nama_barang}</th>
                    <th className='p-4 text-center'>{item.jumlah} {item.satuan_pembelian}</th>
                    <th className='p-4 text-center'>Rp. {Intl.NumberFormat('ID-id').format(Number(item.harga_beli || 0))}</th>
                    <th className='p-4 text-center'>Rp. {Intl.NumberFormat('ID-id').format(Number(item.subtotal || 0))}</th>
                    
                </tr>
                ))}
            </tbody>
                        {/* Footer Grand Total */}
            <tfoot className="bg-gray-50 font-bold">
              <tr>
                <td colSpan={3} className="p-4 text-right">Total Akhir:</td>
                <td className="p-4 text-right text-lg text-blue-600">
                  Rp {grandTotal?.toLocaleString("id-ID")}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>


            <div className="col-span-12 mt-5 text-right flex justify-between">
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex gap-2"
                onClick={(e) => {
                    e.preventDefault();
                    setBatalkanPembelianConfirm(true);
                    setSelectId(barangMasukSelect?._id || '');
                }} >
                <CornerDownLeft size={20} />
                Batalkan Pembelian 
            </button>
              <Button
                type="button"
                variant="outline-secondary"
                className="w-24 mr-1"
                // kembali ke halaman sebelumnya
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>
            </div>
          </div>

        </div>
      </div>
    
    <BatalkanPembelianDialog batalkanPembelianConfirm={batalkanPembelianConfirm} setBatalkanPembelianConfirm={setBatalkanPembelianConfirm} no_pembelian={no_pembelian} submit={submitPembatalan} alasanPembatalan={alasanPembatalan} setAlasanPembatalan={setAlasanPembatalan} />
    
    </>
  )
}

export default DetailBarangMasuk