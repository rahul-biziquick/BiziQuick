const swaggerBase = require("./swagger/components");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: { title: "BiziQuick API", version: "1.0.0" },
  components: {
    ...(swaggerBase?.components || {}),
  },
};
