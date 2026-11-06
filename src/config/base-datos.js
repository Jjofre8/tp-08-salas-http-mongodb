const dns = require("node:dns");
const mongoose = require("mongoose");
const { obtenerMongoUri } = require("./entorno");

// Resolutores DNS utilizados en la clase.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDatos() {
  const uri = obtenerMongoUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("Conexión a MongoDB Atlas establecida correctamente.");
}

async function desconectarBaseDatos() {
  await mongoose.disconnect();
}

module.exports = {
  conectarBaseDatos,
  desconectarBaseDatos,
};
