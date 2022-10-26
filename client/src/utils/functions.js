import {toast} from "react-toastify"

export const showToast = (text, type) => {
  toast(text, {
    hideProgressBar: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
    pauseOnFocusLoss: false,
    type
  })
}