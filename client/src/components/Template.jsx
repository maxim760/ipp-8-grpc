import {Container} from "@mui/material"
import { useEffect } from "react"

export const Template = ({ children, title = "" }) => {
  useEffect(() => {
    if (title) {
      document.title = title
    }
  }, [])
  return (
    <Container sx={{py: 2}}>{children}</Container>
  )
}