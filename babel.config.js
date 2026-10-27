module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // ethers v6 使用 ES 类私有方法（#method），需要显式转译
    '@babel/plugin-transform-private-methods'
  ],
  overrides: [
    {
      // 强制转译 ethers v6（其源码含类私有字段/方法等较新语法）
      test: /node_modules[\\/]ethers/,
      presets: [
        ['@babel/preset-env', { targets: { browsers: '> 1%, last 2 versions, not dead' } }]
      ]
    }
  ]
}
