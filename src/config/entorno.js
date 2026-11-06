const puertoTexto = process.env.PORT || "3000";
const puerto = Number(puertoTexto);

if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error("PORT debe ser un número entero entre 1 y 65535.");
}

const entorno = process.env.NODE_ENV || "development";

const formatoMorgan = entorno === "production" ? "combined" : "dev";

function obtenerMongoUri() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error(
      "MONGODB_URI no está definida o no tiene un prefijo válido."
    );
  }

  return uri;
}

module.exports = {
  puerto,
  entorno,
  formatoMorgan,
  obtenerMongoUri,
};
