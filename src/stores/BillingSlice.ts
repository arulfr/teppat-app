import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";

interface BillingOrder {
  _id: string;
  id_owner: string;
  paket_tujuan: string;
  durasi: string;
  total_harga: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  tanggal_request: string;
  bukti_pembayaran?: string;
}
export const createBillingOrder = createAsyncThunk(
  "billing/createOrder",
  async (data: { paket_tujuan: string; durasi: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/billing/order`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const confirmBillingPayment = createAsyncThunk(
  "billing/confirmPayment",
  async ({ id_order, bukti_pembayaran }: { id_order: string; bukti_pembayaran: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/billing/order/${id_order}/confirm`, { bukti_pembayaran });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const getBillingHistory = createAsyncThunk(
  "billing/getHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/billing/history`);
      return response.data as BillingOrder[];
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

interface BillingState {
  history: BillingOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: BillingState = {
  history: [],
  loading: false,
  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBillingOrder.pending, (state) => { state.loading = true; })
      .addCase(createBillingOrder.fulfilled, (state) => { state.loading = false; })
      .addCase(createBillingOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(confirmBillingPayment.pending, (state) => { state.loading = true; })
      .addCase(confirmBillingPayment.fulfilled, (state) => { state.loading = false; })
      .addCase(confirmBillingPayment.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(getBillingHistory.pending, (state) => { state.loading = true; })
      .addCase(getBillingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getBillingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default billingSlice.reducer;