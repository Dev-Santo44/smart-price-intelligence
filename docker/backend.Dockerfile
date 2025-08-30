FROM node:20-alpine
WORKDIR /app
COPY backend/package.json /app/package.json
RUN npm i --quiet || true
COPY backend /app
EXPOSE 8080
CMD ["npm","run","dev"]
