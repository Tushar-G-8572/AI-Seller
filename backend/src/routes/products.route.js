import {Router} from 'express'
import { getProductsCategory,getSingleProduct,getLeaderBoard } from '../controller/product.controller.js';
import { authMiddleware,socketAuthMiddleware } from '../middlewares/auth.middleware.js';

const productRouter = Router();


productRouter.get('/category',authMiddleware,getProductsCategory);
productRouter.get('/product/:id',authMiddleware,getSingleProduct);
productRouter.get('/leaderboard',authMiddleware,getLeaderBoard);

export default productRouter;