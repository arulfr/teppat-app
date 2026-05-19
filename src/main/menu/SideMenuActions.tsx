import React from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setChatOpen } from '@/stores/AdminSlice';
import clsx from 'clsx';

const SideMenuActions = () => {
  const dispatch = useAppDispatch();
  const isChatOpen = useAppSelector((state) => state.AdminSlice.isChatOpen);
  const isLogin = useAppSelector((state) => state.AdminSlice.isLogin);
  const role = isLogin?.role;

  return (
    <div className="mt-auto px-4 py-6 border-t border-white/5 flex flex-col gap-3">
      {/* WhatsApp Button - Hanya muncul untuk Owner dan Admin (Aturan #8) */}
      {(role === 'owner' || role === 'admin') && (
        <a
          href="https://wa.me/6281349490813?text=Halo%20Admin%20Sistem%20Informasi%20Manajemen%20Toko%20Saya,%20saya%20butuh%20bantuan%20dengan%20sistem."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba5a] hover:scale-[1.02] shadow-lg shadow-[#25D366]/20 transition-all duration-300 group active:scale-95"
        >
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageCircle size={18} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">WhatsApp</span>
            <span className="text-[10px] opacity-70">Bantuan CS</span>
          </div>
        </a>
      )}

      {/* AI Assistant Button */}
      {/* <button
        onClick={() => dispatch(setChatOpen(!isChatOpen))}
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group text-left",
          isChatOpen 
            ? "bg-primary text-white shadow-lg shadow-primary/30" 
            : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
        )}
      >
        <div className={clsx(
          "p-2 rounded-lg transition-colors",
          isChatOpen ? "bg-white/20" : "bg-primary/20 group-hover:bg-white/20"
        )}>
          <Bot size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold leading-tight">Tanya AI</span>
          <span className="text-[10px] opacity-70">Asisten Pintar</span>
        </div>
      </button> */}
    </div>
  );
};

export default SideMenuActions;