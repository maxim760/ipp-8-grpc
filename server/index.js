import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPackageDefinition, Server, status, ServerCredentials, credentials } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
// const bodyParser = require('body-parser')
// const cors = require('cors')
// const express = require("express")
const PROTO_PATH = "./lists.proto";
// const app = express()
// app.use(bodyParser.json())
// app.use(cors())
const packageDefinition = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});


const main = async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, 'db.json')
  const adapter = new JSONFile(file)
  const db = new Low(adapter)
  await db.read()
  db.data ||= { lists: [] }  
  const listsProto = loadPackageDefinition(packageDefinition);
  const server = new Server();
  server.addService(listsProto.ProductsService.service, {
    async getAll(_, callback) {
      await db.read()
      callback(null, { allLists: db.data.lists });
    },
    async getById(call, callback) {
      await db.read()
      const { id } = call.request
      const list = db.data.lists.find(item => item.id === id)
      if (list) {
        callback(null, list)
      } else {
        callback({
          code: status.NOT_FOUND,
          details: "Not found"
        })
      }
    },
    async insertProduct(call, callback) {
      const product = call.request
      await db.read()
      product.checked = false
      product.id = nanoid()
      const list = db.data.lists.find(item => item.id === product.listId)
      if (list) {
        list.products.push(product)
        await db.write()
        callback(null, product)
      } else {
        callback({
          code: status.NOT_FOUND,
          details: "Not found"
        })
      }
    },
    async insertList(call, callback) {
      await db.read()
      const list = call.request
      list.id = nanoid()
      list.products = []
      db.data.lists.push(list)
      await db.write()
      callback(null, list)
    },
    async updateProduct(call, callback) {
      await db.read()
      const product = call.request
      const list = db.data.lists.find(item => item.id === product.listId)
      if (list) {
        const findedIdx = list.products.findIndex(item => item.id === product.id)
        if (findedIdx !== -1) {
          const {id, listId, ...props} = product
          list.products[findedIdx] = {...list.products[findedIdx], ...props}
          await db.write()
        }
        callback(null, product)
      } else {
        callback({
          code: status.NOT_FOUND,
          details: "Not found"
        })
      }
    },
    async updateList(call, callback) {
      await db.read()
      const list = call.request
      const findedIdx = db.data.lists.findIndex(item => item.id === list.id)
      if (findedIdx !== -1) {
        db.data.lists[findedIdx] = { ...db.data.lists[findedIdx], username: list.username, comment: list.comment }
        await db.write()
        callback(null, db.data.lists[findedIdx])
      } else {
        callback({
          code: status.NOT_FOUND,
          details: "Not found"
        })
      }
    },
    async removeList(call, callback) {
      await db.read()
      const id = call.request.id
      db.data.lists = db.data.lists.filter(item => item.id !== id)
      await db.write()
      callback()
    },
    async removeProduct(call, callback) {
      await db.read()
      const { id, listId } = call.request
      const list = db.data.lists.find(item => item.id === listId)
      if (list) {
        list.products = list.products.filter(p => p.id !== id)
        await db.write()
      }
      callback()
    },
  });


  server.bindAsync(
    "0.0.0.0:9090",
    ServerCredentials.createInsecure(),
    (error, port) => {
      console.log("port", port)
      if (error) {
        console.log("error in start:", error.message)
      }
      console.log("Server running at http://0.0.0.0:9090");
      server.start();
    }
  );
}

main()