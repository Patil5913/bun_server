import { config } from "../config/serverConfig.js";



export const corsMiddleware = (req) => {

  if (req.method === "OPTIONS") {

    return new Response(null, {

      headers: {

        "Access-Control-Allow-Origin": config.cors.allowedOrigins,

        "Access-Control-Allow-Methods": config.cors.allowedMethods,

        "Access-Control-Allow-Headers": config.cors.allowedHeaders

      }

    });

  }

  return null;

};
