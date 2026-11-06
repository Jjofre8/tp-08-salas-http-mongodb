const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");

const Reserva = require("../src/modelos/reserva");

async function main() {
  try {
    await conectarBaseDatos();

    const reservas = await Reserva.find();

    console.log("\n=== LISTADO DE RESERVAS ===");

    if (reservas.length === 0) {
      console.log("No hay reservas registradas.");
    }

    reservas.forEach((reserva, indice) => {
      console.log(`\nReserva ${indice + 1}`);
      console.log("ID:", reserva._id.toString());
      console.log("Estudiante:", reserva.estudiante);
      console.log("Email:", reserva.email);
      console.log("Sala:", reserva.sala);
      console.log("Fecha:", reserva.fecha);
      console.log("Turno:", reserva.turno);
      console.log("Personas:", reserva.personas);
    });

    console.log("\nCantidad de reservas:", reservas.length);
  } catch (error) {
    process.exitCode = 1;

    console.error("No se pudieron consultar las reservas.");
    console.error("Tipo:", error.name);

    if (error.code) {
      console.error("Código:", error.code);
    }

    if (error.syscall) {
      console.error("Operación:", error.syscall);
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
