FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN bun install

# Create necessary directories
RUN mkdir -p /app/src

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 6970

# Start the server
CMD ["bun", "run", "src/server.js"]
