import mysql = require('mysql2/promise');
require('dotenv').config();

const connObj = {
    host: process.env.TRUTHBOT_DB_HOST,
    database: process.env.TRUTHBOT_DB_NAME,
    user: process.env.TRUTHBOT_DB_USER,
    password: process.env.TRUTHBOT_DB_PASS
};

/**
 * Queries the database
 * @param query The query sent to the database
 * @param args The optional argument(s) used withing the query
 */
export async function query(query: string, args?: any[]): Promise<any[]> {
    const conn = await mysql.createConnection(connObj);
    const result = await conn.execute(query, args);

    return result;
}