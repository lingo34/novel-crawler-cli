FROM node:lts-alpine3.18

# RUN addgroup app && adduser -S -G app app
# USER app #切換到app user

COPY . /app
WORKDIR /app
RUN ["npm", "install"]
CMD ["node", "index.js"]


