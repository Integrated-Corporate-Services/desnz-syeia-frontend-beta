# Dockerfile for frontend
FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

#  Copy everything now, not just /src
COPY . .

RUN npm run build

# Install serve globally to host static files
RUN npm install -g serve

#  Expose the port that Vite runs on
EXPOSE 5173

# Start serving the production build
CMD ["serve", "-s", "dist", "-l", "5173"]