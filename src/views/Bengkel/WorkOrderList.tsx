import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { completeWorkOrder, fetchWorkOrders, updateWorkOrderStatus } from "@/stores/BengkelSlice";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import Table from "@/components/Base/Table";
import { formatCurrency } from "@/utils/helper";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import WorkOrderFormatPrint from "./WorkOrderFormatPrint";
import WorkOrderInvoicePrint from "./WorkOrderInvoicePrint";

const WorkOrderList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { workOrders, loading } = useAppSelector((state) => state.BengkelSlice);
  // Lakukan casting ke any karena available_stores mungkin belum terdefinisi di interface state AdminSlice
  const { activeStoreId, available_stores, isLogin } = useAppSelector((state) => state.AdminSlice) as any;

  // State untuk menyimpan WO mana yang sedang diproses untuk diprint
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Mencari detail store aktif untuk header print
  const activeStore = useMemo(() => {
    const activeId = activeStoreId?.toString();
    const found = (available_stores || []).find((s: any) => (s._id?.toString() === activeId) || (s.id_store?.toString() === activeId));
    return found || available_stores?.[0];
  }, [available_stores, activeStoreId]);

  const handlePrintWO = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => setSelectedWO(null),
  });

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    onAfterPrint: () => setSelectedWO(null),
  });

  const triggerPrint = (item: any) => {
    setSelectedWO(item);
    // Beri jeda sedikit agar state ter-update dan DOM siap
    setTimeout(() => {
        handlePrintWO();
    }, 500);
  };

  const triggerPrintInvoice = (item: any) => {
    setSelectedWO(item);
    setTimeout(() => {
        handlePrintInvoice();
    }, 500);
  };

  useEffect(() => {
    if (activeStoreId) dispatch(fetchWorkOrders());
  }, [activeStoreId, dispatch]);

// Contoh penyesuaian di WorkOrderList.tsx
const handleComplete = async (id: string) => {
   // Aturan #8: Gunakan fallback jika activeStoreId null (defensive programming)
   const storeId = activeStoreId || isLogin?.id_store || (isLogin as any)?.data?.id_store;
   
   if (!storeId) return toast.error("ID Toko tidak ditemukan. Silakan muat ulang halaman.");

   if (window.confirm("Selesaikan pengerjaan? Stok sparepart akan dipotong otomatis.")) {
       await dispatch(completeWorkOrder({ id, id_store: storeId } as any)).unwrap();
       dispatch(fetchWorkOrders()); 
   }
};

const handleStartWork = async (id: string) => {
    const storeId = activeStoreId || isLogin?.id_store || (isLogin as any)?.data?.id_store;
    if (!storeId) return toast.error("ID Toko tidak ditemukan.");

    if (window.confirm("Pindahkan kendaraan ke area pengerjaan (Mulai Kerja)?")) {
        await dispatch(updateWorkOrderStatus({ id, status: 'on_progress', id_store: storeId } as any)).unwrap();
        toast.success("Status diperbarui: Sedang Dikerjakan");
        dispatch(fetchWorkOrders()); // Tambahkan refresh list
    }
};

const handleCancel = async (id: string) => {
    const storeId = activeStoreId || isLogin?.id_store || (isLogin as any)?.data?.id_store;
    if (!storeId) return toast.error("ID Toko tidak ditemukan.");

    if (window.confirm("Apakah Anda yakin ingin membatalkan Work Order ini?")) {
        try {
            await dispatch(updateWorkOrderStatus({ id, status: 'canceled', id_store: storeId } as any)).unwrap();
            toast.success("Work Order telah dibatalkan");
            dispatch(fetchWorkOrders()); // Tambahkan refresh list
        } catch (error: any) {
            toast.error(error || "Gagal membatalkan Work Order");
        }
    }
};

const handleNavigateUpdate = (id: string) => {
    if (!id) return;
    navigate(`/bengkel/work_order/update/${id}`);
};


  return (
    <div className="mt-5 box p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="text-lg font-medium">Antrean Work Order (SPK)</div>
        <Button variant="primary" onClick={() => navigate("/bengkel/work_order/baru")}>
          Tambah SPK Baru
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table className="border-b">
          <Table.Thead className="bg-slate-50">
            <Table.Tr>
              <Table.Th>No. SPK</Table.Th>
              <Table.Th>Pelanggan / Kendaraan</Table.Th>
              <Table.Th>Mekanik</Table.Th>
              <Table.Th>Total Tagihan</Table.Th>
              <Table.Th className="text-center">Status</Table.Th>
              <Table.Th className="text-center">Aksi</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {workOrders.map((item) => (
              <Table.Tr key={item._id}>
                <Table.Td className="font-mono font-bold text-primary">{item.no_spk}</Table.Td>
                <Table.Td>
                  <div className="font-medium">{item.id_pelanggan?.nama_pelanggan}</div>
                  <div className="text-xs text-slate-500 uppercase">{item.id_kendaraan?.plat_nomor} - {item.id_kendaraan?.merk} {item.id_kendaraan?.model} ({item.id_kendaraan?.tahun})</div>
                </Table.Td>
                <Table.Td>{item.id_mekanik_utama?.nama_mekanik || "-"}</Table.Td>
                <Table.Td className="font-semibold">{formatCurrency(item.total_tagihan)}</Table.Td>
                <Table.Td className="text-center">
                  <span className={clsx("px-2 py-1 rounded-full text-[10px] font-bold uppercase", {
                    "bg-warning/20 text-warning": item.status === 'pending',
                    "bg-primary/20 text-primary": item.status === 'on_progress',
                    "bg-success text-white": item.status === 'done' || item.status === 'paid',
                    "bg-danger/20 text-danger": item.status === 'canceled'
                  })}>
                    {item.status}
                  </span>
                </Table.Td>
                <Table.Td className="text-center">
                   <div className="flex justify-center gap-2">
                        {['pending', 'on_progress'].includes(item.status) && (
                            <Button variant="outline-primary" size="sm" onClick={() => handleNavigateUpdate(item._id)}>
                                <Lucide icon="Pencil" className="w-4 h-4 mr-1" /> Update Part
                            </Button>
                        )}
                        {['pending', 'on_progress'].includes(item.status) && (
                            <Button variant="outline-danger" size="sm" onClick={() => handleCancel(item._id)}>
                                <Lucide icon="XCircle" className="w-4 h-4 mr-1" /> Batal
                            </Button>
                        )}
                        {item.status === 'pending' && (
                            <Button variant="primary" size="sm" onClick={() => handleStartWork(item._id)}>
                                <Lucide icon="Play" className="w-4 h-4 mr-1" /> Mulai
                            </Button>
                        )}
                        {item.status === 'on_progress' && (
                            <Button variant="success" size="sm" className="text-white" onClick={() => handleComplete(item._id)}>
                                <Lucide icon="CheckCircle" className="w-4 h-4 mr-1" /> Selesai
                            </Button>
                        )}
                        {item.status === 'done' && (
                            <Button variant="primary" size="sm" onClick={() => navigate(`/transaksi/pos?spk=${item._id}`)}>
                                <Lucide icon="CreditCard" className="w-4 h-4 mr-1" /> Bayar
                            </Button>
                        )}
                        <div className="flex gap-1">
                            <Button variant="outline-secondary" size="sm" onClick={() => triggerPrint(item)} title="Cetak SPK">
                                <Lucide icon="Printer" className="w-4 h-4" />
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => triggerPrintInvoice(item)} title="Cetak Invoice">
                                <Lucide icon="FileText" className="w-4 h-4" />
                            </Button>
                        </div>
                   </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {/* Hidden Print Template */}
      <div className="hidden">
        <WorkOrderFormatPrint ref={printRef} data={selectedWO} store={activeStore} user={isLogin} />
        <WorkOrderInvoicePrint ref={invoiceRef} data={selectedWO} store={activeStore} user={isLogin} />
      </div>
    </div>
  );
};

export default WorkOrderList;