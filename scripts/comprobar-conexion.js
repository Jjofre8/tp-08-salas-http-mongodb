const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");

async function main() {
  try {
    await conectarBaseDatos();
    console.log("Prueba de conexión completada correctamente.");
  } catch (error) {
    process.exitCode = 1;

    console.error("No se pudo conectar a MongoDB.");
    console.error("Tipo:", error.name);

    if (error.code) {
      console.error("Código:", error.code);
    }

    if (error.syscall) {
      console.error("Operación:", error.syscall);
    }

    if (error.name === "MongoServerError") {
      console.error("Revisá las credenciales y los permisos de Atlas.");
    } else {
      console.error("Revisá la URI, DNS y acceso de red.");
    }
  } finally {
    try {
      await desconectarBaseDatos();
    } catch (error) {
      process.exitCode = 1;
      console.error("Error al cerrar la conexión:", error.name);
    }
  }
}

main();
