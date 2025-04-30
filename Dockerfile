# Dockerfile

# ---- Builder Stage ----
# Use an official Node.js runtime as a parent image (choose a specific LTS version)
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies (including devDependencies needed for build)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# ---- Prune Dev Dependencies ----
# (Optional but recommended: create smaller final image)
FROM node:18-alpine AS pruner
WORKDIR /usr/src/app
COPY package*.json ./
# Install ONLY production dependencies
RUN npm install --omit=dev

# ---- Runner Stage ----
# Use a slim Node.js image for the final image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Get Node User
USER node

# Copy built code and production dependencies from previous stages
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY --chown=node:node --from=pruner /usr/src/app/node_modules ./node_modules
COPY --chown=node:node package*.json ./

# Copy any other necessary static assets or config files if needed
# e.g. COPY --from=builder /usr/src/app/public ./public

# Expose the port the app runs on (should match PORT env var, default 3000)
# The hosting platform often overrides this, but it's good practice
EXPOSE 3000

# Define the command to run the application (directly runs the built JS file)
CMD [ "node", "dist/index.js" ] 