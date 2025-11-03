# Universal Next.js Deployment System Dockerfile

# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directories for templates and generated files
RUN mkdir -p templates generated

# Make scripts executable
RUN chmod +x cli.js deploy.js
RUN chmod +x templates/*.template 2>/dev/null || echo "No template files to make executable"

# Expose default port
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Default command
CMD ["node", "cli.js", "help"]