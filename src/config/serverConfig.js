export const config = {

  port: process.env.PORT || 3000,

  hostname: "0.0.0.0",

  cors: {

    allowedOrigins: "*",

    allowedMethods: "GET, POST, DELETE, OPTIONS",

    allowedHeaders: "Content-Type"

  }

};
