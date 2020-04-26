import * as React from 'react';
import { useDarkMode, DarkModeProvider } from './contexts/DarkModeContext';
import {
  ThemeProvider,
  Button,
  CssBaseline,
  Box,
  CircularProgress,
} from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { darkTheme, lightTheme } from './theme/theme';
import Navigation from './components/Navigation';
import { BrowserRouter } from 'react-router-dom';

function InternalApp() {
  const { dark } = useDarkMode();

  const notistackRef = React.useRef<any>();
  const onClickDismiss = (key: any) => () => {
    notistackRef.current?.closeSnackbar(key);
  };

  return (
    <ThemeProvider theme={dark ? darkTheme : lightTheme}>
      <>
        <CssBaseline />
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          action={(key) => <Button onClick={onClickDismiss(key)}>Close</Button>}
        >
          <div className="App">
            <React.Suspense
              fallback={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  p={2}
                >
                  <CircularProgress />
                </Box>
              }
            >
              <Navigation />
            </React.Suspense>
          </div>
        </SnackbarProvider>
      </>
    </ThemeProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <DarkModeProvider>
        <InternalApp />
      </DarkModeProvider>
    </BrowserRouter>
  );
}
