import { Router } from "express";
const router = Router();
import { isAuthenticatedUser, authorieRoles } from "../middleware/auth.js";
import { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder, deleteOrder } from "../controllers/orderController.js";

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrders);


router.route("/admin/orders").get(isAuthenticatedUser, authorieRoles("admin"), getAllOrders);
router.route("/admin/order/:id").put(isAuthenticatedUser, authorieRoles("admin"), updateOrder);
router.route("/admin/order/:id").delete(isAuthenticatedUser, authorieRoles("admin"), deleteOrder);

export default router;