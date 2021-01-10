const jwt = require('jsonwebtoken')
const fs = require('fs')

const cfg = require('../api.config').jwt

/**
 * Creates a json web token from a payload
 * @param {Object} payload - The payload to sign, should be a json object
 * @returns {Promise} A promise that resolves with the signed token
 */
module.exports.IssueToken = function (payload) {
  return new Promise((resolve, reject) => {
    const privateKey = fs.readFileSync(cfg.privateKey)
    // WHen using RS256, a private and pulic key is needed

    jwt.sign({ sub: payload, iat: Date.now() }, privateKey, cfg.options, (err, encoded) => {
      if (err) {
        reject(err)
      } else {
        const token = {
          token: encoded,
          expiresIn: cfg.options.expiresIn
        }
        resolve(token)
      }
    })
  })
}

/**
 * Verifies a token
 * @param {String} token - The json web token to decode
 * @returns {Promise} A promise resolved with the decoded payload
 */
module.exports.VerifyToken = function (token) {
  return new Promise((resolve, reject) => {
    const publicKey = fs.readFileSync(cfg.publicKey)
    jwt.verify(token, publicKey, { algorithms: [cfg.options.algorithm] }, (err, decoded) => {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}

/**
 * Verifies a token synchronously
 * @param {String} token - The json web token to decode
 * @returns {Object} The decoded payload
 */
module.exports.VerifyTokenSync = function (token) {
  const publicKey = fs.readFileSync(cfg.publicKey)
  try {
    return jwt.verify(token, publicKey, { algorithms: [cfg.options.algorithm] })
  } catch (err) {
    return undefined
  }
}
