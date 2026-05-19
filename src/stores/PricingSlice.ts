import axiosInstance from '@/utils/AxiosInstance';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface IPricingPlan {
  _id: string;
  id_plan: string;
  nama_paket: string;
  deskripsi?: string;
  harga_bulanan: number;
  harga_tahunan: number;
  fitur: string[];
  is_active: boolean;
}

export const getPricingPlans = createAsyncThunk('pricing/getPlans', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/public/pricing');
    return response.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil paket");
  }
});

const PricingSlice = createSlice({
  name: 'PricingSlice',
  initialState: {
    plans: [] as IPricingPlan[],
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPricingPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPricingPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(getPricingPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default PricingSlice.reducer;