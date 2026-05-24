import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";

export interface IPayrollResult {
  karyawan: {
    nama: string;
    role: string;
    tipe_bisnis: string;
    is_mekanik: boolean;
  };
  periode: {
    bulan: number;
    tahun: number;
  };
  rincian: {
    gaji_pokok: number;
    total_lembur: number;
    insentif_jasa_bengkel: number;
    potongan_telat: number;
  };
  gaji_kotor: number;
  gaji_bersih: number;
}

interface PayrollState {
  lastGenerated: IPayrollResult | null;
  loading: boolean;
  error: string | null;
}

export const generatePayroll = createAsyncThunk(
  "payroll/generate",
  async (payload: { employeeId: string; month: number; year: number; baseSalary: number; id_store: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/payroll/generate`,
        payload,
        { params: { id_store: payload.id_store } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState: PayrollState = {
  lastGenerated: null,
  loading: false,
  error: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePayroll.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.lastGenerated = action.payload;
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;