const { expect,should } = require('chai')

var LeagueController = require('../../../Controllers/LeagueController')
var ObjectId = require('mongoose').Types.ObjectId

LeagueController.vars.saveLeague = (league) => {
  return new Promise((resolve, reject) => {
    resolve(league)
  })
}

describe('createLeague()', function() {
  let id = ObjectId()
  var tests = [
    { name: 'Insert a league',
      title: 'title', creator: id, league_length: 'Weekly',
      want: { title: 'title', creator: id, league_length: 'Weekly', participants: [id] },
      shouldReject: false,
    },
    { name: 'Rejects an invalid league',
      title: 'this title is over 16 characters long', creator: id, league_length: 'Non enum',
      want: { },
      shouldReject: true,
    },
  ]

  tests.forEach(function (test) {
    it(test.name, function (done) {
      LeagueController.createLeague(test.title, test.creator, test.league_length)
        .then((got) => {
          if (!test.shouldReject) {
            expect(got).to.include(test.want)
            done()
          } else {
            return done(new Error('createLeague() did not reject as it should'))
          }
        })
        .catch((err) => {
          if (!test.shouldReject) {
            return done(new Error(`createLeague() did not resolve as it should, rejected with error: ${err}`))
          }
          done()
        })
    })
  })

})