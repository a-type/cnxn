import * as React from 'react';
import { Box } from '@material-ui/core';
import { WarningTwoTone } from '@material-ui/icons';
import { withSnackbar, WithSnackbarProps } from 'notistack';

class InnerErrorBoundary extends React.Component<
  WithSnackbarProps,
  { hasError: boolean }
> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.enqueueSnackbar('An error prevented this page from loading', {
      variant: 'error',
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          width="100%"
          p={3}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <WarningTwoTone />
        </Box>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withSnackbar(InnerErrorBoundary);
