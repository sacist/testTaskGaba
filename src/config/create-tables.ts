// Создание таблиц

import "dotenv/config";
import { pool } from './connection';

const createTables = async () => {
    const client = await pool.connect()

    try {
        // Создание таблиц
        await client.query(`
            CREATE TABLE IF NOT EXISTS coupons (
                id SERIAL PRIMARY KEY,
                code TEXT UNIQUE NOT NULL,
                discount INT NOT NULL,
                activations_limit INT NOT NULL,
                expires_at TIMESTAMP,
                created_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS activations (
                id SERIAL PRIMARY KEY,
                coupon_id INT REFERENCES coupons(id),
                email TEXT NOT NULL
            );

            CREATE UNIQUE INDEX idx_unique_email ON activations(coupon_id,email);
            CREATE INDEX idx_coupon_activations ON activations(coupon_id)
        `)
    }
    catch(e){
        console.log(e);
    }
    finally{
        client.release()
    }
}

createTables()

