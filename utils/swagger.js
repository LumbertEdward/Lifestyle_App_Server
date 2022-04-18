const swaggerAutogen = require('swagger-autogen')();
const outPutFile = "./documentation/swagger_output.json";
const endPointsFiles = ['./routes/router.js'];

swaggerAutogen(outPutFile, endPointsFiles);