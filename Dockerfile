FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json .
COPY bun.lockb .

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 6970

# Start the server
CMD ["bun", "run", "src/server.js"]
