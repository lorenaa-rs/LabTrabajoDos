FROM node
WORKDIR /usr/src/app
COPY . . 
RUN npm install
ENV PORT=$PORT
RUN apt update
RUN apt install -y
CMD [ "node", "index.js"]