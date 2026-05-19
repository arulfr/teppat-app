import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/AxiosInstance';

interface AccountPayable {
  _id: string;
  no_faktur: string;
  id_supplier: {
    _id: string;
    nama_supplier: string;
    kode_supplier: string;
  };
  tanggal_terima: string;
  jatuh_tempo: string;
  total_hutang: number;
  sisa_tagihan: number;
  status: 'pending' | 'partial' | 'paid' | 'void' | 'canceled';
  riwayat_cicilan: Array<{
    tanggal_bayar: string;
    nominal: number;
    metode_pembayaran: string;
    keterangan?: string;
    id_jurnal?: string;
  }>;
}

export const getAccountPayables = createAsyncThunk(
  'accountPayable/getAccountPayables',
  async (params: { id_store: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/account_payable', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal mengambil data hutang');
    }
  }
);

export const payAccountPayable = createAsyncThunk(
  'accountPayable/pay',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/account_payable/pay/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Gagal membayar hutang');
    }
  }
);

const accountPayableSlice = createSlice({
  name: 'AccountPayableSlice',
  initialState: {
    list: [] as AccountPayable[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAccountPayables.pending, (state) => { state.loading = true; })
      .addCase(getAccountPayables.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAccountPayables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(payAccountPayable.fulfilled, (state, action) => {
        const index = state.list.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default accountPayableSlice.reducer;