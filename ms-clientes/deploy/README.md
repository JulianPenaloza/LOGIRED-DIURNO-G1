# deploy/ - Taller 3 (ms-clientes)

Archivos de despliegue SIN secretos. Los `.env` reales viven solo en servidor2.

| Archivo | Va en | Ruta destino |
|---|---|---|
| crear-bd-clientes.sql | servidor1 (172.24.0.134) | se ejecuta con `sudo mysql` |
| ms-clientes.service | servidor2 (172.24.0.132) | /etc/systemd/system/ |
| app.conf | servidor2 | /etc/apache2/sites-available/ |

Activar el servicio:
    sudo systemctl daemon-reload
    sudo systemctl enable --now ms-clientes
    systemctl status ms-clientes

Activar el sitio:
    sudo a2ensite app && sudo a2enmod proxy proxy_http
    sudo apache2ctl configtest && sudo systemctl reload apache2
