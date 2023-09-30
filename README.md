# Project Pyrite [![Netlify Status](https://api.netlify.com/api/v1/badges/795ead1f-9c75-4f7e-bef8-a8e56af1238e/deploy-status)](https://app.netlify.com/sites/project-pyrite/deploys)
A messaging app originally made for a Software Development assessment.

## Development
### Prerequisites
- npm: [Node.js](https://nodejs.org/en/download) (Node.js runtime + npm)
- pnpm:
    - via npm
      ```
      npm install -g pnpm
      ```
    - or [installation](https://pnpm.io/installation) instructions
### Installation
Installing client-side dependencies
```
pnpm install
```
Installing server-side dependencies
```
cd ./server
npm install
```
### Running the development server
Running either server will hang the terminal in use, so make sure to open one for each. Ensure commands are being run from the root directory of the project.<br>
Starting the client server (vite)
```
pnpm run dev
```
Starting the game server (colyseus)
```
cd ./server
npm run start
```
## Building
Building for production is currently not set up. Please refer to [Development](#development).
