import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLoginAgain: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ isOpen, onLoginAgain }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-center shadow-2xl transition-all border border-slate-100">
        {/* Icon Section */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>

        {/* Text Section */}
        <h3 className="mb-2 text-2xl font-bold text-slate-800">Sesi Berakhir</h3>
        <p className="mb-8 text-slate-600 leading-relaxed">
          Demi keamanan data toko Anda, sesi login telah berakhir. Silakan masuk kembali untuk melanjutkan transaksi.
        </p>

        {/* Button Section */}
        <button
          onClick={onLoginAgain}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all active:scale-[0.98]"
        >
          <LogIn className="h-5 w-5" />
          Masuk Kembali Sekarang
        </button>

        <div className="mt-6 text-xs text-slate-400">
          Aplikasi Sistem Kasir Teppat &copy; 2025
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;