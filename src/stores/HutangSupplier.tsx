import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getAccountPayables } from "@/stores/AccountPayableSlice";
import Table from "@/components/Base/Table";
import { FormSelect, FormInput } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import clsx from "clsx";

const HutangSupplier = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.AccountPayableSlice);
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);
  
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activeStoreId) {
      dispatch(getAccountPayables({ id_store: activeStoreId, status: filterStatus }));
    }
  }, [dispatch, activeStoreId, filterStatus]);

  const filteredList = list.filter((item) =>
    item.no_faktur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id_supplier?.nama_supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-5">
      <div className="flex flex-col items-center sm:flex-row intro-y">
        <h2 className="mr-auto text-lg font-medium">Daftar Hutang ke Supplier</h2>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <div className="flex items-center w-full sm:w-auto">
            <label className="mr-2 text-xs font-medium text-slate-500">Status</label>
            <FormSelect
              className="w-40 text-xs !box"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="pending">Belum Dibayar (Pending)</option>
              <option value="partial">Dibayar Sebagian</option>
              <option value="paid">Lunas</option>
              <option value="canceled">Dibatalkan</option>
            </FormSelect>
          </div>
          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Cari No. Faktur/Supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Lucide icon="Search" className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
            </div>
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No. Faktur</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Supplier</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Tgl Terima</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Jatuh Tempo</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Total Hutang</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right text-danger">Sisa Tagihan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredList.map((item) => (
                <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="box font-medium text-primary underline cursor-pointer">
                    {item.no_faktur}
                  </Table.Td>
                  <Table.Td className="box">
                    <div className="font-medium">{item.id_supplier?.nama_supplier || "Umum"}</div>
                    <div className="text-xs text-slate-500">{item.id_supplier?.kode_supplier}</div>
                  </Table.Td>
                  <Table.Td className="box text-center">
                    {new Date(item.tanggal_terima).toLocaleDateString("id-ID")}
                  </Table.Td>
                  <Table.Td className="box text-center">
                    <div className={clsx({
                      "text-danger font-bold": new Date(item.jatuh_tempo) < new Date() && item.status !== 'paid'
                    })}>
                      {new Date(item.jatuh_tempo).toLocaleDateString("id-ID")}
                    </div>
                  </Table.Td>
                  <Table.Td className="box text-right font-medium">
                    Rp {Intl.NumberFormat("id-ID").format(item.total_hutang)}
                  </Table.Td>
                  <Table.Td className="box text-right font-bold text-danger">
                    Rp {Intl.NumberFormat("id-ID").format(item.sisa_tagihan)}
                  </Table.Td>
                  <Table.Td className="box text-center">
                    <span className={clsx("px-2 py-1 rounded-full text-[10px] font-bold uppercase", {
                      "bg-warning/20 text-warning": item.status === 'pending',
                      "bg-primary/20 text-primary": item.status === 'partial',
                      "bg-success/20 text-success": item.status === 'paid',
                      "bg-danger/20 text-danger": item.status === 'canceled' || item.status === 'void'
                    })}>
                      {item.status}
                    </span>
                  </Table.Td>
                </Table.Tr>
              ))}
              {filteredList.length === 0 && !loading && (
                <Table.Tr>
                  <Table.Td colSpan={7} className="text-center py-10 text-slate-500 italic">
                    Data hutang tidak ditemukan.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HutangSupplier;