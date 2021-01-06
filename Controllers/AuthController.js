var User = require('../Database/Models/User')

function hashPassword () {

}
module.exports.hashPassword = hashPassword

module.exports.createUser = (req, res, next) => {
  res.json({ "implemented": false })
}