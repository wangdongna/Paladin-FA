FROM node:10

WORKDIR /home/dist

COPY ./dist/* /home/dist

RUN ["npm", "run", "start"]