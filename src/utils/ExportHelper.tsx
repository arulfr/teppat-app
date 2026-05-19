// Lokasi file: src/utils/exportHelper.ts
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipe data ini memaksa komponen untuk mengirimkan data yang sudah rata (flat)
// Tidak boleh ada object bersarang di dalam data yang dikirim ke sini.
type FlatData = Record<string, string | number>;

export const exportToExcel = (data: FlatData[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn("Data kosong, batal export.");
        return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: FlatData[], title: string, filename: string) => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();
    doc.text(title, 14, 15);
    
    // Secara cerdas mengambil nama kolom dari "keys" object baris pertama
    const tableHeaders = Object.keys(data[0]);
    // Mengekstrak nilainya saja menjadi array of arrays
    const tableData = data.map(obj => Object.values(obj));

    autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 20,
        theme: 'striped',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] } // Warna biru elegan (bisa diganti)
    });

    doc.save(`${filename}.pdf`);
};

export const printLayar = (data: FlatData[], title: string) => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF();
    doc.text(title, 14, 15);
    
    const tableHeaders = Object.keys(data[0]);
    const tableData = data.map(obj => Object.values(obj));

    autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 20,
        theme: 'striped'
    });

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
};



// Tambahkan di dalam file exportHelper.ts Anda

interface ItemFaktur {
    nama_barang: string;
    qty: number | string;
    harga: number;
    sub_total: number;
}

export const exportFakturPDF = (
    noTransaksi: string,
    tanggal: string,
    items: ItemFaktur[],
    subtotal: number,
    opsi: 'print' | 'pdf' = 'pdf',
    jenisTransaksi: 'pembelian' | 'penjualan' = 'penjualan'
) => {
    console.log(opsi);
    // 1. Inisialisasi Kertas A4 (Potret)
    const doc = new jsPDF();

    // Evaluasi teks dinamis berdasarkan jenis transaksi
    const judulDokumen = jenisTransaksi === 'pembelian' 
        ? "Bukti Transaksi Barang Masuk" 
        : "Bukti Transaksi Penjualan";
        
    const labelHarga = jenisTransaksi === 'pembelian' 
        ? "HARGA BELI" 
        : "HARGA JUAL";
    
    // 2. KEPALA FAKTUR (HEADER) - Pengaturan Kordinat X dan Y absolut
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TEPPAT", 14, 22); // Nama Sistem/Toko
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(judulDokumen, 14, 30);
    
    // Garis Pemisah Atas
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // 3. INFORMASI TRANSAKSI
    doc.setFontSize(10);
    doc.text(`No. Transaksi  : ${noTransaksi}`, 14, 45);
    doc.text(`Tanggal        : ${tanggal}`, 14, 52);

    // 4. TABEL BARANG (Otomatis menghitung tinggi)
    // Menyiapkan format data untuk autoTable
    const tableColumn = ["NAMA BARANG", "QTY", labelHarga, "SUBTOTAL"];
    const tableRows = items.map(item => [
        item.nama_barang,
        item.qty.toString(),
        `Rp ${item.harga.toLocaleString('id-ID')}`,
        `Rp ${Number(item.sub_total).toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60, // Mulai menggambar tabel tepat di bawah informasi transaksi
        theme: 'plain', // Desain minimalis tanpa blok warna berlebihan untuk faktur
        styles: { fontSize: 9 },
        headStyles: { 
            fontStyle: 'bold', 
            lineWidth: 0.1, 
            lineColor: [200, 200, 200] 
        },
        columnStyles: {
            0: { cellWidth: 80 }, // Lebar kolom nama barang lebih besar
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });

    // 5. FOOTER (TOTAL AKHIR)
    // Titik Buta: Kita tidak tahu tabel akan berakhir di kordinat Y berapa.
    // autoTable menyimpan posisi terakhirnya di doc.lastAutoTable.finalY
    const finalY = (doc as any).lastAutoTable.finalY + 10; 

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    
    // Rata Kanan untuk Total
    const textTotal = `Total Akhir: Rp ${subtotal.toLocaleString('id-ID')}`;
    const textWidth = doc.getTextWidth(textTotal);
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Menempatkan teks total tepat di margin kanan (14mm dari tepi kanan)
    doc.text(textTotal, pageWidth - textWidth - 14, finalY);

    // Garis Penutup Bawah
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, finalY + 5, pageWidth - 14, finalY + 5);

    // 6. EKSEKUSI UNDUH
    if (opsi === 'print') {
        const pdfUrl = doc.output('bloburl');
        window.open(pdfUrl, '_blank');
    } else {
        doc.save(`Faktur_${noTransaksi}.pdf`);
    }
};