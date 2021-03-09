module.exports = {
    chainWebpack: config => {
      // GraphQL Loader
      config.module
        .rule('shaders')
        .test(/\.(glsl|vs|fs|vert|frag)$/)
        //.exclude(/node_modules/)
        .use('raw-loader')
          .loader('raw-loader')
          .end()
    }
  }