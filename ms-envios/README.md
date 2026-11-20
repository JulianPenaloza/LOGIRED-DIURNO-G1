# ms-envios (Puerto 3003)

Microservicio de **envíos** de **LogiRed** (`envios_db`), construido con **Node.js + Express** y **MySQL**. Gestiona las guías de envío y consulta `ms-clientes` (`http://127.0.0.1:3002`) para validar `cliente_id` y componer los datos del cliente en las consultas.

## Variables de entorno (`.env`)
Copia `.env.example` a `.env` (nunca subas `.env` al repositorio):

- `PORT=3003`
- `HOST=127.0.0.1`
- `DB_HOST=172.24.0.134`
- `DB_PORT=3306`
- `DB_NAME=envios_db`
- `DB_USER=envios_user`
- `DB_PASSWORD=cambiar_por_clave_segura`
- `JWT_SECRET=cambiar_por_secreto_jwt_del_grupo`
- `JWT_EXPIRA=8h`
- `CLIENTES_URL=http://127.0.0.1:3002`

## Despliegue (Taller 3 - M3)

1. Base de datos en `servidor1` (`172.24.0.134`): ejecuta `deploy/crear-bd-envios.sql` en MySQL (ajustando la contraseña del entorno) y carga el esquema desde `servidor2` con `mysql -h 172.24.0.134 -u envios_user -p envios_db < db/schema.sql`.
2. Dependencias y `.env` en `servidor2` (`172.24.0.132`): entra a `/srv/logired/app/ms-envios`, ejecuta `npm ci --omit=dev`, copia `.env.example` a `.env` y ajusta permisos (`chmod 640 .env` y grupo `nodeapps`).
3. Servicio `systemd`: copia `deploy/ms-envios.service` a `/etc/systemd/system/`, ejecuta `sudo systemctl daemon-reload` y habilita con `sudo systemctl enable --now ms-envios`.
4. Verificación: consulta `http://127.0.0.1:3003/health` localmente y `http://app.logired.com.co/api/envios` a través del gateway.
