import { pool } from "#config/connection";
import { couponsCache } from "./coupons.cache";

class CouponsService {
    async createCoupon(code: string, limit: number, discount: number, expires_at: string) {
        const isoDate = new Date().toISOString()

        const queryResult = await pool.query(
            `INSERT INTO coupons (code, activations_limit, discount, expires_at, created_at)
             VALUES ($1,$2,$3,$4,$5) RETURNING *`,
            [code, limit, discount, expires_at, isoDate]
        )

        const coupon = queryResult.rows[0]

        // обновляем кэши
        couponsCache.byId.set(coupon.id, coupon)
        couponsCache.batch = null

        return coupon
    }

    async getCoupon(id: number) {
        if (couponsCache.byId.has(id)) {
            return couponsCache.byId.get(id)
        }

        const queryResult = await pool.query(
            `SELECT * FROM coupons WHERE id=$1`,
            [id]
        )

        const coupon = queryResult.rows[0]

        couponsCache.byId.set(id, coupon)

        return coupon
    }

    async getCoupons() {
        if (couponsCache.batch) {
            return couponsCache.batch
        }

        const queryResult = await pool.query(`SELECT * FROM coupons`)
        const coupons = queryResult.rows

        // кэшируем массив
        couponsCache.batch = coupons

        return coupons
    }

    async activateCoupon(code:string,email:string){
        const client=await pool.connect()

        await client.query('BEGIN')
        try {
            const couponQueryResult=await client.query(`SELECT id, activations_limit, expires_at FROM coupons WHERE code = $1 FOR UPDATE`,[code])
            if(couponQueryResult.rowCount===0){
                throw new Error('coupon not found') // НЕ ДЕЛАЮ РАЗНЫЕ КОДЫ ОШИБОК И СПЕЦИАЛЬНЫЕ КЛАССЫ ДЛЯ ЭТОГО, ЧТОБЫ НЕ УСЛОЖНЯТЬ
            }
            const coupon=couponQueryResult.rows[0]

            if(coupon.expires_at && new Date(coupon.expires_at)<new Date()){
                throw new Error('coupon expired') 
            }

            const countQueryResult=await client.query(`SELECT COUNT(*) FROM activations WHERE coupon_id = $1`,[coupon.id])
            
            const countStr=countQueryResult.rows[0].count
            const count=+countStr

            if(count >= coupon.activations_limit){
                throw new Error('coupon activation limit was reached')
            }

            const insertQueryResult=await client.query(`INSERT INTO activations (coupon_id, email) 
                VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING id`,[coupon.id,email])
            
            if (insertQueryResult.rowCount===0){
                throw new Error('coupon already activated')
            }
            await client.query('COMMIT')

            return {success:true}
        } catch (e) {
            await client.query('ROLLBACK')
            throw(e)
        }finally{
            client.release()
        }
    }
}

export const couponsService = new CouponsService()