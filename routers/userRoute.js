import { Router } from "express";
const router = Router();
import { isAuthenticatedUser, authorieRoles } from "../middleware/auth.js";

import { registerUser, loginUser, logout, forgotPassword, resetPassword, getUserDetail, updatePassword, updateProfile, getAllUser, getSingleUser, deleteUser, updateUserRole } from "../controllers/userController.js";

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);


router.route("/logout").get(logout);


router.route("/me").get(isAuthenticatedUser, getUserDetail);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);


router.route("/admin/users").get(isAuthenticatedUser, authorieRoles("admin"), getAllUser);
router.route("/admin/user/:id").get(isAuthenticatedUser, authorieRoles("admin"), getSingleUser);
router.route("/admin/user/:id").put(isAuthenticatedUser, authorieRoles("admin"), updateUserRole);
router.route("/admin/user/:id").delete(isAuthenticatedUser, authorieRoles("admin"), deleteUser);

export default router;
