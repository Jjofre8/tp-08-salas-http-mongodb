TP 08 — Endpoints persistentes de reservas de salas
Módulo 3 — Desarrollo Back-End | UNCA
Proyecto: tp-08-salas-http-mongodb
Dominio: reservas de salas de estudio.

1. Introducción y origen
Este proyecto parte de una copia independiente del TP 07 individual: Jjofre8/tp-07-salas-mongodb. El TP 07 conservaba un sitio Express/EJS con reservas en memoria y utilizaba MongoDB Atlas a través de scripts independientes. El TP 08 integra las operaciones HTTP con MongoDB: las páginas HTML y la API JSON comparten el mismo servicio asíncrono y la misma colección.

No se copió el historial Git del TP anterior. El proyecto no carga semillas ni crea reservas al iniciar o listar. Los documentos existentes de Atlas se conservan.
2. Tecnologías

- Node.js: versión usada en el TP 07: v24.18.0; el TP 08 requiere una versión que admita --env-file (Node.js 20.6+).
- Express: ^5.1.0; Mongoose: ^9.11.4; EJS: ^3.1.10.
- express-ejs-layouts: ^2.5.1; Morgan: ^1.10.0.
- ESLint: ^9.0.0; Prettier: ^3.6.2.
- MongoDB Atlas: clúster Free/M0, base reservas_salas_u8, colección reservas.
- Módulos: CommonJS (require / module.exports).
Las versiones efectivamente instaladas se encuentran en package-lock.json.

3. Instalación y configuración
Desde una terminal en la raíz del proyecto:
npm.cmd install
Copy-Item .env.example .env
Crear o reutilizar un clúster Atlas Free/M0. En Database Access, configurar un usuario con permisos apropiados sobre la base; en Network Access, autorizar la IP pública actual. Obtener la URI real en Connect → Drivers → Node.js y guardarla solo en .env.

La plantilla pública .env.example debe contener:
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST_REAL/reservas_salas_u8?retryWrites=true&w=majority
HOST_REAL es un marcador: no funciona como dirección de conexión. Sustituir usuario, contraseña y host por los valores del clúster. Codificar los caracteres reservados de la contraseña para una URI si corresponde. Nunca publicar .env ni la cadena privada.

El proyecto conserva en src/config/base-datos.js el ajuste DNS visto en clase:
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
Este ajuste afecta las consultas DNS del proceso de Node.js; no sustituye los permisos de IP de Atlas. Si falla la conexión, comprobar host, DNS, estado del clúster, usuario y lista de IP autorizadas. El servidor espera la conexión antes de escuchar y no publica el puerto si falla el arranque.
4. Ejecución
npm.cmd start
Para reinicio automático durante el desarrollo:
npm.cmd run dev
Estos scripts cargan .env mediante node --env-file=.env. El sitio queda normalmente en <http://localhost:3000>, salvo que se configure otro PORT.

El servidor mantiene la conexión durante las peticiones y contempla cierre ordenado mediante SIGINT y SIGTERM. Los scripts de terminal, a diferencia del servidor, se desconectan al finalizar.
5. Organización por capas
tp-08-salas-http-mongodb/
├── src/
│   ├── index.js                  # Espera MongoDB; inicia y cierra el servidor
│   ├── app.js                    # Express, EJS, middleware, routers y errores
│   ├── config/
│   │   ├── entorno.js            # PORT, NODE_ENV y lectura de MONGODB_URI
│   │   └── base-datos.js         # DNS, conectar y desconectar Mongoose
│   ├── modelos/
│   │   └── reserva.js            # Esquema Mongoose
│   ├── servicios/
│   │   └── reservas.js           # Operaciones asíncronas sobre MongoDB
│   ├── controladores/
│   │   ├── reservas.js           # Respuestas HTML
│   │   └── reservas-api.js       # Respuestas JSON
│   ├── rutas/
│   │   ├── reservas.js           # Router HTML
│   │   └── reservas-api.js       # Router API
│   └── middleware/
│       ├── reservas.js           # Validación HTML/API
│       └── solicitudes.js        # ID de solicitud y duración
├── scripts/                      # Utilidades MongoDB del TP 07
├── views/                        # Plantillas EJS
├── public/                       # Recursos estáticos
├── .env.example                  # Plantilla pública, sin credenciales
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
Las rutas no ejecutan consultas directamente. Los controladores llaman al servicio, y el servicio accede al modelo. No hay un arreglo de reservas activo en paralelo ni se importa una semilla desde src/index.js.
6. Modelo de reserva
Colección: reservas. MongoDB crea _id de tipo ObjectId; las respuestas HTTP lo representan como id de texto.
Campo Tipo Regla
estudiante String Obligatorio, trim
email String Obligatorio, trim, contiene @
sala String Sala Norte, Sala Sur o Sala Multimedia
fecha String Obligatorio, trim
turno String Mañana, Tarde o Noche
personas Number Entero de 1 a 6
estado String pendiente o confirmada; default pendiente

La creación toma explícitamente los seis campos de entrada; no pasa el cuerpo completo a Mongoose. Un cliente no puede establecer estado ni _id con el POST del TP 08. El modelo conserva sus propias validaciones, además de las de entrada HTTP.

Límites deliberados: no se comprueba el formato completo del email, si la fecha existe o es futura, la superposición de horarios, cupos compartidos ni duplicados; no se exige índice único. El default estado no migra físicamente documentos antiguos que no tengan ese campo.
7. Endpoints de la API JSON
Base: <http://localhost:3000>.
Método Ruta Comportamiento
GET /api/reservas 200, arreglo de reservas (puede ser [])
GET /api/reservas/:id 200, reserva; 400 si ID mal formado; 404 si no existe
POST /api/reservas 201, reserva guardada y cabecera Location
GET /api/reservas?sala=Sala%20Norte 200, coincidencias exactas o []

Un parámetro sala repetido, vacío o de tipo inválido responde 400; no se pasa req.query directamente a MongoDB ni se aceptan operadores de consulta del cliente. No se implementan PUT, PATCH ni DELETE.
Ejemplo de POST
Método: POST
URL: <http://localhost:3000/api/reservas>
Header: Content-Type: application/json
Body → raw → JSON:
{
  "estudiante": "Ana Ejemplo",
  "email": "<ana@example.com>",
  "sala": "Sala Norte",
  "fecha": "2026-11-10",
  "turno": "Mañana",
  "personas": 2
}
Respuesta esperada: 201 Created, cuerpo con id textual, los seis campos, estado: "pendiente" y cabecera Location: /api/reservas/ID_CREADO. La ruta de Location debe responder a continuación con 200 y el mismo documento. No se debe reenviar el POST para demostrar persistencia porque crearía otra reserva.
Errores

- Cuerpo ausente, JSON mal formado o campos inválidos: 400 JSON, sin escritura.
- ID con formato inválido: 400 JSON.
- ID de formato correcto que no exista: 404 JSON.
- Endpoint API desconocido: 404 JSON.
- Error inesperado de operación: 500 JSON sin traza ni secretos.
Los campos de entrada que lleguen como arreglos, objetos o booleanos se rechazan. La validación del formulario HTML permite el texto numérico habitual del formulario para personas, siempre que represente un entero de 1 a 6.

8. Continuidad del sitio HTML
Método Ruta Resultado esperado
GET / Inicio EJS 200
GET /reservas Listado leído desde Atlas 200
GET /reservas/nueva Formulario EJS 200
GET /reservas/:id Detalle por ObjectId textual o error HTML
POST /reservas Válido: guarda en Atlas y redirige 302
POST /reservas Inválido: 400, conserva valores y muestra errores
GET /estado JSON con servicio, contador persistente y solicitudId
GET /css/estilos.css Archivo estático
GET /ruta-inexistente Página HTML 404

El layout, CSS, Morgan, identificación de solicitud y middleware de medición se conservan del trabajo anterior.
9. Guía de solicitudes en Postman
Mantener el servidor activo con npm.cmd start. Todas las solicitudes siguientes utilizan Body: none salvo el POST. Para el POST, usar raw → JSON y Content-Type: application/json.
Solicitud Configuración Respuesta esperada
Listado inicial GET /api/reservas 200 y arreglo; registrar cantidad
Crear POST /api/reservas con JSON del ejemplo 201, id, estado y Location
Recuperar creado GET a la ruta de Location 200, mismo id y datos
ID mal formado GET /api/reservas/1 400 JSON
ID inexistente GET /api/reservas/000000000000000000000000 404 JSON, si no existe
Filtro por sala GET /api/reservas?sala=Sala%20Norte 200, coincidencias exactas
Filtro sin resultados GET con sala textual sin coincidencias 200, []
Filtro repetido GET /api/reservas?sala=Sala%20Norte&sala=Sala%20Sur 400 JSON
Cuerpo vacío POST, Body: none 400 JSON
JSON mal formado POST con sintaxis incompleta 400 JSON
Campo extra POST válido con estado: "confirmada" o _id 201, pero ignora ambos campos

Para los rechazos, modificar un campo por vez: estudiante vacío; email sin @; sala inválida; turno inválido; fecha vacía; personas 0, 7, 2.5, "abc", true, arreglo y objeto. Registrar cantidad antes y después: debe permanecer igual. El POST con campos extra sí crea una nueva reserva válida y debe contarse.

Las capturas deben mostrar método, URL, código de respuesta y cuerpo; en POST, también la cabecera de respuesta Location. Usar datos ficticios y no mostrar credenciales.
10. Persistencia entre reinicios
Secuencia requerida por la consigna:

1. Consultar GET /api/reservas y registrar cantidad inicial.
2. Crear una reserva con POST; registrar id, Location y cantidad posterior.
3. Consultar el nuevo recurso por Location.
4. Detener el servidor con Ctrl+C y reiniciarlo con la misma base Atlas.
5. Consultar otra vez el mismo ID en Postman y localizarlo desde el sitio.
6. Consultar el listado dos veces, sin crear nada, y registrar que la cantidad no cambia.
7. Revisar reservas_salas_u8 → reservas en Atlas y comparar _id.
No eliminar la colección, no repetir el POST para sustituir el ensayo y no incorporar reservas automáticamente al arrancar.
Registro de resultados y evidencia
Caso Esperado Observado / evidencia
Formato y lint Sin errores Observado: npm.cmd run check completó Prettier y ESLint sin errores
Consulta HTTP de listado JSON con reservas Observado en navegador: /api/reservas devolvió un arreglo con 6 documentos
Base nueva vacía 200, [] No observado: ya existían documentos
POST válido y Location 201 + recurso Pendiente de evidencia Postman
GET del ID creado 200 + mismo recurso Pendiente de evidencia Postman
GET tras reiniciar 200 + mismo ID Pendiente de evidencia
ID inválido / inexistente 400 / 404 Pendiente de evidencia
Parámetro sala exacto / repetido 200 / 400 Pendiente de evidencia
POST inválidos 400, cantidad igual Pendiente de evidencia
POST con campos extra Ignora estado y_id Pendiente de evidencia
HTML válido / inválido 302 / 400 Pendiente de evidencia
Consulta de /estado Conteo desde Atlas Pendiente de evidencia
Dos listados consecutivos Cantidad estable Pendiente de evidencia
Atlas Data Explorer Mismo _id Pendiente de captura
URI ausente No inicia servidor Pendiente de evidencia

Nota: en la captura del listado se observaron documentos anteriores sin el campo estado visible; el valor por defecto del esquema no significa que sus registros hayan sido migrados. No se afirma haber realizado pruebas de Postman que todavía no se documentaron.
11. Calidad y seguridad
npm.cmd run format
npm.cmd run check
format aplica Prettier a src y scripts; check comprueba formato y ejecuta ESLint. El proyecto mantiene package-lock.json junto con package.json y no modifica las dependencias innecesariamente.

Excluir del repositorio: .env, node_modules/, contraseñas, URI privada, datos personales reales y capturas con secretos. Mantener la plantilla .env.example con valores ilustrativos. Esta API es un ejercicio académico: no debe publicarse en Internet sin medidas adicionales de autenticación, autorización y seguridad.
12. Comparación TP 07 vs. TP 08
Aspecto TP 07 TP 08
Sitio HTML Reservas en memoria Reservas en MongoDB Atlas
Scripts MongoDB Laboratorio separado Se conservan como utilidades
Servicio web Métodos síncronos y arreglo Métodos asíncronos con Mongoose
Identificador web Número incremental ObjectId representado como id textual
API JSON No incluida GET listado/detalle/filtro y POST
Estado de reserva Sin campo en el sitio en memoria pendiente por defecto en nuevas reservas
Arranque Sin esperar Atlas Conexión antes de escuchar
Reinicio del servidor Perdía cambios en memoria Consulta documentos persistidos
Errores Principalmente HTML HTML y JSON diferenciados

 1. Entrega
Entregar la URL pública o accesible al docente del repositorio individual tp-08-salas-http-mongodb. Incluir código fuente, vistas, recursos estáticos, scripts, package.json, package-lock.json, .env.example, .gitignore, configuración de ESLint y este README. Incorporar capturas o registros de Postman y Atlas solo si fueron efectivamente obtenidos, vinculando cada evidencia con el ensayo correspondiente.

Estado del trabajo: estructura y consulta GET observadas; queda documentar los demás resultados exigidos por la cátedra antes de afirmar que la matriz está completa.
