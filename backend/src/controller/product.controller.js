import productModel from "../models/product.model.js";
import leaderBoardModel from "../models/leader_board.model.js";


export async function getProductsCategory(req, res) {
    try {
        const { category } = req.query; // ✅ CHANGE HERE

        console.log("category:", category);
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

export async function getLeaderBoard(req, res) {
    try {

        const query = leaderBoardModel
            .find({})
            .populate('user_id', 'username email')        // pulls user_name from User model
            .populate('product_id', 'product_name product_category product_offerPrice product_image_url')
            .sort({ saving_percent: -1 })             // highest savings first
            .limit(50);

        let data = await query;


        if (!data || data.length === 0) {
            return res.status(200).json({ success: true, message: "No data found", data: [] });
        }

        // Shape the response to match what the frontend expects
        const leaderboard = data.map(entry => ({
            _id: entry._id,
            session_id: entry.session_id,
            user_name: entry.user_id?.username || 'Anonymous',
            user_avatar: entry.user_id?.avatar || null,
            product_name: entry.product_id?.product_name || 'Unknown Product',
            product_category: entry.product_id?.product_category,
            deal_price: entry.deal_price,
            saving_percent: entry.saving_percent,
            total_rounds: entry.total_rounds,
            createdAt: entry.createdAt,
        }));

        return res.status(200).json({
            success: true,
            message: "Leaderboard fetched",
            data: leaderboard,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error while fetching leaderboard" });
    }
}