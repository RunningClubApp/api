const UserController = require('../Controllers/UserController')
const express = require('express')
const StrValidator = require('../type-validators/StringValidator')

module.exports = () => {
  const router = express.Router()

  router.get('/search', async (req, res, next) => {
    const query = req.query.q

    const valid = StrValidator(query, { range: [1, 256] })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { query: valid.errors } })
    }

    const result = await UserController.SearchForUsers(query).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, users: result.docs })
    }
    return res.status(400).json({ success: false, errors: result.errors })
  })

  return router
}
