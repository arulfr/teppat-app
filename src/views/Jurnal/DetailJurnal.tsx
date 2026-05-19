import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { jurnalGet, jurnalGetId } from '@/stores/JurnalSlice';
import { IJurnalKas, IJurnalKasPembelianItemRef, IJurnalKasPenjualanItemRef } from '@/utils/types';
import Lucide from '@/components/Base/Lucide';
import { Menu } from '@/components/Base/Headless';
import React, { useEffect, useMemo } from 'react';
import { exportFakturPDF } from '@/utils/ExportHelper';
import { useNavigate, useParams } from 'react-router-dom';

const DetailJurnal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const detailJurnal = useAppSelector((state) => state.JurnalSlice.jurnalId);

  useEffect(() => {
    if(id){
      dispatch(jurnalGetId(id));
    }
  }, [dispatch]);

  const isPembelian = Boolean(detailJurnal?.data_pembelian);
  const isPenjualan = Boolean(detailJurnal?.data_penjualan);

  const nomorReferensi =
    detailJurnal?.data_pembelian?.no_pembelian ||
    detailJurnal?.data_penjualan?.no_penjualan ||
    '-';

  const tanggalReferensi = isPembelian
    ? detailJurnal?.data_pembelian?.tanggal_pembelian
    : detailJurnal?.data_penjualan?.tgl_penjualan;

  const items = (isPembelian
    ? detailJurnal?.data_pembelian?.items
    : detailJurnal?.data_penjualan?.items) as
    | IJurnalKasPembelianItemRef[]
    | IJurnalKasPenjualanItemRef[]
    | undefined;

  const grandTotal = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.reduce((acc: number, curr: any) => {
      const subtotal = Number(curr.subtotal ?? curr.sub_total ?? 0);
      return acc + subtotal;
    }, 0);
  }, [items]);

  const handleDownloadFaktur = (opsi: 'print' | 'pdf') => {
    const isPenjualanTx = Boolean(detailJurnal?.data_penjualan);

    const sourceItems = isPenjualanTx
      ? detailJurnal?.data_penjualan?.items || []
      : detailJurnal?.data_pembelian?.items || [];

    const formatItems = sourceItems.map((barang: any) => {
      return {
        nama_barang: barang.nama_barang || barang.kode_barang || '-',
        qty: Number(barang.jumlah || 0),
        harga: Number(barang.harga_jual ?? barang.harga_beli ?? 0),
        sub_total: Number(barang.subtotal ?? barang.sub_total ?? barang.total_harga ?? 0),
      };
    });

    const noFaktur = isPenjualanTx
      ? detailJurnal?.data_penjualan?.no_penjualan
      : detailJurnal?.data_pembelian?.no_pembelian;

    const tglFaktur = isPenjualanTx
      ? detailJurnal?.data_penjualan?.tgl_penjualan
      : detailJurnal?.data_pembelian?.tanggal_pembelian;

    exportFakturPDF(
      noFaktur || '',
      new Date(tglFaktur || new Date()).toLocaleDateString('id-ID'),
      formatItems,
      grandTotal,
      opsi,
      isPenjualanTx ? 'penjualan' : 'pembelian'
    );
  };


  return (
    <>
      <div className="flex items-center mt-12 intro-y relative z-[60]">
        <h2 className="mr-auto text-lg font-medium">Detail Jurnal Kas</h2>
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
      </div>

      <div className="grid grid-cols-12 gap-6 mt-5 relative z-10">
        <div className="col-span-12 intro-y lg:col-span-12">
          <div className="p-5 intro-y box grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="no_referensi">No Referensi</FormLabel>
              <FormInput id="no_referensi" type="text" className="w-full" value={nomorReferensi} readOnly />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="jenis_transaksi">Jenis Transaksi</FormLabel>
              <FormInput
                id="jenis_transaksi"
                type="text"
                className="w-full"
                value={isPembelian ? 'Pembelian' : isPenjualan ? 'Penjualan' : detailJurnal?.status || '-'}
                readOnly
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="tanggal_transaksi">Tanggal Transaksi</FormLabel>
              <FormInput
                id="tanggal_transaksi"
                type="text"
                className="w-full"
                value={new Date(tanggalReferensi || detailJurnal?.tanggal_transaksi || '').toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
                readOnly
              />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="keterangan">Keterangan</FormLabel>
              <FormInput id="keterangan" type="text" className="w-full" value={detailJurnal?.keterangan || '-'} readOnly />
            </div>

            <div className="col-span-12 sm:col-span-6">
              <FormLabel>User</FormLabel>
              <FormInput
                type="text"
                className="w-full bg-slate-100"
                value={
                  (detailJurnal as any)?.username 
                    ? `${(detailJurnal as any).username} (${detailJurnal?.kode_user})` 
                    : detailJurnal?.kode_user || '-'
                }
                readOnly
              />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="saldo_masuk">Saldo Masuk</FormLabel>
              <FormInput id="saldo_masuk" type="text" className="w-full" value={`Rp ${Intl.NumberFormat('id-ID').format(Number(detailJurnal?.saldo_masuk || 0))}`} readOnly />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="saldo_keluar">Saldo Keluar</FormLabel>
              <FormInput id="saldo_keluar" type="text" className="w-full" value={`Rp ${Intl.NumberFormat('id-ID').format(Number(detailJurnal?.saldo_keluar || 0))}`} readOnly />
            </div>

            <div className="col-span-12 sm:col-span-4">
              <FormLabel htmlFor="saldo_akhir">Saldo Akhir</FormLabel>
              <FormInput id="saldo_akhir" type="text" className="w-full" value={`Rp ${Intl.NumberFormat('id-ID').format(Number(detailJurnal?.saldo_akhir || 0))}`} readOnly />
            </div>

            <div className="col-span-12 sm:col-span-12">
              <hr className="border-t-2 border-gray-700 w-full" />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border col-span-12">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-gray-100 uppercase text-gray-600 font-bold">
                    <tr>
                      <th className="p-4">Nama Barang</th>
                      <th className="p-4 w-24">Qty</th>
                      <th className="p-4 w-40">{isPembelian ? 'Harga Beli' : 'Harga Jual'}</th>
                      <th className="p-4 w-40">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!items || items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Tidak ada detail item
                        </td>
                      </tr>
                    ) : (
                      items.map((item: any, index: number) => (
                        <tr className="hover:bg-gray-50" key={index}>
                          <td className="p-4 font-medium text-gray-900">{item.nama_barang || item.kode_barang}</td>
                          <td className="p-4 text-center">{Number(item.jumlah || 0)}</td>
                          <td className="p-4 text-center">
                            Rp {Intl.NumberFormat('id-ID').format(Number(item.harga_beli ?? item.harga_jual ?? 0))}
                          </td>
                          <td className="p-4 text-center">
                            Rp {Intl.NumberFormat('id-ID').format(Number(item.subtotal ?? item.sub_total ?? 0))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={3} className="p-4 text-right">Total Akhir:</td>
                      <td className="p-4 text-right text-lg text-blue-600">
                        Rp {grandTotal.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="col-span-12 mt-5 text-right flex justify-end">
              <Button type="button" variant="outline-secondary" className="w-24 mr-1" onClick={() => navigate(-1)}>
                Kembali
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailJurnal;
