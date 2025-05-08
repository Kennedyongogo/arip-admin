import React from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useTheme } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <IconButton
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      onClick={toggleTheme}
      color="inherit"
    >
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeSwitcher;
