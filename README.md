# desnz-syeia-frontend-beta

Frontend codebase for the DESNZ-SYEIA beta project.

## run with env variables
.\run-frontend.ps1 local

## Run Without Docker

node -v
npm -v
npm install
npm audit fix
npm run dev
npm run build

# Run With Docker

docker build -t desnz-syeia-frontend-beta ./desnz-syeia-frontend-beta
docker run -p 5173:5173 desnz-syeia-frontend-beta

# URL
http://localhost:5173/syeia/



