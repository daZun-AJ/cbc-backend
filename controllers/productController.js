import Product from "../models/product.js";
import { isAdmin } from "./userContoller.js";


export async function getProducts(req, res) {
    try {
        if (isAdmin(req)) {
            const products = await Product.find();
            res.json(products);   
        } else {
            const products = await Product.find({isAvailable : true});
            res.json(products);
        }
    } catch (err) {
        res.status(500).json({
            message : "Products not found",
            error : err
        })
    }
}

export function saveProduct(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({
            message : "You are not authorized to add a product"
        })
        return
    }    

    const product = new Product(
        req.body
    );

    product.save()
        .then(() => {
            res.json({
                message : "Product saved successfully"
            })
        }).catch(() => {
            res.status(500).json({
                message : "Product not saved successfully"
            })
        })
}


export async function deleteProduct(req, res) {
    

    if (!isAdmin(req)) {
        res.status(403).json({
            message : "You are not authorized to delete a product"
        })
        return
    }

    try {
        await Product.deleteOne({productId : req.params.productId})
        res.json({
            message : "Product deleted successfully"
        })    
    } catch (error) {
        res.status(500).json({
            message : "Product not deleted successfully",
            error : error
        })
    }

    
}