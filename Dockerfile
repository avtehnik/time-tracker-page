FROM node:14
WORKDIR /usr/src/app
RUN npm install -g nodemon
ADD . .
CMD [ "nodemon", "./app.js" ]