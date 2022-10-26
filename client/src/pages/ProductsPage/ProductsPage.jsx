import { Box, Button, Checkbox, CircularProgress, FormControlLabel, IconButton, Link, Paper, TextField, Typography } from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Loader } from '../../components/Loader'
import { LoadingButton } from '../../components/LoadingButton'
import { Template } from '../../components/Template'
import { useClient } from '../../context/AppContext'
import { useAsync } from '../../hooks/useAsync'
import { ListItemId, Product, ProductId, ListItemUpdate } from "../../proto/lists_pb"
import { showToast } from '../../utils/functions'
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { FormDialog } from '../../components/FormDialog'
import { ProductItem } from './ProductItem'

const initUpdatedList = {open: false, name: "", comment: ""}
const initCount = "1"
export const ProductsPage = () => {
  const { id = "" } = useParams()
  const client = useClient()
  const [autofocus, setAutofocus] = useState(true)
  const [updatedProduct, setUpdatedProduct] = useState(null)
  const [name, setName] = useState("")
  const [count, setCount] = useState(initCount)
  const [updatedListData, setUpdatedListData] = useState(initUpdatedList)
  const loadProducts = async () => {
    const listItemId = new ListItemId()
    listItemId.setId(id)
    return await client.getById(listItemId, null)
  }
  const addProduct = async () => {
    setAutofocus(true)
    const product = new Product()
    product.setName(name)
    product.setCount(count)
    product.setListid(data.id)
    product.setChecked(false)
    return await client.insertProduct(product, null)
  }
  const updateProduct = async () => {
    setAutofocus(false)
    const product = new Product()
    product.setId(updatedProduct.id)
    product.setName(updatedProduct.name)
    product.setCount(updatedProduct.count)
    product.setListid(data.id)
    product.setChecked(updatedProduct.checked)
    return await client.updateProduct(product, null)
  }
  const deleteProduct = async (id) => {
    setAutofocus(false)
    const productId = new ProductId()
    productId.setId(id)
    productId.setListid(data.id)
    return await client.removeProduct(productId, null)
  }
  const updateList = async () => {
    setAutofocus(false)
    const listItem = new ListItemUpdate()
    listItem.setId(data.id)
    listItem.setUsername(updatedListData.name)
    listItem.setComment(updatedListData.comment)
    return await client.updateList(listItem, null)
  }
  const {data, status, execute: executeGet} = useAsync(loadProducts)
  const { error: addError, status: addStatus, execute: executeAdd } = useAsync(addProduct, {immediate: false})
  const { error: updateError, status: updateStatus, execute: executeUpdate } = useAsync(updateProduct, {immediate: false})
  const { error: deleteError, status: deleteStatus, execute: executeDelete } = useAsync(deleteProduct, {immediate: false})
  const { error: updateListError, status: updateListStatus, execute: executeUpdateList } = useAsync(updateList, {immediate: false})
  const onClickAddProduct = async () => {
    if (!name.trim()) {
      return
    }
    await executeAdd()
    setName("")
    setCount(initCount)
  }
  const onCloseEditList = () => {
    setUpdatedListData(initUpdatedList)
  }
  const onUpdateList = async () => {
    if (!updatedListData.comment.trim() || !updatedListData.name.trim()) {
      showToast("Заполните поля", "warning")
      return
    }
    await executeUpdateList()
    onCloseEditList()
  }
  const onClickEdit = useCallback((product) => () => {
    setUpdatedProduct(product)
  }, [])
  const onClickOpenEditList = () => {
    setUpdatedListData({open: true, name: data.username, comment: data.comment})
  }
  useEffect(() => {
    if (addError) {
      showToast("Ошибка при добавлении", "error")
    }
  }, [addError])
  useEffect(() => {
    if (updateError) {
      showToast("Ошибка при изменении", "error")
    }
  }, [updateError])
  useEffect(() => {
    if (deleteError) {
      showToast("Ошибка при удалении", "error")
    }
  }, [deleteError])
  useEffect(() => {
    if (updateListError) {
      showToast("Ошибка при изменении списка", "error")
    }
  }, [updateListError])
  useEffect(() => {
    const load = async () => {
      if (addStatus.isSuccess || updateStatus.isSuccess || deleteStatus.isSuccess || updateListStatus.isSuccess) {
        await executeGet()
      }
    }
    load()
  }, [addStatus.isSuccess, updateStatus.isSuccess, deleteStatus.isSuccess, updateListStatus.isSuccess, executeGet])
  if (status.isError) {
    return <h2>Ошибка</h2>
  }
  if (status.isLoading) {
    return <Loader />
  }
  if (status.isSuccess) {
    return (
      <Template>
        <Link component={RouterLink} to="/" sx={{ "&:not(:hover)": { textDecoration: "none" }, fontSize: "18px"}}>Назад</Link>
        <Paper elevation={2} sx={{ position: "relative", display: "flex", flexDirection: "column", mx: "auto", alignItems: "center", maxWidth: 600, p: "8px", mt: 1 }}>
          <Box sx={{display: "flex", flexDirection: "column", alignItems: "center", px: "20px"}}>
            <Typography variant='subtitle1' sx={{ textDecoration: "underline" }}>{data.username}</Typography>
            <Typography variant='body1' sx={{mb: 1}}>{data.comment}</Typography>
            <IconButton onClick={onClickOpenEditList} sx={{position: "absolute", right: "8px", top: "8px"}} size="small"><ModeEditIcon /></IconButton>
          </Box>
          <Box sx={{width: "100%"}}>
            {data.productsList.map((item) => {
              const isEdit = updatedProduct?.id === item.id
              return (
                <ProductItem 
                  key={item.id} 
                  isEdit={isEdit} 
                  item={item} 
                  setUpdatedProduct={setUpdatedProduct} 
                  onClickEdit={onClickEdit} 
                  updatedProduct={isEdit ? updatedProduct : item} 
                  deleteLoading={isEdit ? deleteStatus.isLoading : false} 
                  updateLoading={isEdit ? updateStatus.isLoading : false} 
                  executeUpdate={executeUpdate}
                  executeDelete={executeDelete}
                />
              )
            })}
          </Box>
          <Box component="form" sx={{display: "flex", alignItems: "flex-end", mt: 1}}>
            <TextField autoFocus={autofocus} fullWidth sx={{width: "220px"}} label="Название" size="small" variant="standard" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField fullWidth sx={{width: "90px"}} label="Кол-во" size="small" variant="standard" value={count} onChange={(e) => setCount(e.target.value)} />
            <LoadingButton type="submit" variant='contained' size="small" disabled={addStatus.isLoading || !name.trim()} loading={addStatus.isLoading} onClick={onClickAddProduct}>Добавить</LoadingButton>
          </Box>
        </Paper>
        <FormDialog open={updatedListData.open} onClose={onCloseEditList} onSubmit={onUpdateList} loading={updateListStatus.isLoading} title='Изменение списка'>
          <TextField name="name" label="ФИО" fullWidth margin='dense' size="small" required onChange={(e) => setUpdatedListData((prev => ({...prev, name: e.target.value})))} value={updatedListData.name} />
          <TextField name="comment" label="Описание" fullWidth margin='dense' size="small" multiline rows={4} required onChange={(e) => setUpdatedListData((prev => ({...prev, comment: e.target.value})))} value={updatedListData.comment} />
        </FormDialog>
      </Template>
    )
  }
}