# reference:
# https://stackoverflow.com/questions/69983063/m1-chip-install-puppeteer-in-docker-nodejs-the-chromium-binary-is-not-availabl
# https://developers.google.com/web/tools/puppeteer/troubleshooting#setting_up_chrome_linux_sandbox
FROM node:current-alpine

# manually installing chrome
RUN apk add chromium

# skips puppeteer installing chrome and points to correct binary
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
RUN addgroup app && adduser -S -G app app
RUN chown -R app:app /app

COPY ["package.json", "package-lock.json*", "./"]

RUN ["npm", "install"]
COPY . /app

USER app

# CMD ["node", "index.js"]
CMD ["sh"]


