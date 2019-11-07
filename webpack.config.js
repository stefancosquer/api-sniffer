var glob = require("glob");
var nodeExternals = require('webpack-node-externals');
var LiveReloadPlugin = require('webpack-livereload-plugin');
var CopyPlugin = require('copy-webpack-plugin');
var AssetPlugin = new CopyPlugin([{ from: 'src', ignore: ['*.ts'], }]);

module.exports = function(env, argv) {
  return [
    {
      name: 'server',
      entry: {
        server: './src/server/main.ts'
      },
      module: {
        rules: [{test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/}]
      },
      resolve: {
        extensions: ['.js', '.ts']
      },
      node: {
        __dirname: false,
        __filename: false
      },
      externals: [nodeExternals()],
      target: 'node'
    },
    {
      name: 'client',
      entry: {
        client: glob.sync("./src/client/**/!(*.spec).ts")
      },
      module: {
        rules: [{test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/}]
      },
      resolve: {
        extensions: ['.js', '.ts']
      },
      plugins: argv.mode === 'development'? [new LiveReloadPlugin({appendScriptTag: argv}), AssetPlugin]:[AssetPlugin],
      target: 'web'
    }
  ]
};
