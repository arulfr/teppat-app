import { IPemasukan, IPengeluaran, FilterParams } from "@/utils/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/AxiosInstance";
import { RootState } from "./store";

// Thunks untuk Pemasukan (Income)
export const getPemasukan = createAsyncThunk(
  "kas/getPemasukan",
  async (params: FilterParams | undefined, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      const response = await axiosInstance.get("/pemasukan", {
        params: { ...params, id_store: activeStoreId },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil data pemasukan");
    }
  }
);

export const addPemasukan = createAsyncThunk(
  "kas/addPemasukan",
  async (payload: IPemasukan, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      const response = await axiosInstance.post("/pemasukan_post", {
        ...payload,
        id_store: activeStoreId,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menambah pemasukan");
    }
  }
);

export const updatePemasukan = createAsyncThunk(
  "kas/updatePemasukan",
  async (payload: IPemasukan, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/pemasukan_update/${payload._id}`, payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal memperbarui pemasukan");
    }
  }
);

export const deletePemasukan = createAsyncThunk(
  "kas/deletePemasukan",
  async (id: string, thunkAPI) => {
    try {
      await axiosInstance.delete(`/pemasukan_delete/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menghapus pemasukan");
    }
  }
);

// Thunks untuk Pengeluaran (Expense)
export const getPengeluaran = createAsyncThunk(
  "kas/getPengeluaran",
  async (params: FilterParams | undefined, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      const response = await axiosInstance.get("/pengeluaran", {
        params: { ...params, id_store: activeStoreId },
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal mengambil data pengeluaran");
    }
  }
);

export const addPengeluaran = createAsyncThunk(
  "kas/addPengeluaran",
  async (payload: IPengeluaran, thunkAPI) => {
    try {
      const activeStoreId = (thunkAPI.getState() as RootState).AdminSlice.activeStoreId;
      const response = await axiosInstance.post("/pengeluaran_post", {
        ...payload,
        id_store: activeStoreId,
      });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menambah pengeluaran");
    }
  }
);

export const updatePengeluaran = createAsyncThunk(
  "kas/updatePengeluaran",
  async (payload: IPengeluaran, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/pengeluaran_update/${payload._id}`, payload);
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal memperbarui pengeluaran");
    }
  }
);

export const deletePengeluaran = createAsyncThunk(
  "kas/deletePengeluaran",
  async (id: string, thunkAPI) => {
    try {
      await axiosInstance.delete(`/pengeluaran_delete/${id}`);
      return id;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Gagal menghapus pengeluaran");
    }
  }
);

const KasSlice = createSlice({
  name: "kas",
  initialState: {
    pemasukan: [] as IPemasukan[],
    pengeluaran: [] as IPengeluaran[],
    loading: false,
    error: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pemasukan Reducers
      .addCase(getPemasukan.pending, (state) => { state.loading = true; })
      .addCase(getPemasukan.fulfilled, (state, action) => {
        state.loading = false;
        state.pemasukan = action.payload;
      })
      .addCase(getPemasukan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPemasukan.fulfilled, (state, action) => {
        state.pemasukan.unshift(action.payload);
      })
      .addCase(updatePemasukan.fulfilled, (state, action) => {
        const index = state.pemasukan.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.pemasukan[index] = action.payload;
      })
      .addCase(deletePemasukan.fulfilled, (state, action) => {
        state.pemasukan = state.pemasukan.filter(p => p._id !== action.payload);
      })
      // Pengeluaran Reducers
      .addCase(getPengeluaran.pending, (state) => { state.loading = true; })
      .addCase(getPengeluaran.fulfilled, (state, action) => {
        state.loading = false;
        state.pengeluaran = action.payload;
      })
      .addCase(getPengeluaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPengeluaran.fulfilled, (state, action) => {
        state.pengeluaran.unshift(action.payload);
      })
      .addCase(updatePengeluaran.fulfilled, (state, action) => {
        const index = state.pengeluaran.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.pengeluaran[index] = action.payload;
      })
      .addCase(deletePengeluaran.fulfilled, (state, action) => {
        state.pengeluaran = state.pengeluaran.filter(p => p._id !== action.payload);
      });
  }
});

export default KasSlice.reducer;
