const ExerciseController = require('../Controllers/ExerciseController')
const express = require('express')
const PathValidator = require('../type-validators/PathValidator')
const OIDValidator = require('../type-validators/ObjectIdValidator')
const DateValidator = require('../type-validators/DateValidator')
const IntValidator = require('../type-validators/IntegerValidator')
const KudosValidator = require('../type-validators/KudosValidator')

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

  router.delete('/', async (req, res, next) => {
    const user = req.user._id
    const exercise = req.query.ex

    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }
    valid = OIDValidator(exercise)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { exercise: valid.errors } })
    }

    const fetch = await ExerciseController.FetchExercise(exercise).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { exercise: fetch.errors } })
    }

    // Check authentication
    if (fetch.doc.owner !== user) {
      return res.status(401).json({ success: false, errors: { badauth: true } })
    }

    const result = await ExerciseController.DeleteExercise(exercise).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, exercise: result.doc })
    }
    return res.status(400).json({ success: false, errors: result.errors })
  })

  router.get('/single', async (req, res, next) => {
    // const user = req.user._id
    const exercise = req.query.ex

    // let valid = OIDValidator(user)
    // if (valid.err) {
    //   return res.status(400).json({ success: false, errors: { user: valid.errors } })
    // }
    const valid = OIDValidator(exercise)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { exercise: valid.errors } })
    }

    const result = await ExerciseController.FetchExercise(exercise).catch(err => next(err))
    if (result.ok) {
      res.json({ success: true, exercise: result.doc })
    }
    res.status(400).json({ success: false, errors: { exercise: result.errors } })
  })

  router.get('/multiple', async (req, res, next) => {
    const user = req.query.usr
    let from = req.query.f
    let pageSize = req.query.ps

    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }
    valid = DateValidator(from)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { from: valid.errors } })
    }
    from = Date.parse(from)
    valid = IntValidator(pageSize)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { pageSize: valid.errors } })
    }
    pageSize = parseInt(pageSize)

    const result = await ExerciseController.FetchExerciseForUser(user, from, pageSize + 1).catch(err => next(err))
    if (result.ok) {
      let pagingTime = ''
      let docs = result.docs
      if (result.docs.length > pageSize) {
        pagingTime = docs[pageSize].timestamps.start_date
        docs = docs.splice(0, pageSize)
      }
      res.json({ success: true, exercises: docs, pagingTime })
    }
    res.status(400).json({ success: false, errors: result.errors })
  })

  router.post('/kudos', async (req, res, next) => {
    const user = req.user._id
    const exercise = req.query.ex
    const kudos = req.query.ku

    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    valid = OIDValidator(exercise)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { exercise: valid.errors } })
    }

    valid = KudosValidator(kudos)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { kudos: valid.errors } })
    }

    const result = await ExerciseController.AddKudos(user, exercise, kudos).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true })
    }
    return res.status(400).json({ success: false, errors: result.errors })
  })

  router.delete('/kudos', async (req, res, next) => {
    const user = req.user._id
    const exercise = req.query.ex

    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    valid = OIDValidator(exercise)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { exercise: valid.errors } })
    }

    const result = await ExerciseController.RemoveKudos(user, exercise).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true })
    }
    return res.status(400).json({ success: false, errors: result.errors })
  })

  router.get('/userdistance', async (req, res, next) => {
    const user = req.query.uid
    const start = req.query.s
    const end = req.query.e

    let valid = DateValidator(start)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { start: valid.errors } })
    }

    valid = DateValidator(end)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { end: valid.errors } })
    }

    valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    const result = await ExerciseController.FetchRunDistance(user, start, end).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, distance: result.distance })
    }
    return res.status(400).json({ success: false, errors: result.errors })
  })

  return router
}
