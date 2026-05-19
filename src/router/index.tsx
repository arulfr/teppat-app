import { useRoutes } from "react-router-dom";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";


// ==================== frontend ============================================

import Layout from "../themes";
import AdminFrontend from "../pages/AdminFrontend";
import KategoriData from "@/views/Kategori/KategoriData";
import KategoriAdd from "@/views/Kategori/KategoriAdd";
import KategoriEdit from "@/views/Kategori/KategoriEdit";
import SupplierData from "@/views/Supplier/SupplierData";
import Login from "@/views/Login/Login";
import Authenticator from "@/utils/Authenticator";
import BarangData from "@/views/Barang/BarangData";
import BarangMasuk from "@/views/Pembelian/BarangMasuk";
import BarangMasukInput from "@/views/Pembelian/BarangMasukInput";
import DetailBarangMasuk from "@/views/Pembelian/DetailBarangMasuk";
import KartuStokData from "@/views/KartuStok/KartuStokData";
import Pos from "@/views/Transaksi/Pos";
import Pelanggan from "@/views/Pelanggan/Pelanggan";
import Penjualan from "@/views/Transaksi/Penjualan";
import DetailPenjualan from "@/views/Transaksi/DetailPenjualan";
import path from "path";
import Jurnal from "@/views/Jurnal/Jurnal";
import DetailJurnal from "@/views/Jurnal/DetailJurnal";
import PenjualanLaporan from "@/views/Laporan/PenjualanLaporan";
import LaporanBarangTerjual from "@/views/Laporan/LaporanBarangTerjual";
import StokLaporan from "@/views/Laporan/StokLaporan";
import PenjualanBarang from "@/views/Transaksi/PenjualanBarang";
import BarangMasukPerBarang from "@/views/Pembelian/BarangMasukPerBarang";
import KeuanganLaporan from "@/views/Laporan/KeuanganLaporan";
import Dashboard from "@/views/Dashboard/Dashboard";
import UserData from "@/views/User/UserData";
import UserTambah from "@/views/User/UserTambah";
import UserEdit from "@/views/User/UserEdit";
import WizardForm from "@/views/wizard/WizardForm";
import UserSetMenu from "@/views/User/UserSetMenu";
import LaporanBarangLaku from "@/views/Laporan/LaporanBarangLaku";
import LaporanAnalisaJam from "@/views/Laporan/LaporanAnalisaJam";
import SatuanData from "@/views/Satuan/SatuanData";
import SatuanAdd from "@/views/Satuan/SatuanAdd";
import StockBatch from "@/views/StockBatch/StockBatch";
import WorkOrderForm from "@/views/Bengkel/WorkOrderForm";
import WorkOrderUpdate from "@/views/Bengkel/WorkOrderUpdate";
import WorkOrderList from "@/views/Bengkel/WorkOrderList";
import ServiceReminderList from "@/views/Bengkel/ServiceReminderList";
import DataMotor from "@/views/Bengkel/DataMotor";
import DataMotorEdit from "@/views/Bengkel/DataMotorEdit";
import RiwayatServis from "@/views/Bengkel/RiwayatServis";
import Pemasukan from "@/views/ArusKas/Pemasukan";
import PemasukanAdd from "@/views/ArusKas/PemasukanAdd";
import PemasukanEdit from "@/views/ArusKas/PemasukanEdit";
import Pengeluaran from "@/views/ArusKas/Pengeluaran";
import PengeluaranAdd from "@/views/ArusKas/PengeluaranAdd";
import PengeluaranEdit from "@/views/ArusKas/PengeluaranEdit";
import Mekanik from "@/views/Bengkel/Mekanik";
import Layanan from "@/views/Bengkel/Layanan";
import PaymentConfirmation from "@/views/upgrade/PaymentConfirmation";
import { C } from "@fullcalendar/core/internal-common";
import CustomerReceivableList from "@/views/Keuangan/CustomerReceivableList"; // Anda perlu membuat komponen ini
import CustomerReceivablePayForm from "@/views/Keuangan/CustomerReceivablePayForm"; // Anda perlu membuat komponen ini
import HutangSupplier from "@/views/Keuangan/HutangSupplier";
import ChatWidget from "@/views/Widget/ChatWidget";

function Router() {
  const routes = [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/kategori_data",
          element:<Authenticator><KategoriData /></Authenticator> ,
        },
        {
          path: "/kategori_add",
          element:<Authenticator><KategoriAdd /></Authenticator> ,
        },
        {
          path: "/kategori_edit/:id",
          element:<Authenticator><KategoriEdit /></Authenticator> ,
        }
      ],
    },
    {
      path:"/supplier",
      element:<Layout/>,
      children:[
        {
          path:"list",
          element:<Authenticator><SupplierData/></Authenticator>
        }
      ]
    },
    {
      path:"/pelanggan",
      element:<Layout/>,
      children:[
        {
          path:"list",
          element:<Authenticator><Pelanggan/></Authenticator>
        }
      ]
    },
    {
      path:"/satuan",
      element:<Layout/>,
      children:[
        {
          path:"",
          element:<Authenticator><SatuanData/></Authenticator>
        },
        {
          path:"satuan_add",
          element:<Authenticator><SatuanAdd/></Authenticator>
        },
        {
          path:"satuan_edit/:id",
          element:<Authenticator><SatuanAdd/></Authenticator>
        }
      ]
    },
    {
      path:"/inventaris",
      element:<Layout/>,
      children:[
        {
          path:"barang_masuk",
          element:<Authenticator><BarangMasuk/></Authenticator>
        },
        {
          path:"barang_masuk_perbarang",
          element:<Authenticator><BarangMasukPerBarang/></Authenticator>
        },
        {
          path:"barang_masuk_input",
          element:<Authenticator><BarangMasukInput/></Authenticator>
        },
        {
          path:"detail_barang_masuk/:no_pembelian",
          element:<Authenticator><DetailBarangMasuk/></Authenticator>
        },
        {
          path:"kartu_stok",
          element:<Authenticator><KartuStokData/></Authenticator>
        },
      ]
    },
    {
      path:"/barang",
      element:<Layout/>,
      children:[
        {
          path:"data",
          element:<Authenticator><BarangData /></Authenticator>
        },
        {
          path:"stok_batch",
          element:<Authenticator><StockBatch /></Authenticator>
        },
      ]
    },
    {
      path:"/transaksi",
      element:<Layout/>,
      children:[
        {
          path:"pos",
          element:<Authenticator><Pos /></Authenticator>
        },
        {
          path:"penjualan",
          element:<Authenticator><Penjualan /></Authenticator>
        },
        {
          path:"penjualan_barang",
          element:<Authenticator><PenjualanBarang /></Authenticator>
        },
        {
          path:"detail_penjualan/:no_penjualan",
          element:<Authenticator><DetailPenjualan /></Authenticator>
        },
      ]
    },
    {
      path: "/pemasukan",
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Authenticator><Pemasukan /></Authenticator>
        },
        {
          path: "tambah",
          element: <Authenticator><PemasukanAdd /></Authenticator>
        },
        {
          path: "edit/:id",
          element: <Authenticator><PemasukanEdit /></Authenticator>
        },
      ]
    },
    {
      path: "/pengeluaran",
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Authenticator><Pengeluaran /></Authenticator>
        },
        {
          path: "tambah",
          element: <Authenticator><PengeluaranAdd /></Authenticator>
        },
        {
          path: "edit/:id",
          element: <Authenticator><PengeluaranEdit /></Authenticator>
        },
      ]
    },
    {
      path:"/jurnal",
      element:<Layout/>,
      children:[
        {
          path:"list",
          element:<Authenticator><Jurnal /></Authenticator>
        },
        {
          path:"detail/:id",
          element:<Authenticator><DetailJurnal /></Authenticator>
        },
      ]
    },
    {
      path:"/user",
      element:<Layout/>,
      children:[
        {
          path:"",
          element:<Authenticator><UserData /></Authenticator>
        },
        {
          path:"list",
          element:<Authenticator><UserData /></Authenticator>
        },
        {
          path:"tambah",
          element:<Authenticator><UserTambah /></Authenticator>
        },
        {
          path:"set_menu/:id?",
          element:<Authenticator><UserSetMenu /></Authenticator>
        },
        {
          path:"edit/:id",
          element:<Authenticator><UserEdit /></Authenticator>
        },
      ]
    },
    {
      path:"/bengkel",
      element:<Layout/>,
      children:[
        {
          path:"work_order/baru",
          element:<Authenticator><WorkOrderForm /></Authenticator>
        },
        {
          path:"work_order",
          element:<Authenticator><WorkOrderList /></Authenticator>
        },
        {
          path: "service_reminder",
          element: <Authenticator><ServiceReminderList /></Authenticator>
        },
        {
          path:"work_order/update/:id",
          element:<Authenticator><WorkOrderUpdate /></Authenticator>
        },
        {
          path:"data_motor",
          element:<Authenticator><DataMotor /></Authenticator>
        },
        {
          path: "data_motor/add",
          element: <Authenticator><WorkOrderForm /></Authenticator>
        },
        {
          path: "data_motor/edit/:id",
          element: <Authenticator><DataMotorEdit /></Authenticator>
        },
        {
          path: "riwayat_servis/:id",
          element: <Authenticator><RiwayatServis /></Authenticator>
        },
        {
          path:"layanan",
          element:<Authenticator><Layanan /></Authenticator>
        },
        {
          path:"mekanik",
          element:<Authenticator><Mekanik /></Authenticator>
        },
      ]
    },
    {
      path: "/keuangan",
      element: <Layout />,
      children: [
        {
          path:"hutang_supplier",
          element:<Authenticator><HutangSupplier /></Authenticator>
         },
        {
          path:"piutang_customer",
          element:<Authenticator><CustomerReceivableList /></Authenticator>
        },
        {
          path:"piutang_customer/pay/:id",
          element:<Authenticator><CustomerReceivablePayForm /></Authenticator>
        },
      ]
    },
    {
      path: "/Widget",
      element: <Layout />,
      children: [
        {
          path:"chat",
          element:<Authenticator><ChatWidget /></Authenticator>
         },
      ]
    },
    {
      path:"/laporan",
      element:<Layout/>,
      children:[
        {
          path:"penjualan",
          element:<Authenticator><PenjualanLaporan /></Authenticator>
        },
        {
          path:"barang_terjual",
          element:<Authenticator><LaporanBarangTerjual /></Authenticator>
        },
        {
          path:"stok_laporan",
          element:<Authenticator><StokLaporan /></Authenticator>
        },
        {
          path:"keuangan",
          element:<Authenticator><KeuanganLaporan /></Authenticator>
        },
        {
          path:"analisa_penjualan",
          element:<Authenticator><LaporanBarangLaku /></Authenticator>
        },
        {
          path:"analisa_jam",
          element:<Authenticator><LaporanAnalisaJam /></Authenticator>
        },
        {
          path:"detail/:id",
          element:<Authenticator><DetailJurnal /></Authenticator>
        },
      ]
    },
    {
      path: "/upgrade",
      element: <Layout />,
      children: [
        {
          path: "confirm/:id_order",
          element: <Authenticator>
            <PaymentConfirmation />
          </Authenticator>
        }
      ]
    },
    {
      path: "/wizard_form",
      element: <WizardForm />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/error-page",
      element: <ErrorPage />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ];

  return useRoutes(routes);
}

export default Router;
