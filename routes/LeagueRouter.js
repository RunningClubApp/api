const LeagueController = require('../Controllers/LeagueController')
const express = require('express')

const fetch = require('node-fetch')

const taskCFG = require('../task.config')

const OIDValidator = require('../type-validators/ObjectIdValidator')
const StrValidator = require('../type-validators/StringValidator')
const LLValidator = require('../type-validators/LeagueLengthValidator')
const BoolValidator = require('../type-validators/BoolValidator')

module.exports = () => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    const leagueID = req.query.lge
    const valid = OIDValidator(leagueID)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    const fetch = await LeagueController.FetchLeague(leagueID).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { league: fetch.errors } })
    }

    // Check that the user is permitted to see it
    if (fetch.doc.creator !== req.user._id && // not creator
        fetch.doc.participants.filter((x) => { return x._id.toString() === req.user._id }).length === 0 && // not participant
        fetch.doc.invited_users.filter((x) => { return x._id.toString() === req.user._id }).length === 0 && // not invited
        fetch.doc.private === true) { // not public
      return res.status(401).json({ success: false, errors: { badauth: true } })
    }

    return res.json({ success: true, league: fetch.doc })
  })

  router.get('/foruser', async (req, res, next) => {
    const user = req.user._id
    const valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    const fetch = await LeagueController.FetchLeaguesForUser(user).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { league: fetch.errors } })
    }

    return res.json({ success: true, leagues: fetch.docs })
  })

  router.post('/', async (req, res, next) => {
    // Read and validate params
    const title = req.query.ti
    let valid = StrValidator(title, { range: [1, 16], regex: /[a-zA-Z0-9\s]*/ })
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { title: valid.errors } })
    }

    const creator = req.user._id
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
    if (!result.ok) {
      return res.status(400).json({ success: false, errors: { league: result.errors } })
    }

    // Setup job
    const url = `http://${taskCFG.url}/schedule-finish-league?lge=${result.doc._id}&ln=${length}&r=true`
    const resp = await fetch(url, { method: 'POST' }).catch(err => next(err))
    const data = await resp.json().catch(err => next(err))
    if (!data.success) {
      console.log('task creation failed')
    }

    return res.json({ success: true, league: result.doc })
  })

  router.delete('/', async (req, res, next) => {
    const leagueID = req.query.lge
    const valid = OIDValidator(leagueID)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    // Check if the league can be deleted by the logged in user
    const fetch = await LeagueController.FetchLeague(leagueID).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { league: fetch.errors } })
    }
    if (fetch.doc.creator !== req.user._id) {
      return res.status(401).json({ success: false, errors: { badauth: true } })
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

    // Check if the league can be updated by the logged in user
    const fetch = await LeagueController.FetchLeague(leagueID).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { league: fetch.errors } })
    }
    if (fetch.doc.creator !== req.user._id) {
      return res.status(401).json({ success: false, errors: { badauth: true } })
    }

    const result = await LeagueController.UpdateLeague(league).catch(err => next(err))
    if (result.ok) {
      return res.json({ success: true, league: result.doc })
    }
    return res.status(400).json({ success: false, errors: { league: result.errors } })
  })

  router.patch('/join', async (req, res, next) => {
    // Read and validate params
    const user = req.user._id
    let valid = OIDValidator(user)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { user: valid.errors } })
    }

    const league = req.query.lge
    valid = OIDValidator(league)
    if (valid.err) {
      return res.status(400).json({ success: false, errors: { league: valid.errors } })
    }

    // Join the league
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

    // Check if the logged in user is permitted to send invites
    const fetch = await LeagueController.FetchLeague(league).catch(err => next(err))
    if (!fetch.ok) {
      return res.status(400).json({ success: false, errors: { league: fetch.errors } })
    }
    if (fetch.doc.creator !== req.user._id &&
        fetch.doc.participants.indexOf(req.user._id) === -1) {
      return res.status(401).json({ success: false, errors: { badauth: true } })
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
