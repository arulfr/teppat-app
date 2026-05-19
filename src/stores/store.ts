import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import darkModeReducer from "./darkModeSlice";
import colorSchemeReducer from "./colorSchemeSlice";
import menuReducer from "./menuSlice";
import themeReducer from "./themeSlice";
import AdminSlice from "./AdminSlice";
import BarangSlice from "./BarangSlice";
import PembelianSlice from "./PembelianSlice";
import KartuStokSlice from './KartuStokSlice';
import PelangganSlice from "./PelangganSlice";
import TransaksiSlice from "./TransaksiSlice";
import JurnalSlice from "./JurnalSlice";
import UserSlice from './UserSlice';
import StoreSlice from "./StoreSlice";
import SatuanSlice from "./SatuanSlice";
import StockBatch from "./StockBatchSlice";
import BengkelSlice from "./BengkelSlice";
import LayananSlice from "./LayananSlice";
import KasSlice from "./KasSlice";
import BillingSlice from "./BillingSlice";
import PayrollSlice from "./PayrollSlice";
import AccountPayableSlice from "./AccountPayableSlice";
import CustomerReceivableSlice from "./CustomerReceivableSlice";
import PricingSlice from "./PricingSlice";

import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // default ke localStorage

// Konfigurasi persist khusus hanya untuk AdminSlice
const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['isLogin', 'activeStoreId'], // Simpan login dan toko yang sedang aktif
};


// Gabungkan semua reducer
const rootReducer = combineReducers({
    darkMode: darkModeReducer,
    colorScheme: colorSchemeReducer,
    menu: menuReducer,
    theme: themeReducer,
    AdminSlice: persistReducer(adminPersistConfig, AdminSlice), // ← hanya AdminSlice yang dipersist
    BarangSlice: BarangSlice,
    PembelianSlice:PembelianSlice,
    KartuStokSlice:KartuStokSlice,
    PelangganSlice:PelangganSlice,
    TransaksiSlice:TransaksiSlice,
    JurnalSlice:JurnalSlice,
    UserSlice:UserSlice,
    StoreSlice:StoreSlice,
    SatuanSlice:SatuanSlice,
    StockBatch:StockBatch, // Ini sudah ada, tidak perlu diubah
    BengkelSlice:BengkelSlice,
    LayananSlice:LayananSlice,
    KasSlice:KasSlice,
    BillingSlice: BillingSlice,
    PayrollSlice: PayrollSlice,
    AccountPayableSlice: AccountPayableSlice,
    CustomerReceivableSlice: CustomerReceivableSlice,
    PricingSlice:PricingSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // penting untuk redux-persist
    }),
});

export const persistor = persistStore(store);

// export const store = configureStore({
//   reducer: {
//     darkMode: darkModeReducer,
//     colorScheme: colorSchemeReducer,
//     menu: menuReducer,
//     theme: themeReducer,
//     AdminSlice: AdminSlice,
//   },
// });

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
