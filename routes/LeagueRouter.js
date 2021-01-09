const LeagueController = require('../Controllers/LeagueController')
const express = require('express')

const OIDValidator = require('../Validators/ObjectIdValidator')
const StrValidator = require('../Validators/StringValidator')
const LLValidator = require('../Validators/LeagueLengthValidator')

module.exports = () => {
  const router = express.Router()

  router.post('/create', async (req, res, next) => {
    // Read and validate params
    const title = req.query.ti
    let valid = StrValidator(title, { range: [1, 16], regex: /[a-zA-Z0-9]/ })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { title: valid.errors } })
    }

    const creator = req.query.usr
    valid = OIDValidator(creator)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { creator: valid.errors } })
    }

    const length = req.query.l
    valid = LLValidator(length)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { length: valid.errors } })
    }

    // Create the league
    const doc = await LeagueController.CreateLeague(title, creator, length).catch(err => next(err))
    return res.json({ success: true, league: doc })
  })

  router.patch('/join', async (req, res, next) => {
    // Read and validate params
    const user = req.query.usr
    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    const league = req.query.lge
    valid = OIDValidator(league)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    // Create the league
    const doc = await LeagueController.JoinLeague(league, user).catch(err => next(err))
    return res.json({ success: true, league: doc })
  })

  router.patch('/invite', async (req, res, next) => {
    // Read and validate params
    const user = req.query.usr
    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    const league = req.query.lge
    valid = OIDValidator(league)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    // Create the league
    const doc = await LeagueController.InviteToLeague(league, user).catch(err => next(err))
    return res.json({ success: true, league: doc })
  })

  return router
}
