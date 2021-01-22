const User = require('../mongo-database/Models/User')

/**
 * @module UserController
 */
module.exports = {
  vars: {
    rightNow: Date.now,
    findOneUser: (query) => {
      return new Promise((resolve, reject) => {
        User.findOne(query, (err, user) => {
          if (err) {
            reject(err)
          } else {
            resolve(user)
          }
        })
      })
    },
    findUsers: (query) => {
      return new Promise((resolve, reject) => {
        User.find(query, (err, users) => {
          if (err) {
            reject(err)
          } else {
            resolve(users)
          }
        })
      })
    },
    saveUser: (user) => {
      return new Promise((resolve, reject) => {
        // if the user document already exists update it
        User.findOneAndUpdate({ _id: user._id }, user)
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(user)
            }
          })
      })
    }
  },
  /**
   * Performs a text search on the database, using term
   * @param {string} term - The search term used to search the db.
   * @returns {Promise} Resolves with { ok, docs }
   */
  SearchForUsers: (term) => {
    return new Promise((resolve, reject) => {
      const mongooseQuery = { $text: { $search: term } }
      module.exports.vars.findUsers(mongooseQuery)
        .then((docs) => {
          resolve({ ok: true, docs })
        })
        .catch((e) => {
          console.log(e)
          reject(new Error('Cannot find users'))
        })
    })
  }
}
