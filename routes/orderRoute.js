import express from "express"
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js"

const orderRouter = express.Router()

orderRouter.get("/", getOrders)
orderRouter.post("/", createOrder)
orderRouter.put("/:orderId/:status", updateOrderStatus)

export default orderRouter