import express from "express"
import { getProducts, saveProduct } from "../controllers/productController.js"

const productRouter = express.Router()

productRouter.get("/", getProducts)
productRouter.post("/", saveProduct)

export default productRouter