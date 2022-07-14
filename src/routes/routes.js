import { Router } from "express";
import { createFakeProducts } from '../controllers/products.js';

const routerProducto = Router();

routerProducto.
    route('/productos-test')
    .get(async (req, res) => {

        const products = await createFakeProducts();
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).send({ message: "Productos no encontrado" });
        }
    })

export default routerProducto