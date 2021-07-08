const CONFIG = {
  dev: { url: 'ws://localhost:4000/socket' },
  prod: { url: 'wss://echo.websocket.org' }
}

class Config {
  constructor(env) {
    console.debug(`Constructing Config: ${env}`)
    this.url = CONFIG.dev.url;

    if (env == 'prod') {
      this.url = CONFIG.prod.url
    }
  }
}

export default Config;
