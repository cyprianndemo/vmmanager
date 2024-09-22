import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Switch from '@mui/material/Switch';
import { yellow } from '@mui/material/colors';

export default function Appbar() {
  const [darkMode, setDarkMode] = useState(false);

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: yellow[500], 
      },
    },
    typography: {
      fontFamily: 'Times New Roman',
      fontWeightBold: 700,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> 
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary"> 
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
              VM MANAGEMENT SYSTEM
            </Typography>

            <IconButton
              color="inherit"
              onClick={handleThemeChange}
              aria-label="toggle dark/light mode"
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Switch checked={darkMode} onChange={handleThemeChange} />
          </Toolbar>
        </AppBar>
      </Box>
    </ThemeProvider>
  );
}
