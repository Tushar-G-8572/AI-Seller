import {Router} from 'express'
import { getProductsCategory,getSingleProduct } from '../controller/product.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const productRouter = Router();


productRouter.get('/category',authMiddleware,getProductsCategory);
productRouter.get('/product/:id',authMiddleware,getSingleProduct);

export default productRouter;