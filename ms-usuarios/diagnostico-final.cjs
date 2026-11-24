const mysql = require("mysql2/promise");

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [server] = await c.query(`
        SELECT
            DATABASE() AS base,
            @@hostname AS servidor,
            @@server_uuid AS uuid,
            @@datadir AS directorio
    `);

    console.log("\nIDENTIDAD DEL SERVIDOR:");
    console.table(server);

    const [tables] = await c.query("SHOW TABLES");

    console.log("\nTABLAS DISPONIBLES:");
    console.table(tables);

    await c.end();
})().catch(e => console.error(e));
