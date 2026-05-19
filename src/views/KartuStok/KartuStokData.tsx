import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SearchPages from '../Components/SearchPages';
import Table from '@/components/Base/Table';
import { Menu } from '@/components/Base/Headless';
import PaginationPages from '../Components/PaginationPages';
import DeleteDialog from '../Components/DeleteDialog';
import SupplierAdd from '../Supplier/SupplierAdd';
import SupplierEdit from '../Supplier/SupplierEdit';
import { kartuStokget } from '@/stores/KartuStokSlice';
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper';

const KartuStokData = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const kartuStok = useAppSelector(state=>state.KartuStokSlice.kartu_stok) || [];
    const [selectId,setSelectId] = useState('');
    const [buttonAddModal,setButtonAddModal] = useState(false);
    const [supplierEditModal,setSupplierEditModal] = useState(false);
    const [deleteConfirmationModal,setDeleteConfirmationModal] = useState(false);
    const [searchQuery,setSearchQuery] = useState('');

    const submitDelete = async()=>{
        try {
        //   await dispatch(supplierDelete(selectId)).unwrap();
          
          toast.success('Delete Berhasil',{
            position:'top-right',
            autoClose:3000
          });
          setDeleteConfirmationModal(false);
        } catch (error) {
          let msgError;
          if(error instanceof Error){
            msgError = error.message || 'Error Silahkan Coba Lagi';
          }
          toast.error(msgError,{
            position:'top-right',
            autoClose:3000
          })
        }
    }

    useEffect(()=>{
      dispatch(kartuStokget());
    },[]);


    //======== search =========

    const filterSearch = kartuStok.filter((item)=>
        JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e:ChangeEvent<HTMLInputElement>)=>{
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    }
  // ==================================

    //entries perpage & pagination
    const [currentPage,setCurrentPage] = useState(1);
    const [perPages,setPerPages] = useState(10);

    const totalPages = Math.ceil(filterSearch.length/perPages);
    const angkaAkhir = currentPage * perPages;
    const angkaAwal = angkaAkhir - perPages;
    const currentData = filterSearch.slice(angkaAwal,angkaAkhir);
    const totalEntries = filterSearch.length;

    //======== pagination ========
    const handlePageChange = (page:number)=>{
      setCurrentPage(page);
    }

    const handlePerPageChange = (e:ChangeEvent<HTMLSelectElement>)=>{
      setPerPages(Number(e.target.value));
      setCurrentPage(1);
    }

      //======== filter tanggal ========
      //=============================================================================
    
      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const handleTerapkanFilter = () => {
        if (!startDate || !endDate) {
          toast.warning("Pilih tanggal awal dan akhir.", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        // TODO: Tembak API / Dispatch Redux di sini
        dispatch(kartuStokget({startDate,endDate})); // Contoh dispatch, sesuaikan dengan kebutuhan filter tanggal
      };
    
      const handleResetFilter = () => {
        setStartDate('');
        setEndDate('');
        // TODO: Tembak API / Dispatch Redux
        dispatch(kartuStokget());
      };

      //=============================================================================
      // Fungsi ini menyiapkan data dalam format yang sudah "rata" (flat) untuk keperluan cetak atau export
      const dataExport = () => {
            return filterSearch.map((item, index) => ({
                "No": index + 1,
                "Nama Barang": item.nama_barang || '-',
                "Jumlah Stok Masuk": item.jumlah_stok_masuk || '-',
                "Jumlah Stok Keluar": item.jumlah_stok_keluar || '-',
                "Stok Akhir": item.stok_akhir, // Biarkan berupa angka jika ingin Excel bisa menjumlahkannya
                "User": (item as any).username ? `${(item as any).username} (${item.kode_user})` : item.kode_user,
                "Tanggal Transaksi": new Date(item.tanggal_transaksi || new Date()).toLocaleDateString('id-ID'),
                "Keterangan": item.keterangan || '-',
            }));
        };

      const handlePrint = () => {
            printLayar(dataExport(), "Laporan Kartu Stok Barang");
      };

      const handleExportExcel = () => {
            exportToExcel(dataExport(), `Kartu_Stok_${Date.now()}`);
      };

      const handleExportPDF = () => {
            exportToPDF(
              dataExport(),                                 // 1. Data yang sudah diratakan (FlatData[])
              "Laporan Riwayat Barang Masuk",               // 2. Judul tercetak di atas kertas PDF (title)
              `Kartu_Stok_${Date.now()}`                  // 3. Nama file saat tersimpan di komputer (filename)
          );
      }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">KARTU STOK</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
              <span className='mr-1'>print/ export</span>
              <span className="flex items-center justify-center w-5 h-5">
                <Lucide icon="Download" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-40">
              <Menu.Item onClick={handlePrint}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={handleExportExcel}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to
                Excel
              </Menu.Item>
              <Menu.Item onClick={handleExportPDF}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to
                PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <div className="hidden mx-auto md:block text-slate-500">
              {/* Showing {angkaAwal + 1} to {Math.min(angkaAkhir, currentData.length)} of {currentData.length} entries */}
          </div>

            {/* ============filter tanggal==========*/}
            <label className="mb-1 text-xs font-medium text-slate-500 mr-2">
              Filter Tanggal
            </label>
              <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md intro-y">
                
                  {/* Ikon Kalender Global */}
                  <Lucide icon="Calendar" className="w-4 h-4 mr-2 text-slate-500" />
                  {/* 2. Input Tanggal Awal (Tanpa border) */}
                  <input
                    type="date"
                    className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  {/* Pemisah */}
                  <span className="mx-2 text-slate-400">-</span>
                  {/* 3. Input Tanggal Akhir (Tanpa border) */}
                  <input
                    type="date"
                    className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  {/* 4. Garis Pembatas Vertikal & Tombol Aksi */}
                  <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
                    <button 
                      onClick={handleTerapkanFilter} 
                      className="transition-colors text-slate-500 hover:text-success"
                      title="Terapkan Filter"
                    >
                      <Lucide icon="Filter" className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={handleResetFilter} 
                      className="transition-colors text-slate-500 hover:text-danger"
                      title="Reset Filter"
                    >
                      <Lucide icon="X" className="w-4 h-4" />
                    </button>
                  </div>

              </div>
            {/* ==================================== */}

        {/*  Begin : Search */}
          <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        {/* end */}
        </div>
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <div className="hidden mx-auto md:block text-slate-500">
              Showing {totalEntries === 0 ? 0 : angkaAwal+1} to {angkaAkhir} of {totalEntries} entries
          </div>
        </div>
        {/* BEGIN: Data List */}
        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No Transaksi
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Nama Barang
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Jumlah Stok Masuk
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Jumlah Stok Keluar
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Stok Akhir
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  User
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Tanggal Transaksi
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Keterangan
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {currentData.map((item,index)=>{
              return(
               <Table.Tr key={item._id || index} className="intro-x">
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-0 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {angkaAwal +index + 1}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.no_bukti ? (
                      <div 
                        className="font-medium whitespace-nowrap text-primary cursor-pointer underline"
                        onClick={() => {
                          if (item.status === 'masuk') {
                            navigate(`/inventaris/detail_barang_masuk/${item.no_bukti}`);
                          } else {
                            navigate(`/transaksi/detail_penjualan/${item.no_bukti}`);
                          }
                        }}
                      >
                        {item.no_bukti}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Tanpa No. Bukti</span>
                    )}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.nama_barang}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.jumlah_stok_masuk}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.jumlah_stok_keluar}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.stok_akhir}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    <div className="whitespace-nowrap">
                      <div className="font-medium">{(item as any).username || '-'}</div>
                      <div className="text-xs text-slate-500">{item.kode_user}</div>
                    </div>
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      {new Date(item.tanggal_transaksi || '').toLocaleDateString('id-ID')}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.keterangan}
                  </Table.Td>
                </Table.Tr>
              )
            })}
            </Table.Tbody>
          </Table>
        </div>
        
      {/* BEGIN: Pagination */}
      <PaginationPages totalPages={totalPages} currentPages={currentPage} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
      {/* END: Pagination */}



      {/* BEGIN: Delete Confirmation Modal */}
      <DeleteDialog deleteConfirmationModal={deleteConfirmationModal} setDeleteConfirmationModal={setDeleteConfirmationModal} submitDelete={submitDelete} />
      {/* END: Delete Confirmation Modal */}
      {/* supplier Add */}
      <SupplierAdd supplierAddModal={buttonAddModal} setSupplierAddModal={setButtonAddModal} />
      {/* End Supplier Add*/}
      <SupplierEdit supplierEditModal={supplierEditModal} setSupplierEditModal={setSupplierEditModal} selectId={selectId} />
      </div>
    </>
  )
}

export default KartuStokData