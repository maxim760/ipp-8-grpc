import { Grid, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { Loader } from '../../components/Loader'
import { Template } from '../../components/Template'
import { useClient } from '../../context/AppContext'
import { useAsync } from '../../hooks/useAsync'
import {Empty, ListItem, ListItemId} from "../../proto/lists_pb"
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react'
import { showToast } from '../../utils/functions'
import { FormDialog } from '../../components/FormDialog'
import { Box } from '@mui/system'
import DeleteIcon from '@mui/icons-material/Delete';

const initNewList = {
  open: false,
  name: "",
  comment: ""
}

const initDeleteList = {
  open: false, 
  id: null
}

export const ListsPage = () => {
  const client = useClient()
  const [newListData, setNewListData] = useState(initNewList)
  const [deleteListData, setDeleteListData] = useState(initDeleteList)
  const loadLists = async () => {
    const empty = new Empty()
    return await client.getAll(empty, null)
  }
  const addList = async () => {
    const list = new ListItem()
    list.setUsername(newListData.name)
    list.setComment(newListData.comment)
    return await client.insertList(list, null)
  }
  const deleteList = async () => {
    const listId = new ListItemId()
    listId.setId(deleteListData.id)
    return await client.removeList(listId, null)
  }
  const {data, error, status, execute: executeGet} = useAsync(loadLists)
  const {error: addError, status: addStatus, execute: executeAdd} = useAsync(addList, {immediate: false})
  const {error: deleteError, status: deleteStatus, execute: executeDelete} = useAsync(deleteList, {immediate: false})
  const onOpenNewList = () => {
    setNewListData({open: true, name: "", comment: ""})
  }
  const onCloseNewList = () => {
    setNewListData(initNewList)
  }
  const onOpenDeleteList = (id) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteListData({open: true, id})
  }
  const onCloseDeleteList = () => {
    setDeleteListData(initDeleteList)
  }

  const onSubmitAdd = async () => {
    if (!newListData.comment.trim() || !newListData.name.trim()) {
      showToast("Заполните поля", "warning")
      return
    }
    await executeAdd()
    onCloseNewList()
  }
  const onSubmitDelete = async () => {
    if (!deleteListData.id) {
      showToast("Ошибка", "warning")
      return
    }
    await executeDelete()
    onCloseDeleteList()
  }

  useEffect(() => {
    if (addError) {
      showToast("Ошибка при добавлении", "error")
    }
  }, [addError])
  useEffect(() => {
    if (deleteError) {
      showToast("Ошибка при удалении", "error")
    }
  }, [deleteError])
  useEffect(() => {
    if (addStatus.isSuccess || deleteStatus.isSuccess) {
      executeGet()
    }
  }, [executeGet, addStatus.isSuccess, deleteStatus.isSuccess])

  if (error) {
    return <h2>Ошибка</h2>
  }
  if (status.isLoading) {
    return <Loader />
  }
  // Please type maxim760/egisz to confirm.
  return (
    <Template>
      <Grid container columnSpacing={{ xs: 1, md: 1.5, lg: 2 }} rowSpacing={{ xs: 1, sm: 1.5, md: 2 }}>
        <Grid key={"new-list"} item xs={12} sm={6} md={4} lg={3}>
          <Paper elevation={2} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: 1, height: "100%" }}>
            <Tooltip title="Добавить новый список">
              <IconButton onClick={onOpenNewList}>
                <AddIcon sx={{fontSize: "48px"}} />
              </IconButton>
            </Tooltip>
          </Paper>
        </Grid>
        {data?.alllistsList?.map((item) => (
          <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
            <Paper
              elevation={2}
              component={Link}
              to={`/lists/${item.id}`}
              sx={{
                display: "flex",
                position: "relative",
                flexDirection: "column",
                alignItems: "center",
                p: 1,
                height: "100%",
                "&:not(:hover)": {
                  "& .icon-btn": {
                    opacity: 0
                  }
                }
              }}>
              <Typography variant='subtitle1' sx={{textDecoration: "underline"}}>{item.username}</Typography>
              <Typography variant='body1' sx={{lineHeight: 1.2, alignSelf: "flex-start", mb: 1}}>{item.comment}</Typography>
              <Typography variant="subtitle2" sx={{ alignSelf: "flex-start", mt: "auto" }}>
                Кол-во: <b>{item.productsList.filter(item => item.checked).length}</b>/<b>{item.productsList?.length}</b>
              </Typography>
              <IconButton onClick={onOpenDeleteList(item.id)} sx={{position: "absolute", top: "8px", right: "8px"}} size="small" className="icon-btn"><DeleteIcon color="error" /></IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <FormDialog open={newListData.open} onClose={onCloseNewList} onSubmit={onSubmitAdd} loading={addStatus.isLoading} title='Добавления списка'>
        <TextField name="name" label="ФИО" fullWidth margin='dense' size="small" required onChange={(e) => setNewListData((prev => ({...prev, name: e.target.value})))} value={newListData.name} />
        <TextField name="comment" label="Описание" fullWidth margin='dense' size="small" multiline rows={4} required onChange={(e) => setNewListData((prev => ({...prev, comment: e.target.value})))} value={newListData.comment} />
      </FormDialog>
      <FormDialog
        open={deleteListData.open}
        onClose={onCloseDeleteList} 
        onSubmit={onSubmitDelete}
        loading={deleteStatus.isLoading}
        title='Удаление списка'
        maxWidth="xs"
        successText="Удалить"
        closeText="Отменить"
        successProps={{color: "error"}}
        closeProps={{color: "primary"}}
      >
        <Box sx={{ p: 0.5 }}>
          <Typography variant='subtitle1' sx={{fontSize: "1rem"}}>Вы уверены, что хотите удалить список? Это действие <b>не может</b> быть отменено.</Typography>
        </Box>
      </FormDialog>
    </Template>
  )
}