import Button from '@/components/Base/Button';
import { FormInput, FormSelect } from '@/components/Base/Form';
import { Menu } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import Pagination from '@/components/Base/Pagination';
import Table from '@/components/Base/Table';
import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import clsx from "clsx";
import DeleteDialog from '../Components/DeleteDialog';
import Tippy from '@/components/Base/Tippy';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getPembelian } from '@/stores/PembelianSlice';
import { IPembelian } from '@/utils/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper';


const BarangMasuk = () => {
    const dispatch = useAppDispatch();
    const pembelianList : IPembelian[] = useAppSelector((state)=>state.PembelianSlice.pembelianList);

    useEffect(()=>{
      dispatch(getPembelian());
    },[]);

    const navigate = useNavigate();

    const [searchParams,setSearchParams] = useSearchParams();

  // ========================= paginasi =========================================
    const [perPages,setPerPages] = useState(10);
    const currentPages = Number(searchParams.get('page')) || 1;
    const [searchTerm,setSearchTerm] = useState('');
    const [filterMetode, setFilterMetode] = useState(''); // State untuk filter status

    const filteredBarang = pembelianList.filter((item: any) => {
        const matchSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
        const matchMetode = filterMetode === "" || item.metode_pembayaran === filterMetode;
        
        return matchSearch && matchMetode;
    });

    const lastPages = perPages*currentPages;
    const firstPages = lastPages-perPages;
    

    const slicePage = filteredBarang.slice(firstPages,lastPages);


    const totalPages = Math.ceil(filteredBarang.length/perPages);

    const pageShow = 3;
    const midPages = Math.floor(pageShow/2);
    let startNum = midPages-firstPages;
    let endNum = midPages+startNum+1;
    if(startNum < 1){
      startNum = 1;
      endNum = Math.min(pageShow,totalPages); 
    }
    
    if(endNum > totalPages){
      endNum = totalPages;
      startNum = Math.max(totalPages - pageShow + 1,1); 
    }
    
    let pages:number[] = [];

    for (let i = startNum; i <= endNum ; i++) {
        pages.push(i);
    }

    const handlePageChange = (page:number) =>{
         //setCurrentPages(page);
         setSearchParams({ page: page.toString() });
    }
    const handlePerPageChange = (e:React.ChangeEvent<HTMLSelectElement>) =>{
        setPerPages(Number(e.target.value));
        //setCurrentPages(1);
        setSearchParams({ page: '1' });
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
    dispatch(getPembelian({startDate,endDate})); // Contoh dispatch, sesuaikan dengan kebutuhan filter tanggal
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    // TODO: Tembak API / Dispatch Redux
    dispatch(getPembelian());
  };

  // Fungsi ini menyiapkan data dalam format yang sudah "rata" (flat) untuk keperluan cetak atau export
  const dataExport = () => {
        return filteredBarang.map((item, index) => ({
            "No": index + 1,
            "No Pembelian": item.no_pembelian || "-",
            "Tanggal": new Date(item.tanggal_pembelian || new Date()).toLocaleDateString('id-ID'),
            "Keterangan": item.keterangan || '-',
            "Supplier": item.kode_supplier || 'Umum',
            "Metode": item.metode_pembayaran || 'Cash',
            "User": (item as any).username ? `${(item as any).username} (${(item as any).kode_user})` : (item as any).kode_user || '-',
            "Total Harga": item.total_harga
        }));
    };

  const handlePrint = () => {
        printLayar(dataExport(), "Laporan Riwayat Barang Masuk");
  };

  const handleExportExcel = () => {
        exportToExcel(dataExport(), `Barang_Masuk_${Date.now()}`);
  };

  const handleExportPDF = () => {
        exportToPDF(
          dataExport(),                                 // 1. Data yang sudah diratakan (FlatData[])
          "Laporan Riwayat Barang Masuk",               // 2. Judul tercetak di atas kertas PDF (title)
          `Barang_Masuk_${Date.now()}`                  // 3. Nama file saat tersimpan di komputer (filename)
      );
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Barang Masuk Pertransaksi</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md" onClick={()=>{navigate('/inventaris/barang_masuk_input')}}>
            <Plus className="w-4 h-4 ml-2" /> Tambah Barang
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
          
          <div className="hidden mx-auto md:block text-slate-500">
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

            {/* ============filter status==========*/}
            <label className="mb-1 text-xs font-medium text-slate-500 mr-2 ml-4">
              Status
            </label>
            <FormSelect 
              className="w-32 text-xs !box"
              value={filterMetode}
              onChange={(e) => setFilterMetode(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="Cash">Lunas (Cash)</option>
              <option value="Tempo">Belum Lunas (Tempo)</option>
            </FormSelect>
            {/* ==================================== */}

          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search..."
                onChange={(e)=>setSearchTerm(e.target.value)}
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </div>
          </div>
        </div>
        {/* BEGIN: Data List */}
        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No.
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No Transaksi
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Tanggal
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">
                  Total Harga
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Keterangan
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Supplier
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Metode
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  User
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Aksi
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {slicePage.map((item,index) => (
                <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {firstPages + index + 1}
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div 
                      className="font-medium whitespace-nowrap text-primary cursor-pointer underline" 
                      onClick={() => navigate(`/inventaris/detail_barang_masuk/${item.no_pembelian}`)}
                    >
                      {item.no_pembelian}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium whitespace-nowrap mt-0.5">
                      {new Date(item.tanggal_pembelian || '').toLocaleDateString('id-ID')}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-right shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium whitespace-nowrap">
                      Rp. {Intl.NumberFormat('ID-id').format(Number(item?.total_harga) || 0)}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="whitespace-nowrap mt-0.5">{item.keterangan || "-"}</div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium text-slate-500">{item.kode_supplier || "Umum"}</div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <span className={clsx(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        item.metode_pembayaran === 'Tempo' 
                            ? "bg-warning/20 text-warning" 
                            : "bg-success/20 text-success"
                    )}>
                        {item.metode_pembayaran || 'Cash'}
                    </span>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="whitespace-nowrap">
                      <div className="font-medium">{(item as any).username || '-'}</div>
                      <div className="text-xs text-slate-500">{(item as any).kode_user}</div>
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="flex items-center justify-center">
                      <Menu>
                          <Menu.Button as={Button} variant="ghost" className={"p-2"}>
                              <Lucide icon="MoreVertical" className="w-6 h-6" />
                          </Menu.Button>
                          <Menu.Items className="w-48">
                              <Menu.Item onClick={(e:MouseEvent)=>{
                                e.preventDefault();
                                navigate(`/inventaris/detail_barang_masuk/${item.no_pembelian}`);
                                }}>
                                  <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" /> Detail
                              </Menu.Item>
                          </Menu.Items>
                      </Menu>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
        {/* END: Data List */}
        {/* BEGIN: Pagination */}
        <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
          <Pagination className="w-full sm:w-auto sm:mr-auto">
            <Pagination.Link>
              <Lucide icon="ChevronsLeft" className="w-4 h-4" onClick={()=>handlePageChange(1)} />
            </Pagination.Link>
            <Pagination.Link >
              <Lucide icon="ChevronLeft" className="w-4 h-4" onClick={()=>handlePageChange(Math.max(currentPages-1,1))} />
            </Pagination.Link>
            {pages.map(page => (
                <Pagination.Link key={page} active={currentPages === page} >
                    <span onClick={()=>handlePageChange(page)} >
                        {page}
                    </span>
                    </Pagination.Link>
            ))}
            <Pagination.Link>
              <Lucide icon="ChevronRight" className="w-4 h-4" onClick={()=>handlePageChange(Math.min(currentPages+1,totalPages))} />
            </Pagination.Link>
            <Pagination.Link >
              <Lucide icon="ChevronsRight" className="w-4 h-4" onClick={()=>handlePageChange(totalPages)} />
            </Pagination.Link>
          </Pagination>
          <FormSelect className="w-20 mt-3 !box sm:mt-0" onChange={handlePerPageChange}>
            <option>10</option>
            <option>25</option>
            <option>35</option>
            <option>50</option>
          </FormSelect>
        </div>
        {/* END: Pagination */}
      </div>
      {/* BEGIN: Delete Confirmation Modal */}

      {/* END: Delete Confirmation Modal */}
      {/* ADD MODAL */}
      
      {/* END ADD MODAL */}
      {/* EDIT MODAL  */}
      
      {/* END EDIT MODAL  */}
    </>
  )
}

export default BarangMasuk