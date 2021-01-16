const AuthController = require('../Controllers/AuthController')
const express = require('express')
const StrValidator = require('../Validators/StringValidator')

module.exports = () => {
  const router = express.Router()

  router.post('/', async (req, res, next) => {
    const email = req.body.email
    const name = req.body.name
    const pwd = req.body.password
    const confPwd = req.body.confirmPassword

    let valid = StrValidator(email, { range: [1, 256], regex: /[a-zA-Z0-9.]+@[a-zA-Z0-9.]+/ })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { email: valid.errors } })
    }

    valid = StrValidator(name, { range: [1, 16], regex: /[a-zA-Z0-9_\s]*/ })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { name: valid.errors } })
    }

    valid = StrValidator(pwd, { range: [8, 256] })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { password: valid.errors } })
    }

    if (confPwd !== pwd) {
      return res.status(400).json({ success: false, errors: { password: { mismatch: true } } })
    }

    const result = await AuthController.CreateUser(email, name, pwd).catch(err => next(err))
    if (!result.ok) {
      return res.status(400).json({ success: false, errors: { user: result.errors } })
    }

    const token = await AuthController.GetJWToken(result.doc).catch(err => next(err))

    return res.json({ success: true, user: result.doc, token: token.token })
  })

  router.post('/login', async (req, res, next) => {
    const email = req.body.email
    const pwd = req.body.password

    let valid = StrValidator(email, {})
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { email: valid.errors } })
    }
    valid = StrValidator(pwd, {})
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { password: valid.errors } })
    }

    const result = await AuthController.LoginUser(email, pwd).catch((e) => { console.log(e); next(e) })
    if (!result.ok) {
      return res.status(400).json({ success: false, errors: result.errors })
    }

    const token = await AuthController.GetJWToken(result.doc).catch(err => next(err))
    return res.json({ success: true, user: result.doc, token: token.token })
  })

  return router
}
