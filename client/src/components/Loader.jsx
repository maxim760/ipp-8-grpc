import { Box, CircularProgress } from "@mui/material"

export const Loader = () => {
  return <Box sx={{zIndex: 3001,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}
  >
    <CircularProgress />
  </Box>
}