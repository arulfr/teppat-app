import {
  selectTheme,
  getTheme,
  setTheme,
  themes,
  Themes,
} from "@/stores/themeSlice";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

function Main() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const Component = getTheme(theme).component;

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const switchTheme = (theme: Themes["name"]) => {
    dispatch(setTheme(theme));
  };

  useEffect(() => {
    const themeParam = queryParams.get("theme");
    if (themeParam) {
      const selectedTheme = themes.find(
        (theme) => theme.name === themeParam
      );

      if (selectedTheme) {
        switchTheme(selectedTheme.name);
      }
    } else {
      // Aturan #8: Gunakan tema Enigma sebagai default jika tidak ada parameter theme di URL
      switchTheme("enigma");
    }
  }, []);

  return (
    <div>
      {/* <ThemeSwitcher /> */}
      <Component />
    </div>
  );
}

export default Main;
