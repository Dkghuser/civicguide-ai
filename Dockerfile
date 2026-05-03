FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Build the Vite frontend
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# The port Express will run on
EXPOSE 3001

# Start the Express server
CMD ["npm", "start"]
