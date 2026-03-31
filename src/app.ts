import express,{json} from "express";
import couponsRouter from "#modules/coupons/coupons.router";

const app=express()


app.use(json())
app.use('/coupons',couponsRouter)

export default app