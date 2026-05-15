# Use the official Node image
FROM node:18-alpine

# Create the working directory inside the container
WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your source code
COPY . .

# Expose the port your Express app uses
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]