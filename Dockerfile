FROM node:lts-alpine

WORKDIR /home/node

COPY . ./

RUN npm install
RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]
