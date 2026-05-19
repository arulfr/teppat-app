import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { getAccountPayables, payAccountPayable } from "@/stores/AccountPayableSlice";
import Table from "@/components/Base/Table";
import { FormSelect, FormInput, FormLabel } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import clsx from "clsx";
import Button from "@/components/Base/Button";
import { Dialog, Tab } from "@/components/Base/Headless";
import { toast } from "react-toastify";

const HutangSupplier = () => {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.AccountPayableSlice);
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);
  
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Bayar
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [paymentNominal, setPaymentNominal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tunai");
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    if (activeStoreId) {
      dispatch(getAccountPayables({ id_store: activeStoreId, status: filterStatus }));
    }
  }, [dispatch, activeStoreId, filterStatus]);

  const filteredList = (Array.isArray(list) ? list : []).filter((item) =>
    (item.no_faktur || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.id_supplier?.nama_supplier || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Transformasi data untuk tab Riwayat Cicilan
  const paymentHistory = (filteredList || []).flatMap((ap) =>
    (ap.riwayat_cicilan || []).map((cicilan) => ({
      ...cicilan,
      no_faktur: ap.no_faktur,
      nama_supplier: ap.id_supplier?.nama_supplier || "Umum",
      _apId: ap._id,
    }))
  ).sort((a, b) => new Date(b.tanggal_bayar).getTime() - new Date(a.tanggal_bayar).getTime());

  const handlePay = async () => {
    if (!paymentNominal || Number(paymentNominal) <= 0) {
      return toast.warning("Nominal harus lebih dari 0");
    }
    if (!activeStoreId) {
      return toast.error("Sesi toko tidak valid, silakan refresh halaman.");
    }
    try {
      await dispatch(payAccountPayable({
        id: selectedDebt._id,
        data: {
          nominal: paymentNominal,
          metode_pembayaran: paymentMethod,
          keterangan: paymentNote,
          id_store: activeStoreId
        }
      })).unwrap();
      toast.success("Pembayaran berhasil dicatat");
      setPaymentModal(false);
      setPaymentNominal("");
      setPaymentNote("");
    } catch (err: any) {
      toast.error(err);
    }
  };

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

        <div className="col-span-12 mt-3">
          <Tab.Group>
            <Tab.List variant="tabs">
              <Tab>
                <Tab.Button className="w-full py-2" as="button">
                  Daftar Hutang (Faktur)
                </Tab.Button>
              </Tab>
              <Tab>
                <Tab.Button className="w-full py-2" as="button">
                  Riwayat Pembayaran (Cicilan)
                </Tab.Button>
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-5">
              <Tab.Panel>
                <div className="overflow-auto lg:overflow-visible">
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
                        <Table.Th className="border-b-0 whitespace-nowrap text-center">Aksi</Table.Th>
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
                          <Table.Td className="box text-center">
                            {item.status !== 'paid' && item.status !== 'canceled' && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDebt(item);
                                  setPaymentNominal(item.sisa_tagihan.toString());
                                  setPaymentModal(true);
                                }}
                              >
                                Bayar
                              </Button>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="overflow-auto lg:overflow-visible">
                  <Table className="border-spacing-y-[10px] border-separate -mt-2">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th className="border-b-0 whitespace-nowrap">Tgl Bayar</Table.Th>
                        <Table.Th className="border-b-0 whitespace-nowrap">No. Faktur</Table.Th>
                        <Table.Th className="border-b-0 whitespace-nowrap">Supplier</Table.Th>
                        <Table.Th className="border-b-0 whitespace-nowrap text-right">Nominal</Table.Th>
                        <Table.Th className="border-b-0 whitespace-nowrap text-center">Metode</Table.Th>
                        <Table.Th className="border-b-0 whitespace-nowrap">Keterangan</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {paymentHistory.map((history, idx) => (
                        <Table.Tr key={idx} className="intro-x">
                          <Table.Td className="box">{new Date(history.tanggal_bayar).toLocaleString("id-ID")}</Table.Td>
                          <Table.Td className="box font-medium text-primary">{history.no_faktur}</Table.Td>
                          <Table.Td className="box">{history.nama_supplier}</Table.Td>
                          <Table.Td className="box text-right font-bold text-success">
                            Rp {Intl.NumberFormat("id-ID").format(history.nominal)}
                          </Table.Td>
                          <Table.Td className="box text-center">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">{history.metode_pembayaran}</span>
                          </Table.Td>
                          <Table.Td className="box text-slate-500 italic">{history.keterangan || "-"}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={paymentModal} onClose={() => setPaymentModal(false)}>
        <Dialog.Panel>
          <Dialog.Title>
            <h2 className="mr-auto text-base font-medium">Pembayaran Hutang</h2>
          </Dialog.Title>
          <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
            <div className="col-span-12">
              <FormLabel>No. Faktur</FormLabel>
              <FormInput value={selectedDebt?.no_faktur} readOnly className="bg-slate-100" />
            </div>
            <div className="col-span-12">
              <FormLabel>Sisa Tagihan</FormLabel>
              <FormInput value={`Rp ${Intl.NumberFormat("id-ID").format(selectedDebt?.sisa_tagihan || 0)}`} readOnly className="bg-slate-100 font-bold text-danger" />
            </div>
            <div className="col-span-12">
              <FormLabel>Nominal Bayar</FormLabel>
              <FormInput 
                type="number" 
                value={paymentNominal} 
                onChange={(e) => setPaymentNominal(e.target.value)} 
                placeholder="Masukkan nominal bayar..."
              />
            </div>
            <div className="col-span-12">
              <FormLabel>Metode Pembayaran</FormLabel>
              <FormSelect value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
                <option value="Lainnya">Lainnya</option>
              </FormSelect>
            </div>
            <div className="col-span-12">
              <FormLabel>Keterangan</FormLabel>
              <FormInput 
                type="text" 
                value={paymentNote} 
                onChange={(e) => setPaymentNote(e.target.value)} 
                placeholder="Catatan pembayaran..."
              />
            </div>
          </Dialog.Description>
          <Dialog.Footer>
            <Button 
              type="button" 
              variant="outline-secondary" 
              onClick={() => setPaymentModal(false)}
              className="w-20 mr-1"
            >
              Batal
            </Button>
            <Button type="button" variant="primary" onClick={handlePay} className="w-20">
              Simpan
            </Button>
          </Dialog.Footer>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default HutangSupplier;