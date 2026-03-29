import productModel from "../models/product.model.js";
import sessionModel from "../models/session.model.js";
import leaderBoardModel from "../models/leader_board.model.js";


export async function getProductsCategory(req, res) {
    try {

        const { category } = req.body;
        if (!category) return res.status(400).json({ success: false, message: "Category needed for search" })
        const productList = await productModel.find({ product_category: category }) || [];
        if (productList.length === 0) {
            return res.status(400).json({ success: false, message: "No Product found for these category " })
        }
        return res.status(200).json({
            success: true,
            message: "products founds",
            products: productList
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "error while fetching product category" })
    }
}

export async function getSingleProduct(req, res) {
    try {

        const { id } = req.params;
        if (!id) return res.status(400).json({ success: false, message: "Product id needed" })

        const product = await productModel.findById({ _id: id })
        if (!product) return res.status(404).json({ success: false, message: "No Product found" })
        return res.status(200).json({
            sucess: true,
            message: "Product fetched",
            product: product
        })

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error while fetching product" })
    }
}

export async function handleChatNegotiationController(socket,{productId}) {
    try{
        const product = await productModel.findById({_id:productId});
        const userId = req.user.id;
        const  userResponce  = req.body; 

        const session = await sessionModel.create({

        })


    }catch(err){
        console.error(err);
        return res.statu(500).json({success:false,message:"Error while Chatting"})
    }
}