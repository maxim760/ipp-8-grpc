import { Button, CircularProgress } from '@mui/material'


export const LoadingButton = ({loading, children, ...btnProps}) => {
  
  return (
    <Button {...btnProps}>
      {children}
      {loading && <CircularProgress sx={{ml: {xs: 1, sm: 2}}} color="inherit" size={16} />}
    </Button>
  )
}