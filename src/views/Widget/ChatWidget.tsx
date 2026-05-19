import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/stores/hooks';
import axiosInstance from '@/utils/AxiosInstance';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const activeStoreId = useAppSelector((state) => state.AdminSlice.activeStoreId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Aturan #2: Wajib menggunakan React Hook Form
  const { register, handleSubmit, reset } = useForm<{ message: string }>();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim() || !activeStoreId) return;

    const userMessage: Message = { role: 'user', parts: [{ text: data.message }] };
    setMessages((prev) => [...prev, userMessage]);
    reset();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chat-ai', {
        message: data.message,
        history: messages,
        id_store: activeStoreId, // Aturan #3: Kirim storeId untuk keamanan data
      });

      const aiMessage: Message = { role: 'model', parts: [{ text: response.data.reply }] };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: 'Maaf, terjadi gangguan koneksi ke asisten AI.' }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={clsx(
      "fixed bottom-6 right-6 z-[999] flex flex-col items-end",
      // Saat chat tertutup, pastikan kontainer utama tidak memblokir klik di tempat lain
      !isOpen && "pointer-events-none"
    )}>
      {/* Window Chat */}
      <div 
        className={clsx(
          "mb-4 w-[350px] sm:w-[410px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right",
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        )}
      >
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">TEPPAT Assistant</h4>
                <p className="text-[10px] opacity-80">AI Pintar untuk Bisnis Anda</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Histori Chat */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                <Bot size={48} className="mb-4 opacity-20" />
                <p className="text-sm italic">Halo! Saya asisten TEPPAT. Ada yang bisa saya bantu?</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={clsx(
                  "flex items-start gap-2.5",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={clsx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[10px] font-medium shadow-sm",
                  msg.role === 'user' ? "bg-white border-slate-200 text-slate-500" : "bg-primary text-white border-primary"
                )}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={clsx(
                  "flex flex-col gap-1 max-w-[80%]",
                  msg.role === 'user' ? "items-end" : "items-start"
                )}>
                  <div className={clsx(
                    "px-4 py-2 text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-2xl rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none"
                  )}>
                    {msg.parts[0].text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic ml-10">
                <Loader2 size={14} className="animate-spin" />
                Mengetik...
              </div>
            )}
          </div>

          {/* Footer: Input Form */}
          <form 
            onSubmit={handleSubmit(onSubmit)}
            className="p-4 bg-white border-t border-slate-100 flex gap-2"
          >
            <input
              {...register('message', { required: true })}
              placeholder="Ketik pesan di sini..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button className="bg-primary text-white p-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "h-14 w-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group", // Kelas asli
          isOpen ? "bg-slate-800 text-white" : "bg-primary text-white"
          , "pointer-events-auto" // Tombol toggle harus selalu bisa diklik
        )}
      >
        <div className="relative h-6 w-6">
          <X size={24} className={clsx("absolute inset-0 transition-all duration-500 transform", isOpen ? "rotate-0 opacity-100" : "rotate-90 opacity-0")} />
          <MessageSquare size={24} className={clsx("absolute inset-0 transition-all duration-500 transform", isOpen ? "-rotate-90 opacity-0" : "rotate-0 opacity-100 group-hover:scale-110")} />
        </div>
      </button>
    </div>
  );
};

export default ChatWidget;