const cfg = require('db.config')

let url
if (process.env.NODE_ENV === 'production') {
  url = `mongodb+srv://${cfg.user}:${cfg.pwd}@${cfg.url}/${cfg.db}`
} else {
  url = `mongodb://${cfg.url}:${cfg.port}/${cfg.db}`
}

module.exports = {
  mongodb: {
    // TODO Change (or review) the url to your MongoDB:
    url: url,

    // TODO Change this to your database name:
    databaseName: cfg.db,

    options: {
      useNewUrlParser: true // removes a deprecation warning when connecting
      //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
      //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog',

  // The file extension to create migrations and search for in migration dir
  migrationFileExtension: '.js'
}
