const LeagueController = require('../Controllers/LeagueController')
const express = require('express')

const OIDValidator = require('../Validators/ObjectIdValidator')
const StrValidator = require('../Validators/StringValidator')
const LLValidator = require('../Validators/LeagueLengthValidator')
const BoolValidator = require('../Validators/BoolValidator')

module.exports = () => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    const leagueID = req.query.lge
    const valid = OIDValidator(leagueID)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    const result = await LeagueController.FetchLeague(leagueID).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, league: result.doc })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
  })

  router.post('/', async (req, res, next) => {
    // Read and validate params
    const title = req.query.ti
    let valid = StrValidator(title, { range: [1, 16], regex: /[a-zA-Z0-9\s]/ })
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
    const result = await LeagueController.CreateLeague(title, creator, length).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, league: result.doc })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
  })

  router.delete('/', async (req, res, next) => {
    const leagueID = req.query.lge
    const valid = OIDValidator(leagueID)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    const result = await LeagueController.DeleteLeague(leagueID).catch(err => next(err))
    if (!result.ok) {
      res.status(400)
    }
    return res.json({ success: result.ok })
  })

  router.patch('/', async (req, res, next) => {
    // Read and validate params
    const leagueID = req.query.lge
    const title = req.query.ti
    const length = req.query.l
    const priv = req.query.p

    const league = {}

    let valid = OIDValidator(leagueID)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }
    league._id = leagueID

    // Read and validate params
    if (title !== undefined) {
      valid = StrValidator(title, { range: [1, 16], regex: /[a-zA-Z0-9]/ })
      if (valid.err) {
        return res.status(400).json({ success: false, errors: { title: valid.errors } })
      }
      league.title = title
    }

    if (length !== undefined) {
      valid = LLValidator(length)
      if (valid.err) {
        return res.status(400).json({ success: false, errors: { length: valid.errors } })
      }
      league.league_length = length
    }

    if (priv !== undefined) {
      valid = BoolValidator(priv)
      if (valid.err) {
        return res.status(400).json({ success: false, errors: { private: valid.errors } })
      }
      league.private = JSON.parse(priv)
    }

    const result = await LeagueController.UpdateLeague(league).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, league: result.doc })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
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
    const result = await LeagueController.JoinLeague(league, user).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, league: result.doc })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
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

    // Invite to the league
    const result = await LeagueController.InviteToLeague(league, user).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
  })

  return router
}
