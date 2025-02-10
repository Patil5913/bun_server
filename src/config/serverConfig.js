export const config = {

  port: process.env.PORT || 6970,

  hostname: "0.0.0.0",

  cors: {

    allowedOrigins: "*",

    allowedMethods: "GET, POST, DELETE, OPTIONS",

    allowedHeaders: "Content-Type"

  }

};
