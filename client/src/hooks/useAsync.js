import { useCallback, useEffect, useRef, useState } from "react"

export const useAsync = (asyncFunction, { immediate = true, grpc = true } = {}) => {
  const asyncFnRef = useRef(asyncFunction)
  useEffect(() => {
    asyncFnRef.current = asyncFunction
  }, [asyncFunction])
  const [status, setStatus] = useState("idle");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const execute = useCallback((...args) => {
    setStatus("pending");
    setData(null);
    setError(null);
    return asyncFnRef.current(...args)
      .then((response) => {
        const data = grpc && !!response?.["toObject"] ? response.toObject() : response
        setData(data);
        setStatus("success");
      })
      .catch((error) => {
        console.log({error})
        setError(error);
        setStatus("error");
      });
  }, [grpc]);
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  return {
    execute,
    data,
    error,
    status: {
      status,
      isLoading: status === "pending",
      isIdle: status === "idle",
      isError: status === "error",
      isSuccess: status === "success",
    }
  };
};