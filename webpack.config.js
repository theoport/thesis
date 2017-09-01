const path = require('path');

module.exports = {
	entry: {
		home: './client/js/homepage.js',
		tokenFactory: './client/js/makeToken.js',
		tokenSpace: './client/js/tokenSpace.js',
		tokenHome: './client/js/tokenHome.js',
		tokenForum: './client/js/tokenForum.js',
		thread: 	'./client/js/thread.js',
		methods: './client/js/methods.js',
		updateThread: 	'./client/js/updateThread.js',
		setAttributes: 	'./client/js/setAttributes.js',
		tokenInfo:	 	'./client/js/tokenInfo.js',
		submitBug: 	'./client/js/submitBug.js',
		submitUpdate: 	'./client/js/submitUpdate.js',
		bidForBounty: 	'./client/js/bidForBounty.js',
		startBounty: 	'./client/js/startBounty.js',
		auctionHouse: 	'./client/js/auctionHouse.js'
	},
	output: {
		path: path.resolve(__dirname, './client/build'),
		filename: '[name].bundle.js'
	},
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      },
			{
				test: /\.txt$/,
				use: 'raw-loader'
			}
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}
