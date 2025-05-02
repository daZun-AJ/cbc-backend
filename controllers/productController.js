import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


export async function getProducts(req, res) {
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export async function saveProduct(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message : "Unauthorized. Only admin can perform this action"
        })
        return
    }

    try {
        const product = new Product(req.body)

        await product.save()
        res.status(201).json({
            message : "Product saved successfully"
        })
    } catch (err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}