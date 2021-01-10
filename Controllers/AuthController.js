const User = require('../Database/Models/User')
const cfg = require('../api.config')
const bcrypt = require('bcrypt')

/**
 * Hashes a plaintext password
 * @param {string} plaintext - The plaintext string
 * @returns {Promise} A promise resolving wit the hashed password
 */
function hashPassword (plaintext) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(cfg.password.saltRounds, (err, salt) => {
      if (err) {
        reject(err)
      } else {
        bcrypt.hash(plaintext, salt, (err, hashed) => {
          if (err) {
            reject(err)
          } else {
            resolve(hashed)
          }
        })
      }
    })
  })
}

module.exports = {
  vars: {
    hashPassword: hashPassword,
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
    saveUser: (user) => {
      return new Promise((resolve, reject) => {
        // if the user document already exists update it
        User.findOneAndUpdate({ _id: user._id }, user, { upsert: true })
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
   * Creates a user document in the database
   * @throws {exists} Returned if the email is already in use
   * @param {string} email - The user's email
   * @param {string} name - The user's display name
   * @param {string} plaintext - The plaintext string
   * @returns {Promise} A promise resolving wit the hashed password
   */
  CreateUser: (email, name, plaintext) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneUser({ email: email })
        .then((usr) => {
          if (usr === undefined) {
            module.exports.vars.hashPassword(plaintext)
              .then((pwd) => {
                const user = {
                  email: email,
                  name: name,
                  pass_hash: pwd,
                  timestamps: {
                    last_login: module.exports.vars.rightNow,
                    signup_at: module.exports.vars.rightNow
                  }
                }
                User.testValidate(user)
                  .then(module.exports.vars.saveUser)
                  .then((doc) => {
                    resolve({ ok: false, doc })
                  })
                  .catch(() => {
                    reject(new Error('Failed to validate and save user.'))
                  })
              })
              .catch(() => {
                reject(new Error('Failed to hash password.'))
              })
          } else {
            resolve({ ok: false, errors: { exists: true } })
          }
        })
        .catch(() => {
          reject(new Error('Failed to create user in the db.'))
        })
    })
  }

}
