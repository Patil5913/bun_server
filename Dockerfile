FROM oven/bun:latest



WORKDIR /app



# Copy package.json first

COPY package.json .



# Initialize bun project and install dependencies

RUN bun install



# Copy the rest of the application

COPY .env .

COPY src/ src/



EXPOSE 6969



CMD ["bun", "run", "src/server.js"]
