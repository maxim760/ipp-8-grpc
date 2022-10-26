import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { LoadingButton } from "./LoadingButton"

export const FormDialog = ({
  open,
  onClose,
  onSubmit,
  loading,
  title,
  children,
  maxWidth = "sm",
  successText = "Сохранить",
  closeText = "Закрыть",
  closeProps = {},
  successProps = {}
}) => {
  if (!open) {
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {children}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error" {...closeProps}>{closeText}</Button>
          <LoadingButton type="submit" loading={loading} variant="contained" {...successProps}>{successText}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}