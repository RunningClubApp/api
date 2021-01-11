const ExerciseController = require('../Controllers/ExerciseController')
const express = require('express')
const PathValidator = require('../Validators/PathValidator')
const OIDValidator = require('../Validators/ObjectIdValidator')
const DateValidator = require('../Validators/DateValidator')

module.exports = () => {
  const router = express.Router()

  router.post('/', async (req, res, next) => {
    const user = req.user._id
    let start = req.query.s
    let end = req.query.e
    const path = req.body.path

    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    valid = DateValidator(start)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { start: valid.errors } })
    }
    start = Date.parse(start)

    valid = DateValidator(end)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { end: valid.errors } })
    }
    end = Date.parse(end)

    valid = PathValidator(path)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { path: valid.errors } })
    }

    const result = await ExerciseController.RecordExercise(user, path, start, end).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, exercise: result.doc })
    }
    return res.status(400).json({ success: false })
  })

  return router
}
