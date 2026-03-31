import z from "zod";
import { Request, Response } from "express";
import { couponsService } from "./coupons.service";

const createCouponSchema = z.object({
    code: z.string(),
    activations_limit: z.number().nonnegative(),
    discount: z.number(),
    expires_at: z.iso.datetime({ offset: true })
})

const getCouponSchema = z.object({
    id: z.coerce.number()
})

const activateCouponSchema = z.object({
    code: z.string(),
    email: z.string()
})

class CouponsController {
    async createCoupon(req: Request, res: Response) {
        try {
            const { code, activations_limit, discount, expires_at } = createCouponSchema.parse(req.body)

            const coupon = await couponsService.createCoupon(code, activations_limit, discount, expires_at)
            return res.json(coupon)
        } catch (e) {
            console.log(e);
            const message = e instanceof Error ? e.message : null
            if (e instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    details: e,
                    message
                })
            } else {
                return res.status(500).json({
                    error: 'Internal server error',
                    details: e,
                    message
                })
            }
        }

    }

    async getCoupon(req: Request, res: Response) {
        try {
            const { id } = getCouponSchema.parse(req.params)
            const coupon = await couponsService.getCoupon(id)
            return res.json(coupon)
        } catch (e) {
            console.log(e);
            const message = e instanceof Error ? e.message : null
            if (e instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    details: e,
                    message
                })
            } else {
                return res.status(500).json({
                    error: 'Internal server error',
                    details: e,
                    message
                })
            }
        }
    }

    async getCoupons(req: Request, res: Response) {
        try {
            const coupons = await couponsService.getCoupons()
            return res.json(coupons)
        } catch (e) {
            console.log(e);
            const message = e instanceof Error ? e.message : null
            return res.status(500).json({
                error: 'Internal server error',
                details: e,
                message
            })
        }
    }

    async activateCoupon(req: Request, res: Response) {
        try {
            const { code, email } = activateCouponSchema.parse(req.body)
            const activation = await couponsService.activateCoupon(code, email)
            return res.json(activation)
        } catch (e) {
            console.log(e);
            const message = e instanceof Error ? e.message : null
            if (e instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation error',
                    details: e,
                    message
                })
            } else {
                return res.status(500).json({
                    error: 'Internal server error',
                    details: e,
                    message
                })
            }
        }
    }
}


export const couponsController = new CouponsController()