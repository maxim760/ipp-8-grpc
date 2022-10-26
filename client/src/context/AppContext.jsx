import React, { useContext } from "react"
import { useState } from "react";
import { ProductsServicePromiseClient } from "../proto/lists_grpc_web_pb";

const AppContext = React.createContext({})

export const AppProvider = ({ children }) => {
  const [client] = useState(() => new ProductsServicePromiseClient("http://localhost:8080", null, null));
  return (
    <AppContext.Provider value={{client}}>
      {children}
    </AppContext.Provider>
  )
}
const useAppContext = () => useContext(AppContext)
export const useClient = () => {
  const { client } = useAppContext()
  return client
}