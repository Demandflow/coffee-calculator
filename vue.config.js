module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/coffee-calculator/'
    : '/',
  outputDir: 'dist'
} 