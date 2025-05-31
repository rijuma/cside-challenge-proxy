# Use the official Deno image as the base image
FROM denoland/deno:latest AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the application files to the container
COPY . .

# Cache dependencies
RUN deno cache src/solutions/main.ts

# Build stage for production
FROM denoland/deno:latest

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app .

# Expose the port your application listens on.
EXPOSE 8000

# Command to run the application
CMD ["deno", "task", "start"]