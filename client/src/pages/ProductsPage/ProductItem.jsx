import { Checkbox, CircularProgress, FormControlLabel, TextField, IconButton, useMediaQuery, Tooltip } from "@mui/material"
import { Box } from "@mui/system"
import { memo } from "react"
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { showToast } from '../../utils/functions'

export const ProductItem = memo(({ isEdit, item, onClickEdit, setUpdatedProduct, updatedProduct, updateLoading, deleteLoading, executeUpdate, executeDelete }) => {
  const labelText = isEdit ? "Куплено?" : item.checked ? "Куплено" : "Не куплено" 
  const onChangeName = (e) => setUpdatedProduct((prev) => ({ ...prev, name: e.target.value }))
  const onChangeCount = (e) => setUpdatedProduct((prev) => ({ ...prev, count: e.target.value }))
  const onChangeChecked = (_, checked) => setUpdatedProduct((prev) => ({...prev, checked}))
  const onClickDeleteProduct = (deleteId) => () => {
    if (!deleteId) {
      return 
    }
    executeDelete(deleteId)
  }
  const onClickUpdateProduct = async () => {
    if (!updatedProduct || !updatedProduct.name.trim()) {
      showToast("Нет данных", "warning")
      return
    }
    await executeUpdate()
    setUpdatedProduct(null)
  }
  const smUp = useMediaQuery('(min-width:600px)')
  return (
    <Box onClick={!isEdit ? onClickEdit(item) : undefined} key={item.id} sx={{ width: "100%", mb: 2, borderRadius: "6px", border: "1px solid #ccc", alignItems: { xs: "flex-start", sm: "center" }, p: 1, flexDirection: { xs: "column", sm: "row" }, cursor: "pointer", display: "flex", minHeight: "50px", "& .icon-btn": { p: "2px"}, "&:not(:hover)": {sm: { "& .icon-btn": { opacity: 0 } } } } }>
      <TextField
        sx={{ width: { xs: "100%", sm: "220px" }, "& fieldset": isEdit ? {transition: "border 0.2s ease-in"} : { border: "none", transition: "border 0.2s ease-in" } }}
        value={isEdit ? updatedProduct.name : smUp ? item.name : `Название - ${item.name}`}
        onChange={isEdit ? onChangeName : undefined}
        size="small"
        variant="outlined"
      />
      <TextField
        sx={{ width: { xs: "100%", sm: "90px" }, ml: { xs: 0, sm: 1 }, mt: {xs: 0.5, sm: 0}, "& fieldset": isEdit ? {transition: "border 0.2s ease-in"} : { border: "none", transition: "border 0.2s ease-in" } }}
        fullWidth
        value={isEdit ? updatedProduct.count : smUp ? `(${item.count})` : `Кол-во - (${item.count})`}
        onChange={isEdit ? onChangeCount : undefined}
        size="small"
        variant="outlined"
        
      />
      <FormControlLabel
        sx={{ mx: 0, pl: { xs: isEdit ? 0 : "15px", sm: 0 } }}
        label={labelText}
        control={<Checkbox
          sx={{
            padding: "4px",
            visibility:
            isEdit ? "visible" : "hidden", display: { xs: isEdit ? "flex" : "none", sm: "flex" },
          }}
          onChange={isEdit ? onChangeChecked : undefined}
          value={isEdit ? updatedProduct.checked : false}
        />}
      />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", ml: "auto" }}>      
        {!isEdit && <Tooltip className="icon-btn" arrow title={(
          <div>
            <div>Название - {item.name}</div>
            <div>Количество - {item.count}</div>
            <div>Статус - {item.checked ? "Куплено" : "Не куплено"}</div>
          </div>
        )}>
          <IconButton size="small">
            <VisibilityIcon size="small" color="action" />
          </IconButton>
        </Tooltip>}  
        {isEdit ? (
          <>
            <IconButton 
              className='icon-btn' 
              sx={{ ml: "auto" }} 
              size="small" 
              onClick={onClickUpdateProduct} 
              disabled={!updatedProduct.name.trim() || updateLoading}
            >
              <DoneIcon color="success" fontSize="small"/>
            </IconButton>
            {updateLoading && <CircularProgress size={16} />}
          </>
          ) : (
            <IconButton className='icon-btn' sx={{ ml: "auto" }} size="small" onClick={onClickEdit(item)}><ModeEditIcon fontSize="small" /></IconButton>
          )}
        <IconButton className='icon-btn' size="small" onClick={onClickDeleteProduct(item.id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
        {deleteLoading && <CircularProgress size={16} />}
      </Box>
    </Box>
  )
})