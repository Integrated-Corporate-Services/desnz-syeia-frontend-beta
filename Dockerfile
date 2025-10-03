# Dockerfile for frontend
FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

#  Copy everything now, not just /src
COPY . .

RUN npm run build

#  Expose the port that Vite runs on
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev"]
