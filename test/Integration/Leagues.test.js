/* eslint-disable */
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiExclude = require('chai-exclude')

chai.use(chaiExclude)
chai.use(chaiHttp)

const expect = chai.expect
const should = chai.should()
const app = require('../../app')
const LeagueController = require('../../Controllers/LeagueController')

let db = require('./testdata/leagues.data')()
function restoreDB() {
  db = require('./testdata/leagues.data')()
}

LeagueController.vars.rightNow = () => { return Date.UTC(2000, 0, 1, 0, 0, 0) }
LeagueController.vars.findOneLeague = (q) => {
  return new Promise((resolve, reject) => {
    resolve(db.leagues[q._id])
  })
}

LeagueController.vars.saveLeague = (newLeague) => {
  return new Promise((resolve, reject) => {
    db.leagues[newLeague._id] = newLeague
    resolve(newLeague)
  })
}

LeagueController.vars.deleteLeagueWithQuery = (q) => {
  return new Promise((resolve, reject) => {
    resolve({})
  })
}

describe('GET /leagues', () => {
  const tests = [
    {
      name: 'Correctly fetches a test',
      id: '5ff6440d15729b5df16823e3',
      want: {
        code: 200,
        body: { success: true, league: { _id: '5ff6440d15729b5df16823e3' } }
      }
    },
    {
      name: 'Errors on invalid id',
      id: 'bad_id',
      want: {
        code: 400,
        body: { success: false, errors: { league: { invalid: true }} }
      }
    },
    {
      name: 'Cannot find id',
      id: '5ff6440d15729b5df16823e4',
      want: {
        code: 400,
        body: { success: false, errors: { league: { nonexist: true }} }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .get(`/leagues?lge=${test.id}`)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).to.deep.equal(test.want.body)
          done()
        })
    })
  })
})

describe('POST /leagues', () => {
  const tests = [
    {
      name: 'Correctly creates a league',
      params: { title: 'leaguetitle', creator: '5ff6440d15729b5df16823e3', length: 'Weekly' },
      want: {
        code: 200,
        body: {
          success: true,
          league: {
            creator: '5ff6440d15729b5df16823e3',
            history: [], invited_users: [],
            league_length: 'Weekly',
            participants: ['5ff6440d15729b5df16823e3'],
            private: true,
            timestamps: { start_date: '2000-01-01T00:00:00.000Z' },
            title: 'leaguetitle'
          }
        }
      }
    },
    {
      name: 'Rejects invalid title',
      params: { title: 'leaguetitletoolong', creator: '5ff6440d15729b5df16823e3', length: 'Weekly' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { title: { invalid: true }}
        }
      }
    },
    {
      name: 'Rejects invalid user',
      params: { title: 'title', creator: 'invalid', length: 'Weekly' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { creator: { invalid: true }}
        }
      }
    },
    {
      name: 'Rejects invalid length',
      params: { title: 'title', creator: '5ff6440d15729b5df16823e3', length: 'wrong' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { length: { invalid: true }}
        }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .post(`/leagues?ti=${test.params.title}&l=${test.params.length}&usr=${test.params.creator}`)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery('_id').to.deep.equal(test.want.body)
          done()
        })
    })
  })
})

describe('DELETE /leagues', () => {
  const tests = [
    {
      name: 'Correctly deletes a league',
      params: { league: '5ff6440d15729b5df16823e3' },
      want: {
        code: 200,
        body: {
          success: true
        }
      }
    },
    {
      name: 'Rejects invalid league',
      params: { league: 'invalid' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { league: { invalid: true } }
        }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .delete(`/leagues?lge=${test.params.league}`)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery('_id').to.deep.equal(test.want.body)
          done()
        })
    })
  })
})

describe('PATCH /leagues/invite', () => {
  const tests = [
    {
      name: 'Correctly invites a player',
      params: { league: '6ff6440d15729b5df16823e3', user: '7ff6440d15729b5df16823e3' },
      want: {
        code: 200,
        body: { success: true }
      }
    },
    {
      name: 'Cannot invite a already invited player',
      params: { league: '6ff6440d15729b5df16823e3', user: '6ff6440d15729b5df16823e3' },
      want: {
        code: 400,
        body: { success: false, errors: { league: { invited: true } } }
      }
    },
    {
      name: 'Cannot invite to non existant league',
      params: { league: '3ff6440d15729b5df16823e3', user: '6ff6440d15729b5df16823e3' },
      want: {
        code: 400,
        body: { success: false, errors: { league: { nonexist: true } } }
      }
    },
    {
      name: 'Does not accept invalid league ID',
      params: { league: 'invalid', user: '6ff6440d15729b5df16823e3' },
      want: {
        code: 400,
        body: { success: false, errors: { league: { invalid: true } } }
      }
    },
    {
      name: 'Does not accept invalid league ID',
      params: { league: '3ff6440d15729b5df16823e3', user: 'invalid' },
      want: {
        code: 400,
        body: { success: false, errors: { user: { invalid: true } } }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .patch(`/leagues/invite?lge=${test.params.league}&usr=${test.params.user}`)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery('_id').to.deep.equal(test.want.body)
          done()
        })
    })
  })
})

describe('PATCH /leagues/join', () => {
  const tests = [
    {
      name: 'Correctly joins when invited to private league',
      params: { league: '6ff6440d15729b5df16823e3', user: '6ff6440d15729b5df16823e3' },
      want: {
        code: 200,
        body: { success: true, league: { invited_users: [], participants: ['6ff6440d15729b5df16823e3'], private: true } }
      }
    },
    {
      name: 'Correctly joins when league is public',
      params: { league: '7ff6440d15729b5df16823e3', user: '6ff6440d15729b5df16823e3' },
      want: {
        code: 200,
        body: { success: true, league: { invited_users: [], participants: ['6ff6440d15729b5df16823e3'], private: false } }
      }
    },
    {
      name: 'Cannot join when not invited to private league',
      params: { league: '6ff6440d15729b5df16823e3', user: '5ff6440d15729b5df16823e3' },
      want: {
        code: 400,
        body: { success: false, errors: { league: { private: true, noinvite: true } } }
      }
    },
    {
      name: 'Cannot join when league is invalid',
      params: { league: 'invalid', user: '5ff6440d15729b5df16823e3' },
      want: {
        code: 400,
        body: { success: false, errors: { league: { invalid: true } } }
      }
    },
    {
      name: 'Cannot join when user is invalid',
      params: { league: '6ff6440d15729b5df16823e3', user: 'invalid' },
      want: {
        code: 400,
        body: { success: false, errors: { user: { invalid: true } } }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .patch(`/leagues/join?lge=${test.params.league}&usr=${test.params.user}`)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery('_id').to.deep.equal(test.want.body)
          done()
        })
    })
  })
})