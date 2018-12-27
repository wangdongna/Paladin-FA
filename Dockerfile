FROM node:10

WORKDIR /home/dist

COPY . /home/dist

RUN yarn install

ENTRYPOINT ["npm", "run", "start"]