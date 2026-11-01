const { defineConfig } = require('@vue/cli-service')

const CSP = [
  "default-src 'self'",
  "script-src 'self' chrome-extension: moz-extension:",
  "style-src 'self' ",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ')

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    if (process.env.NODE_ENV !== 'production') return
    config.plugin('html').tap((args) => {
      args[0].csp = CSP
      return args
    })
  }
})
