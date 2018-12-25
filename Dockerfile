FROM node:10

WORKDIR /home/dist

COPY . /home/dist

ENTRYPOINT ["npm", "run", "start"]