const LeagueController = require('../Controllers/LeagueController')
const express = require('express')
const mongoose = require('mongoose')

module.exports = () => {
  const router = express.Router()

  router.post('/create', (req, res, next) => {
    // Read and validate params
    const title = req.query.ti
    if (title === undefined) {
      return res.status(400).json({ success: false, errors: { title: { missing: true } } })
    }
    if (title.length > 16 || title.length < 1) {
      return res.status(400).json({ success: false, errors: { title: { invalid: true } } })
    }
    const creator = req.query.usr
    if (creator === undefined) {
      return res.status(400).json({ success: false, errors: { creator: { missing: true } } })
    }
    if (!mongoose.Types.ObjectId.isValid(creator)) {
      return res.status(400).json({ success: false, errors: { creator: { invalid: true } } })
    }

    const length = req.query.l
    if (length === undefined) {
      return res.status(400).json({ success: false, errors: { length: { missing: true } } })
    }
    if (!LeagueController.ValidateLeagueLength(length)){
      return res.status(400).json({ success: false, errors: { length: { invalid: true } } })
    }
    
    // Create the league
    LeagueController.CreateLeague(title, creator, length)
      .then((doc) => {
        return res.json({success: true, league: doc})
      })
      .catch((err) => {
        next(err)
      })

  })

  router.patch('/join', (req, res, next) => {
    // Read and validate params
    const user = req.query.usr
    if (user === undefined) {
      return res.status(400).json({ success: false, errors: { user: { missing: true } } })
    }
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ success: false, errors: { user: { invalid: true } } })
    }

    const league = req.query.lge
    if (league === undefined) {
      return res.status(400).json({ success: false, errors: { league: { missing: true } } })
    }
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ success: false, errors: { league: { invalid: true } } })
    }

    // Create the league
    LeagueController.JoinLeague(league, user)
      .then((doc) => {
        return res.json({success: true, league: doc})
      })
      .catch((err) => {
        next(err)
      })
  })

  router.patch('/invite', (req, res, next) => {
    // Read and validate params
    const user = req.query.usr
    if (user === undefined) {
      return res.status(400).json({ success: false, errors: { user: { missing: true } } })
    }
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ success: false, errors: { user: { invalid: true } } })
    }

    const league = req.query.lge
    if (league === undefined) {
      return res.status(400).json({ success: false, errors: { league: { missing: true } } })
    }
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ success: false, errors: { league: { invalid: true } } })
    }

    // Create the league
    LeagueController.InviteToLeague(league, user)
      .then((doc) => {
        return res.json({success: true, league: doc})
      })
      .catch((err) => {
        next(err)
      })
  })

  return router
}