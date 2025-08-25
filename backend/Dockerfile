FROM node:20-alpine
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
  elif [ -f yarn.lock ]; then yarn; \
  else npm i; fi
COPY . .
RUN npm run build || yarn build || pnpm build
EXPOSE 3000
CMD ["node","dist/main.js"]
