import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import React, { ChangeEvent, useEffect, useState, useMemo } from 'react'
import SearchPages from '../Components/SearchPages'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import PaginationPages from '../Components/PaginationPages'
import DeleteDialog from '../Components/DeleteDialog'

import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'

import { toast } from 'react-toastify'
import { TransaksiGet } from '@/stores/TransaksiSlice'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'
import { ITransaksi } from '@/utils/types'

const Penjualan = () => {
        const navigate = useNavigate();
        const dispatch = useAppDispatch();
        const transaksi = useAppSelector(state=>state.TransaksiSlice.transaksi);
        const [buttonAddModal,setButtonAddModal] = useState(false);
        const [deleteConfirmationModal,setDeleteConfirmationModal] = useState(false);
        const [searchQuery,setSearchQuery] = useState('');
    
        const submitDelete = async()=>{
            try {
              
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
          dispatch(TransaksiGet());
        },[]);
    
    
        //======== search =========
    
        // Aturan #8: Gunakan useMemo dan defensive check agar performa optimal
        const filterSearch = useMemo(() => {
            return (transaksi || []).filter((item) =>
                JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
            );
        }, [transaksi, searchQuery]);
    
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
        const currentTransaksi = filterSearch.slice(angkaAwal,angkaAkhir);
    
        //======== pagination ========
        const handlePageChange = (page:number)=>{
          setCurrentPage(page);
        }
    
        const handlePerPageChange = (e:ChangeEvent<HTMLSelectElement>)=>{
          setPerPages(Number(e.target.value));
          setCurrentPage(1);
        }


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
    dispatch(TransaksiGet({startDate,endDate})); // Contoh dispatch, sesuaikan dengan kebutuhan filter tanggal
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    // TODO: Tembak API / Dispatch Redux
    dispatch(TransaksiGet());
  };

  // Fungsi ini menyiapkan data dalam format yang sudah "rata" (flat) untuk keperluan cetak atau export
  const dataExport = () => {
        return filterSearch.map((item, index) => ({
            "No": index + 1,
            "No Transaksi": item.no_penjualan || '-',
            "Tanggal Penjualan": new Date(item.tgl_penjualan || new Date()).toLocaleDateString('id-ID'),
            "Pelanggan": item.nama_pelanggan || '-',
            "Metode Pembayaran": item.metode_pembayaran || '-',
            "Total Harga": Number(item.total_harga || 0), // Memastikan nilai adalah number murni
            "Status Transaksi": item.status_transaksi || '-',
        }));
    };

  const handlePrint = () => {
        printLayar(dataExport(), "Laporan Penjualan");
  };

  const handleExportExcel = () => {
        exportToExcel(dataExport(), `Penjualan_${Date.now()}`);
  };

  const handleExportPDF = () => {
        exportToPDF(
          dataExport(),                                 // 1. Data yang sudah diratakan (FlatData[])
          "Laporan Penjualan",                          // 2. Judul tercetak di atas kertas PDF (title)
          `Penjualan_${Date.now()}`                    // 3. Nama file saat tersimpan di komputer (filename)
      );
  }


  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Data Transaksi Penjualan</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md" onClick={()=>{navigate('/transaksi/pos')}}>
            <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Tambah Transaksi
          </Button>
          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
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
          <div className="hidden mx-auto md:block text-slate-500"></div>


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
              Showing {currentTransaksi.length === 0 ? 0 : angkaAwal+1} to {angkaAkhir} of {currentTransaksi.length} entries
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
                  Tgl Transaksi
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Pelanggan
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Metode
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Total
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Status
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  ACTIONS
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {/* Gunakan Fragment (<>...</>) untuk menyatukan array elemen agar sesuai dengan tipe ReactElement tunggal yang diminta induk */}
            <>{currentTransaksi.map((item: ITransaksi, index: number) => {
              return(
               <Table.Tr key={item._id || index} className="intro-x">
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-0 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {angkaAwal +index + 1}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    <div 
                      className="font-medium whitespace-nowrap text-primary cursor-pointer underline" 
                      onClick={() => navigate(`/transaksi/detail_penjualan/${item.no_penjualan}`)}
                    >
                      {item.no_penjualan}
                    </div>
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                     {new Date(item.tgl_penjualan || '').toLocaleDateString('id-ID')}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.nama_pelanggan || '-'}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.metode_pembayaran}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {'Rp. ' + (item.total_harga?.toLocaleString('id-ID') ?? '0')}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    <div className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-success/10 text-success">
                         {item.status_transaksi}
                      </div>
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-40 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    <div className="flex items-center justify-center">
                      <Menu>
                          <Menu.Button as={Button} variant="ghost" className={"p-2"}>
                              <Lucide icon="MoreVertical" className="w-6 h-6" />
                          </Menu.Button>
                          <Menu.Items className="w-48">
                              <Menu.Item onClick={(e:MouseEvent)=>{
                                e.preventDefault();
                                navigate(`/transaksi/detail_penjualan/${item.no_penjualan}`);
                                }}>
                                  <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" /> Detail
                              </Menu.Item>
                          </Menu.Items>
                      </Menu>
                    </div>
                  </Table.Td>
                </Table.Tr>
              )
            })}</>
            </Table.Tbody>
          </Table>
        </div>
        
      {/* BEGIN: Pagination */}
      <PaginationPages totalPages={totalPages} currentPages={currentPage} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
      {/* END: Pagination */}



      {/* BEGIN: Delete Confirmation Modal */}
      <DeleteDialog deleteConfirmationModal={deleteConfirmationModal} setDeleteConfirmationModal={setDeleteConfirmationModal} submitDelete={submitDelete} />
      {/* END: Delete Confirmation Modal */}
     </div>
    </>
  )
}

export default Penjualan