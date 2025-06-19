import Order from "../models/order.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function createOrder(req, res) {
    // get user info
    if (req.user == null) {
        res.status(403).json({
            message : "Unauthorized. Please login first"
        })
        return
    }

    // add user's name (in not provided)
    const orderInfo = req.body
    if (orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName
    }

    // Generate order id
    let orderId = "CBC00001"
    const lastOrder = await Order.find().sort({ date : -1 }).limit(1)
    if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId
        let lastOrderNumberString = lastOrderId.replace("CBC", "")
        let lastOrderNumber = parseInt(lastOrderNumberString)
        let newOrderNumber = lastOrderNumber + 1
        let newOrderNumberString = String(newOrderNumber).padStart(5, "0")
        orderId = "CBC" + newOrderNumberString
    }

    try {
        let total = 0
        let labeledTotal = 0
        const products = []

        for (let i = 0; i < orderInfo.products.length; i++) {
            const item = await Product.findOne({ productId : orderInfo.products[i].productId })

            if (item == null) {
                res.status(404).json({
                    message : "Product not found"
                })
                return
            }

            if (item.isAvailable == false) {
                res.status(400).json({
                    message : "Product is not available"
                })
                return
            }
            
            products[i] = {
                productInfo : {
                    productId : item.productId,
                    name : item.name,
                    altNames : item.altNames,
                    description : item.description,
                    images : item.images,
                    labeledPrice : item.labeledPrice,
                    price : item.price
                },
                quantity : orderInfo.products[i].quantity
            }
            
            total += (item.price * orderInfo.products[i].quantity)
            labeledTotal += (item.labeledPrice * orderInfo.products[i].quantity)
        }

        const order = new Order({
            orderId : orderId,
            email : req.user.email,
            name : orderInfo.name,
            phone : orderInfo.phone,
            address : orderInfo.address,
            total : 0,
            products : products,
            labeledTotal : labeledTotal,
            total : total
        })

        const createdOrder = await order.save()

        res.status(201).json({
            message : "Order created successfully",
            order : createdOrder
        })
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}




export async function getOrders(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message : "Unauthorized. Please login first"
        })
        return
    }

    try {
        if (req.user.role == "admin") {
            const orders = await Order.find()
            res.status(200).json(orders)
        } else {
            const orders = await Order.find({ email : req.user.email })
            res.status(200).json(orders)
        }
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}



export async function updateOrderStatus(req, res) {
    if (req.user == null) {
        res.status(403).json({
            message : "Unauthorized. Please login first"
        })
        return
    }
    
    if (!isAdmin(req)) {
        res.status(403).json({
            message : "Unauthorized. You are not an admin"
        })
        return
    }

    try {
        const orderId = req.params.orderId
        const status = req.params.status
        
        await Order.updateOne(
            { orderId : orderId },
            { status : status }
        )

        res.status(200).json({
            message : "Order status updated successfully"
        })

    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
        return
    }
    
}