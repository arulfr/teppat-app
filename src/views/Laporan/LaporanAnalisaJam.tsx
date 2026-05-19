import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Lucide from '@/components/Base/Lucide';
import Table from '@/components/Base/Table';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { TransaksiGet } from '@/stores/TransaksiSlice';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const LaporanAnalisaJam = () => {
  const dispatch = useAppDispatch();
  const { transaksi } = useAppSelector(state => state.TransaksiSlice);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [interval, setInterval] = useState(1); // Default 1 jam

  const fetchData = useCallback(() => {
    dispatch(TransaksiGet({ startDate, endDate }));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Logika Analisa Jam: Mengelompokkan transaksi per jam 00-23
  const hourlyStats = useMemo(() => {
    const numBuckets = Math.ceil(24 / interval);
    const stats = Array.from({ length: numBuckets }, (_, i) => {
      const startHour = i * interval;
      const endHour = Math.min(startHour + interval - 1, 23);
      
      const label = interval === 1 
        ? `${startHour.toString().padStart(2, '0')}:00`
        : `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:59`;

      return {
        jam: label,
        total_transaksi: 0,
        total_nilai: 0,
      };
    });

    transaksi.forEach(trx => {
      if (trx.tgl_penjualan) {
        const hour = new Date(trx.tgl_penjualan).getHours();
        const bucketIndex = Math.floor(hour / interval);
        if (stats[bucketIndex]) {
          stats[bucketIndex].total_transaksi += 1;
          stats[bucketIndex].total_nilai += trx.total_harga || 0;
        }
      }
    });

    return stats;
  }, [transaksi, interval]);

  const peakHour = useMemo(() => {
    return [...hourlyStats].sort((a, b) => b.total_transaksi - a.total_transaksi)[0];
  }, [hourlyStats]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 intro-y">
        <div>
          <h2 className="text-lg font-medium">Analisa Jam Sibuk Transaksi</h2>
          <p className="text-slate-500 text-xs">Melihat waktu paling produktif untuk toko Anda</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md">
            <Lucide icon="Clock" className="w-4 h-4 mr-2 text-slate-500" />
            <select 
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer" 
              value={interval} 
              onChange={e => setInterval(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map(h => (
                <option key={h} value={h}>Rentang {h} Jam</option>
              ))}
            </select>
          </div>
          <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md">
            <Lucide icon="Calendar" className="w-4 h-4 mr-2 text-slate-500" />
            <input type="date" className="bg-transparent border-none text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="mx-2">-</span>
            <input type="date" className="bg-transparent border-none text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {/* Card Highlight */}
        <div className="col-span-12 md:col-span-4 intro-y">
          <div className="box p-5 bg-primary text-white relative overflow-hidden">
            <Lucide icon="Clock" className="w-24 h-24 absolute -right-4 -bottom-4 opacity-10" />
            <div className="text-base">Jam Paling Ramai</div>
            <div className="text-3xl font-bold mt-2">{peakHour?.total_transaksi > 0 ? peakHour.jam : '--:--'}</div>
            <div className="text-xs mt-1 opacity-80">Dengan {peakHour?.total_transaksi || 0} Transaksi</div>
          </div>
        </div>

        {/* Tabel Analisa */}
        <div className="col-span-12 intro-y">
          <div className="box p-5">
            <div className="overflow-x-auto">
              <Table sm striped>
                <Table.Thead className="bg-slate-50">
                  <Table.Tr>
                    <Table.Th>Rentang Waktu (Jam)</Table.Th>
                    <Table.Th className="text-center">Jumlah Transaksi</Table.Th>
                    <Table.Th className="text-right">Total Perputaran Uang</Table.Th>
                    <Table.Th className="text-center">Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {hourlyStats.map((item) => (
                    <Table.Tr key={item.jam}>
                      <Table.Td className="font-medium">{item.jam}</Table.Td>
                      <Table.Td className="text-center">{item.total_transaksi} Trx</Table.Td>
                      <Table.Td className="text-right font-mono">Rp {item.total_nilai.toLocaleString('id-ID')}</Table.Td>
                      <Table.Td className="text-center">
                        {item.total_transaksi === peakHour?.total_transaksi && item.total_transaksi > 0 ? (
                          <span className="px-2 py-1 bg-success/10 text-success text-[10px] rounded-full font-bold uppercase">Peak Time</span>
                        ) : item.total_transaksi === 0 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full" 
                              style={{ width: `${(item.total_transaksi / peakHour.total_transaksi) * 100}%` }}
                            />
                          </div>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanAnalisaJam;