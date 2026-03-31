import { Router } from "express";
import { couponsController } from "./coupons.controller";

const couponsRouter=Router()

couponsRouter.post('',couponsController.createCoupon)
couponsRouter.post('/activation',couponsController.activateCoupon)

couponsRouter.get('/:id',couponsController.getCoupon)
couponsRouter.get('',couponsController.getCoupons)

export default couponsRouter