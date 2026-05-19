import { type Menu } from "@/stores/menuSlice";

const menu: Array<Menu | "divider"> = [
  {
    icon: "LayoutDashboard",
    pathname: "/",
    title: "Dashboard",
    slug: "dashboard",
  },
  {
    icon: "Database",
    title: "Master Data",
    slug: "master-data",
    subMenu: [
      {
        icon: "Tags",
        pathname: "/kategori_data",
        title: "Kategori",
        slug: "master-kategori",
      },
      {
        icon: "Scale",
        pathname: "/satuan",
        title: "Satuan",
        slug: "master-satuan",
      },
      {
        icon: "Truck",
        pathname: "/supplier/list",
        title: "Supplier",
        slug: "master-supplier",
      },
      {
        icon: "Package",
        pathname: "/barang/data",
        title: "Barang",
        slug: "master-barang",
      },
      {
        icon: "Users",
        pathname: "/pelanggan/list",
        title: "Pelanggan",
        slug: "master-pelanggan",
      },
    ],
  },
  {
    icon: "Boxes",
    title: "Inventaris",
    slug: "inventaris",
    subMenu: [
      {
        icon: "ArrowDownLeft",
        pathname: "/inventaris/barang_masuk",
        title: "Barang Masuk (Trx)",
        slug: "inventaris-masuk-trx",
      },
      {
        icon: "ClipboardList",
        pathname: "/inventaris/barang_masuk_perbarang",
        title: "Barang Masuk (Item)",
        slug: "inventaris-masuk-item",
      },
      {
        icon: "FileStack",
        pathname: "/inventaris/kartu_stok",
        title: "Kartu Stok",
        slug: "inventaris-stok",
      },
    ],
  },
  {
    icon: "Archive",
    title: "Stock Batch",
    slug: "stock-batch",
    subMenu: [
      {
        icon: "Layers",
        pathname: "/barang/stok_batch",
        title: "Stok per Batch",
        slug: "stock-batch",
      },
    ],
  },
  {
    icon: "ShoppingCart",
    title: "Transaksi",
    slug: "transaksi",
    subMenu: [
      {
        icon: "Monitor",
        pathname: "/transaksi/pos",
        title: "POS Kasir",
        slug: "transaksi-pos",
      },
      {
        icon: "History",
        pathname: "/transaksi/penjualan",
        title: "Penjualan (Trx)",
        slug: "transaksi-penjualan-trx",
      },
      {
        icon: "FileSearch",
        pathname: "/transaksi/penjualan_barang",
        title: "Penjualan (Item)",
        slug: "transaksi-penjualan-item",
      },
    ],
  },
  {
    icon: "Wrench",
    title: "Bengkel",
    slug: "bengkel",
    subMenu: [
      {
        icon: "PlusCircle",
        pathname: "/bengkel/work_order/baru",
        title: "Buat SPK Baru",
        slug: "bengkel-spk-baru",
      },
      {
        icon: "ClipboardCheck",
        pathname: "/bengkel/work_order",
        title: "Monitoring SPK",
        slug: "bengkel-spk-list",
      },
      {
        icon: "Bike",
        pathname: "/bengkel/data_motor",
        title: "Data Motor",
        slug: "bengkel-data-motor",
      },
      {
        icon: "UserCog",
        pathname: "/bengkel/mekanik",
        title: "Data Mekanik",
        slug: "bengkel-mekanik",
      },
      {
        icon: "ConciergeBell",
        pathname: "/bengkel/layanan",
        title: "Data Layanan",
        slug: "bengkel-layanan",
      },
      {
        icon: "BellRing",
        pathname: "/bengkel/service_reminder",
        title: "Service Reminder",
        slug: "bengkel-service-reminder",
      },
    ],
  },
  {
    icon: "Wallet",
    title: "Keuangan",
    slug: "keuangan",
    subMenu: [
      {
        icon: "ArrowUpCircle",
        pathname: "/pemasukan",
        title: "Pemasukan Lain",
        slug: "keuangan-pemasukan",
      },
      {
        icon: "ArrowDownCircle",
        pathname: "/pengeluaran",
        title: "Pengeluaran Biaya",
        slug: "keuangan-pengeluaran",
      },
      {
        icon: "BookText",
        pathname: "/jurnal/list",
        title: "Jurnal Kas",
        slug: "keuangan-jurnal",
      },
      {
        icon: "UserMinus",
        pathname: "/keuangan/hutang_supplier",
        title: "Hutang Supplier",
        slug: "keuangan-hutang",
      },
      {
        icon: "UserPlus", // Atau ikon lain yang sesuai
        pathname: "/keuangan/piutang_customer",
        title: "Piutang Customer",
        slug: "keuangan-piutang",
      },
    ],
  },
  {
    icon: "BarChart3",
    title: "Laporan & Analisa",
    slug: "report",
    subMenu: [
      {
        icon: "TrendingUp",
        pathname: "/laporan/analisa_penjualan",
        title: "Analisa Penjualan",
        slug: "report-analisa-penjualan",
      },
      {
        icon: "Clock",
        pathname: "/laporan/analisa_jam",
        title: "Analisa Jam Transaksi",
        slug: "report-analisa-jam",
      },
      {
        icon: "FileBarChart",
        pathname: "/laporan/penjualan",
        title: "Laporan Penjualan",
        slug: "report-penjualan",
      },
      {
        icon: "PieChart",
        pathname: "/laporan/barang_terjual",
        title: "Laporan Per Barang",
        slug: "report-penjualan-item",
      },
      {
        icon: "Warehouse",
        pathname: "/laporan/stok_laporan",
        title: "Laporan Stok",
        slug: "report-stok",
      },
      {
        icon: "LineChart",
        pathname: "/laporan/keuangan",
        title: "Laporan Keuangan",
        slug: "report-keuangan",
      },
    ],
  },
  {
    icon: "Settings",
    pathname: "/user/list",
    title: "Pengaturan User",
    slug: "manage-user",
  },
];

export default menu;