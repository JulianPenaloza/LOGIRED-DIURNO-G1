const mysql = require("mysql2/promise");

async function diagnostico() {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("\nCONEXION MYSQL EXITOSA");

        const [datos] = await connection.query(
            "SELECT DATABASE() AS base, @@hostname AS servidor, @@port AS puerto"
        );

        console.log("\nDATOS DEL SERVIDOR:");
        console.table(datos);

        const [tablas] = await connection.query("SHOW TABLES");

        console.log("\nTABLAS ENCONTRADAS:");
        console.table(tablas);

    } catch (error) {
        console.log("\nERROR DE CONEXION:");
        console.log(error.message);
    } finally {
        if (connection) await connection.end();
    }
}

diagnostico();
