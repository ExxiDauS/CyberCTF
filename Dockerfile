FROM node:lts-alpine

# Install Docker client
RUN apk add --no-cache docker-cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Copy environment variables if the script exists
RUN npm run copy-env || echo "No copy-env script, skipping"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
