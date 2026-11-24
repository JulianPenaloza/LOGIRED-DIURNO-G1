const mysql = require("mysql2/promise");

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [identidad] = await c.query(
        "SELECT USER() AS usuario_conectado, CURRENT_USER() AS cuenta_mysql"
    );

    console.table(identidad);

    const [grants] = await c.query("SHOW GRANTS");

    console.log("PERMISOS DE NODE.JS:");
    console.table(grants);

    await c.end();
})().catch(e => console.error(e.message));
