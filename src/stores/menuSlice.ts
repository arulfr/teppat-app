import { createSlice, createSelector } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { type Themes } from "@/stores/themeSlice";
import { icons } from "@/components/Base/Lucide";
import { Ilogin } from "@/utils/types";
// import sideMenu from "@/main/side-menu";
import simpleMenu from "@/main/simple-menu";
import topMenu from "@/main/top-menu";

import SideMenu from "@/main/menu/SideMenu";

export interface Menu {
  icon: keyof typeof icons;
  title: string;
  badge?: number;
  slug?: string; // Tambahkan slug untuk identifikasi hak akses
  pathname?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface MenuState {
  menu: Array<Menu | "divider">;
}

const initialState: MenuState = {
  menu: [],
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {},
});

// Helper function dipindahkan ke luar agar tidak dibuat ulang setiap render
const filterMenuRecursive = (menuList: Array<Menu | "divider">, user: Ilogin): Array<Menu | "divider"> => {
  const accessList = user?.access_menu || [];
  const tipeBisnis = user?.tipe_bisnis || "umum";

  return menuList
    .filter((item) => {
      if (item === "divider") return true;
      const menu = item as Menu;

      // 1. Filter Keras berdasarkan Tipe Bisnis
      // Jika menu mengandung slug bengkel tapi tipe bisnis bukan bengkel, sembunyikan. (Termasuk menu utama 'bengkel')
      if (menu.slug?.startsWith("bengkel") && tipeBisnis !== "bengkel") {
        return false;
      }

      // 2. Filter berdasarkan RBAC (Slug Access)
      if (!menu.slug) return true;
      return accessList.includes(menu.slug) || (user?.role === 'owner' && !menu.slug.startsWith("bengkel"));
    })
    .map((item) => {
      if (item !== "divider" && item.subMenu) {
        return {
          ...item,
          subMenu: filterMenuRecursive(item.subMenu as any, user) as Menu[],
        };
      }
      return item;
    });
};

const selectLogin = (state: RootState) => state.AdminSlice.isLogin;

const sideMenuSelector = createSelector(
  [selectLogin],
  (user) => {
    return filterMenuRecursive(SideMenu, user);
  }
);

const topMenuSelector = createSelector(
  [selectLogin],
  (user) => {
    return filterMenuRecursive(topMenu, user);
  }
);

const simpleMenuSelector = createSelector(
  [selectLogin],
  (user) => {
    return filterMenuRecursive(simpleMenu, user);
  }
);

export const selectMenu = (layout: Themes["layout"]) => (state: RootState) => {
  if (layout === "top-menu") return topMenuSelector(state);
  if (layout === "simple-menu") return simpleMenuSelector(state);
  return sideMenuSelector(state);
};

export default menuSlice.reducer;
