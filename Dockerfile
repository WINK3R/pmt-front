FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
RUN npx ng build --configuration=production

FROM nginx:1.27-alpine
COPY --from=build /app/dist/Front-end/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
