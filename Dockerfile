# Stage 1: Build the React App
FROM node:current-alpine AS build

WORKDIR /usr/src/app

# Only copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve the app using Nginx
FROM nginx:1.21.3-alpine

# Copy the Nginx configuration file
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the previous stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
