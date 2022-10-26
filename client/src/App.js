import { } from "./proto/lists_pb";
import { Navigate, Route, Routes } from "react-router-dom";
import { ListsPage } from "./pages/ListsPage/ListsPage";
import { ProductsPage } from "./pages/ProductsPage/ProductsPage";
// запуск envoy.yaml
/*
// docker build -t grpcweb/envoy .
// docker run -p 8080:8080 grpcweb/envoy
*/

// генерация из proto
// protoc -I=. src/proto/lists.proto --js_out=import_style=commonjs,binary:. --grpc-web_out=import_style=commonjs,mode=grpcwebtext:.



function App() {
  return (
    <Routes>
      <Route path="/" element={<ListsPage />} />
      <Route path="/lists/:id" element={<ProductsPage />} />
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
