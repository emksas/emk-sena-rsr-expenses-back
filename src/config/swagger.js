import swagger from "swagger-jsdoc";

const options = {
    definition: { 
        openapi: "3.0.0", 
        info: {
            title: "Email Information API",
            version: "1.0.0",
            descripcion: " Microservice to read the email from any email service "
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
}

const swaggerSpec = swagger(options);

export { swaggerSpec };