# Stage 1: Build the application with all dependencies
FROM node:20-slim AS builder

WORKDIR /app

# Copy only package files first for better cache usage
COPY package.json package-lock.json ./
# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application source code
COPY . .
# Build the TypeScript project (assumes `npm run build` outputs to dist/)
RUN npm run build

# Install only production dependencies for the final image
RUN npm ci --omit=dev

# Stage 2: Create a minimal production image using distroless
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

# Copy production node_modules and built application from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Set environment variable for production
ENV NODE_ENV=production

# Expose port if needed (optional, e.g., 8080)
# EXPOSE 8080

# Start the MCP server (entrypoint)
CMD ["dist/index.js"]
