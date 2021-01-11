const User = require('../Database/Models/User')
const cfg = require('../api.config')
const bcrypt = require('bcrypt')
const jwt = require('../bin/jwt')

/**
 * Hashes a plaintext password
 * @module AuthController
 * @param {string} plaintext - The plaintext string
 * @returns {Promise} A promise resolving with the hashed password
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

function comparePasswords (plain, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plain, hash, (err, result) => {
      if (err) {
        reject(new Error('Error comparing passwords.'))
      } else {
        resolve(result)
      }
    })
  })
}

/**
 * @module AuthController
 */
module.exports = {
  vars: {
    hashPassword: hashPassword,
    compPassword: comparePasswords,
    rightNow: Date.now,
    getToken: jwt.IssueToken,
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
          if (usr === undefined || usr === null) {
            module.exports.vars.hashPassword(plaintext)
              .then((pwd) => {
                const user = {
                  email: email,
                  name: name,
                  pass_hash: pwd,
                  timestamps: {
                    last_login: module.exports.vars.rightNow(),
                    signup_at: module.exports.vars.rightNow()
                  }
                }
                User.testValidate(user)
                  .then(module.exports.vars.saveUser)
                  .then((doc) => {
                    resolve({ ok: true, doc })
                  })
                  .catch((e) => {
                    console.log(e)
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
        .catch((e) => {
          console.log(e)
          reject(new Error('Failed to create user in the db.'))
        })
    })
  },
  /**
   * Fetches a JWT with a user id as a payload
   * @param {Object} user - The user to sign as a jwt
   * @returns {Promise} A Promise which resolves to have the jwt
   */
  GetJWToken: (user) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.getToken({ _id: user._id })
        .then(token => resolve({ ok: true, doc: token }))
        .catch(reject)
    })
  },
  LoginUser: (email, password) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneUser({ email: email })
        .then((usr) => {
          if (usr !== undefined) {
            module.exports.vars.compPassword(password, usr.pass_hash)
              .then((result) => {
                if (result === true) {
                  usr.timestamps.last_login = module.exports.vars.rightNow()
                  User.testValidate(usr)
                    .then(module.exports.vars.saveUser)
                    .then((doc) => {
                      resolve({ ok: true, doc })
                    })
                    .catch((e) => {
                      reject(new Error('Error saving users.'))
                    })
                } else {
                  resolve({ ok: false, errors: { password: { incorrect: true } } })
                }
              })
              .catch((err) => {
                console.log(err)
                reject(new Error('Error comparing passwords.'))
              })
          } else {
            resolve({ ok: false, errors: { user: { notfound: true } } })
          }
        })
        .catch(() => {
          reject(new Error('Error finding user.'))
        })
    })
  }
}
