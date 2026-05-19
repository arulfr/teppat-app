import Button from '@/components/Base/Button';
import { FormInput, FormSelect } from '@/components/Base/Form';
import { Dialog, Menu } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import Pagination from '@/components/Base/Pagination';
import Table from '@/components/Base/Table';
import Tippy from '@/components/Base/Tippy';
import { deleteBarang, getBarangList } from '@/stores/BarangSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import React, { useEffect, useState } from 'react'
import { current } from 'tailwindcss/colors';
import BarangAdd from './BarangAdd';
import { Plus } from 'lucide-react';
import { number } from 'zod';
import BarangEdit from './BarangEdit';
import DeleteDialog from '../Components/DeleteDialog';
import { toast } from 'react-toastify';
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper';
import { IBarang } from '@/utils/types';

const BarangData = () => {

    const dispatch = useAppDispatch();

    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
    const [editModal,setEditModal] = useState(false);
    const [selectId,setSelectId] = useState('');
    const deleteButtonRef = React.useRef<HTMLButtonElement>(null);

    const listBarang = useAppSelector((state)=>state.BarangSlice.BarangList);

    useEffect(()=>{
        dispatch(getBarangList());
    },[]);

    const [barangAddModal,setBarangAddModal] = useState(false);

    const submitDelete = async()=>{
        try {
          await dispatch(deleteBarang(selectId)).unwrap();
          setDeleteConfirmationModal(false);
          toast.success('Delete Berhasil',{
            position:'top-right',
            autoClose:3000
          });
        } catch (error:string | any) {
          toast.error(error,{
            position:'top-right',
            autoClose:3000
          })
        }
    }

    //===================================paginasi========================================

    const [currentPage,setCurrentPage] = useState(1);
    const [itemsPerPage,setItemsPerPage] = useState(10);
    const [searchTerm,setSearchTerm] = useState('');

    const filteredBarang = listBarang.filter((item:IBarang)=>JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = filteredBarang.slice(indexOfFirstItem,indexOfLastItem);

    const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

    const pageShow = 3;
    const midPage = Math.floor(pageShow/2);
    let startPage = currentPage - midPage;
    let endPage = currentPage + midPage + 1;
    if(startPage<1){
        startPage = 1;
        endPage = Math.min(pageShow,totalPages);
    }
    if(endPage>totalPages){
        endPage = totalPages;
        startPage = Math.max(totalPages - pageShow + 1,1);
    }

    const pages:number[]=[];
    for (let i= startPage;  i <= endPage; i++) {
        pages.push(i);
    }

    const handlePageChange = (page:number) =>{
        setCurrentPage(page);
    };

    const handlePerPageChange = (e:React.ChangeEvent<HTMLSelectElement>) =>{
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    }

    // Export data preparation
    const exportData = filteredBarang.map((item: IBarang, index: number) => ({
      No: index + 1,
      'Nama Barang': item.nama_barang,
      'Kode Kategori': item.kode_kategori,
      'Harga Beli': `Rp. ${Number(item.harga_beli).toLocaleString('id-ID')}`,
      'Harga Jual': `Rp. ${Number(item.harga_jual).toLocaleString('id-ID')}`,
      Stok: item.stok || 0,
      Satuan: item.satuan || '-',
      'Kadaluarsa': item.tanggal_kadaluarsa ? new Date(item.tanggal_kadaluarsa).toLocaleDateString('id-ID') : '-',
    }));

    const handlePrint = () => {
      printLayar(exportData, 'Laporan Data Barang');
    };

    const handleExportExcel = () => {
      exportToExcel(exportData, 'Laporan_Barang');
    };

    const handleExportPDF = () => {
      exportToPDF(exportData, 'Laporan Data Barang', 'Laporan_Barang');
    };


    //=====================================================================================================

    


            
  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Product List</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md" onClick={()=>{setBarangAddModal(!barangAddModal)}}>
            <Plus className="w-4 h-4 ml-2" /> Tambah Barang
          </Button>
          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
              <span className="flex items-center justify-center w-5 h-5">
                <Lucide icon="Printer" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-40">
              <Menu.Item onClick={handlePrint}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={handleExportExcel}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export Excel
              </Menu.Item>
              <Menu.Item onClick={handleExportPDF}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <div className="hidden mx-auto md:block text-slate-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBarang.length)} of {filteredBarang.length} entries
          </div>
          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
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
                  Nama Barang
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Harga Beli
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Harga Jual
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Stock
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Kadaluarsa
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentItems.map((item,index) => (
                <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {index + 1}
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <a href="" className="font-medium whitespace-nowrap">
                      {item.nama_barang}
                    </a>
                    <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                      {item.kode_kategori}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {"Rp. "+Intl.NumberFormat('ID-id').format(Number(item.harga_beli))}
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {"Rp. " + Intl.NumberFormat('ID-id').format(Number(item.harga_jual))}
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      (item.stok ?? 0) <= 0 
                        ? "bg-danger/10 text-danger" 
                        : (item.stok ?? 0) <= 10 
                          ? "bg-warning/20 text-warning" 
                          : "bg-success/10 text-success"
                    }`}>
                      {item.stok ?? 0} {item.satuan}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {item.tanggal_kadaluarsa ? (
                        <div className={`font-medium ${
                            new Date(item.tanggal_kadaluarsa).getTime() < new Date().getTime() 
                            ? "text-danger" 
                            : "text-slate-600"
                        }`}>
                            {new Date(item.tanggal_kadaluarsa).toLocaleDateString('id-ID')}
                        </div>
                    ) : (
                        <span className="text-slate-400">-</span>
                    )}
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
                                setEditModal(true)
                                setSelectId(item._id || '');
                                }}>
                                  <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" /> EDIT
                              </Menu.Item>
                              <Menu.Item onClick={(e:MouseEvent)=>{
                                    e.preventDefault();
                                    setDeleteConfirmationModal(true);
                                    setSelectId(item._id || '');
                                  }} >
                                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />{" "}
                                    DELETE
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
              <Lucide icon="ChevronLeft" className="w-4 h-4" onClick={()=>handlePageChange(Math.max(currentPage-1,1))} />
            </Pagination.Link>
            {pages.map(page => (
                <Pagination.Link key={page} active={currentPage === page} >
                    <span onClick={()=>handlePageChange(page)} >
                        {page}
                    </span>
                    </Pagination.Link>
            ))}
            <Pagination.Link>
              <Lucide icon="ChevronRight" className="w-4 h-4" onClick={()=>handlePageChange(Math.min(currentPage+1,totalPages))} />
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
      <DeleteDialog deleteConfirmationModal={deleteConfirmationModal} setDeleteConfirmationModal={setDeleteConfirmationModal} submitDelete={submitDelete} />
      {/* END: Delete Confirmation Modal */}
      {/* ADD MODAL */}
      <BarangAdd barangAddModal={barangAddModal} setBarangAddModal={setBarangAddModal} />
      {/* END ADD MODAL */}
      {/* EDIT MODAL  */}
      <BarangEdit barangEditModal={editModal} setBarangEditModal={setEditModal} idBarang={selectId} />
      {/* END EDIT MODAL  */}
    </>
  )
}

export default BarangData