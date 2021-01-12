/* eslint-disable */
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiExclude = require('chai-exclude')

chai.use(chaiExclude)
chai.use(chaiHttp)

const expect = chai.expect
const should = chai.should()
const app = require('../../app')
const ExerciseController = require('../../Controllers/ExerciseController')

let db = require('./testdata/exercises.data')()
function restoreDB() {
  db = require('./testdata/exercises.data')()
}

function isodate(y, m, d, t1, t2, t3) {
  return new Date(Date.UTC(2000, 0, 1, 0, 0, 0)).toISOString()
}

ExerciseController.vars.findOneExercise = (q) => {
  return new Promise((resolve, reject) => {
    resolve(db.exercises[q._id])
  })
}

ExerciseController.vars.saveExercise = (newEx) => {
  return new Promise((resolve, reject) => {
    db.exercises[newEx._id] = newEx
    resolve(newEx)
  })
}

ExerciseController.vars.deleteExerciseWithQuery = (q) => {
  return new Promise((resolve, reject) => {
    resolve({})
  })
}

ExerciseController.vars.findSomeExercises = (query, opts) => {
  return new Promise((resolve, reject) => {
    let potential = Object.values(db.exercises).filter(x => x.owner === query.owner)
    potential = potential.sort((a, b) => { return new Date(a.timestamps.start_date) - new Date(b.timestamps.start_date) })
    resolve(potential.slice(0, opts.limit))
  })
}

describe('POST /exercise', () => {
  const tests = [
    {
      name: 'Correctly creates a new exercises record',
      params: {
        token: '1ff6440d15729b5df16823e3', 
        start: isodate(2000, 0, 1, 0, 0, 0),
        end: isodate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: isodate(2000, 0, 1, 0, 0, 0) }]
      },
      want: {
        code: 200,
        result: {
          success: true,
          exercise: {
            owner: '1ff6440d15729b5df16823e3',
            path: [{
              coords: { lat: 1, lng: 1 },
              elevation: 25,
              timestamp: isodate(2000, 0, 1, 0, 0, 0)
            }],
            timestamps: {
              start_date: isodate(2000, 0, 1, 0, 0, 0),
              end_date: isodate(2000, 0, 2, 0, 0, 0)
            },
            kudos: [],
            verified: true
          }
        }
      }
    },
    {
      name: 'Rejects record with invalid start',
      params: {
        token: '1ff6440d15729b5df16823e3', 
        start: 'not a date',
        end: isodate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: isodate(2000, 0, 1, 0, 0, 0) }]
      },
      want: {
        code: 400,
        result: { success: false, errors: { start: { invalid: true } } }
      }
    },
    {
      name: 'Rejects record with invalid end',
      params: {
        token: '1ff6440d15729b5df16823e3', 
        start: isodate(2000, 0, 1, 0, 0, 0),
        end: 'invalid date'
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: isodate(2000, 0, 1, 0, 0, 0) }]
      },
      want: {
        code: 400,
        result: { success: false, errors: { end: { invalid: true } } }
      }
    },
    {
      name: 'Rejects record with invalid user',
      params: {
        token: 'invalid', 
        start: isodate(2000, 0, 1, 0, 0, 0),
        end: isodate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: isodate(2000, 0, 1, 0, 0, 0) }]
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { invalid: true } } }
      }
    },
    ,
    {
      name: 'Rejects record with invalid path',
      params: {
        token: '1ff6440d15729b5df16823e3', 
        start: isodate(2000, 0, 1, 0, 0, 0),
        end: isodate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 'abc', lng: 1 }, elevation: 'twentyfic', timestamp: 'invalid' }]
      },
      want: {
        code: 400,
        result: { success: false, errors: { path: { invalid: true } } }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .post(`/exercise?token=${test.params.token}&s=${test.params.start}&e=${test.params.end}&eztoken=true`)
        .set('content-type', 'application/json')
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})

describe('DELETE /exercise', () => {
  const tests = [
    {
      name: 'Correctly deletes an exercise record',
      params: {
        exercise: '1ff6440d15729b5df16823e3', token: '1ff6440d15729b5df16823e3'
      },
      want: {
        code: 200,
        result: { success: true }
      }
    },
    {
      name: 'Cannot delete nonexistant record',
      params: {
        exercise: '9ff6440d15729b5df16823e3', token: '1ff6440d15729b5df16823e3'
      },
      want: {
        code: 400,
        result: { success: false, errors: { exercise: { nonexist: true } } }
      }
    },
    {
      name: 'SECURITY: Cannot delete exercise record of other user',
      params: {
        exercise: '1ff6440d15729b5df16823e3', token: '2ff6440d15729b5df16823e3'
      },
      want: {
        code: 401,
        result: { success: false, errors: { badauth: true } }
      }
    },
    {
      name: 'SECURITY: Cannot delete exercise if invalid user',
      params: {
        exercise: '1ff6440d15729b5df16823e3', token: 'invalid'
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { invalid: true } } }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .delete(`/exercise?token=${test.params.token}&ex=${test.params.exercise}&eztoken=true`)
        .set('content-type', 'application/json')
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})

describe('GET /exercise/single', () => {
  const tests = [
    {
      name: 'Correctly fetches an exercise record',
      params: {
        exercise: '1ff6440d15729b5df16823e3'
      },
      want: {
        code: 200,
        result: {
          success: true,
          exercise: {
            owner: '1ff6440d15729b5df16823e3',
            path: [{
              coords: { lat: 0, lng: 0 },
              elevation: 50,
              timestamp: isodate(2000, 0, 1, 0, 0, 0)
            }],
            timestamps: {
              start_date: isodate(2000, 0, 1, 0, 0, 0),
              end_date: isodate(2000, 0, 2, 0, 0, 0)
            },
            kudos: [],
            verified: true
          }
        }
      }
    },
    {
      name: 'Cannot fetch non-existant record',
      params: {
        exercise: '0ff6440d15729b5df16823e3'
      },
      want: {
        code: 400,
        result: { success: false, errors: { exercise: { nonexist: true } } }
      }
    },
    {
      name: 'Cannot fetch record with invalid id',
      params: {
        exercise: 'invalid'
      },
      want: {
        code: 400,
        result: { success: false, errors: { exercise: { invalid: true } } }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .get(`/exercise/single?ex=${test.params.exercise}`)
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})

describe('GET /exercise/multiple', () => {
  const tests = [
    {
      name: 'Correctly fetches range of exercise records',
      params: {
        user: '2ff6440d15729b5df16823e3', from: isodate(1999, 11, 30, 0, 0, 0), pageSize: 2
      },
      want: {
        code: 200,
        result: {
          success: true,
          exercises: [{
            owner: '2ff6440d15729b5df16823e3', path: [],
            timestamps: { start_date: isodate(2000, 0, 1, 0, 0, 0), end_date: isodate(2000, 0, 1, 0, 0, 0) },
            kudos: [], verified: true
          },
          {
            owner: '2ff6440d15729b5df16823e3', path: [],
            timestamps: { start_date: isodate(2000, 0, 2, 0, 0, 0), end_date: isodate(2000, 0, 1, 0, 0, 0) },
            kudos: [], verified: true
          }],
          pagingTime: isodate(2000, 0, 3, 0, 0, 0)
        }
      }
    },
    {
      name: 'Correctly fetches results where len < pageSize',
      params: {
        user: '2ff6440d15729b5df16823e3', from: isodate(1999, 11, 30, 0, 0, 0), pageSize: 10
      },
      want: {
        code: 200,
        result: {
          success: true,
          exercises: [{
            owner: '2ff6440d15729b5df16823e3', path: [],
            timestamps: { start_date: isodate(2000, 0, 1, 0, 0, 0), end_date: isodate(2000, 0, 1, 0, 0, 0) },
            kudos: [], verified: true
          },
          {
            owner: '2ff6440d15729b5df16823e3', path: [],
            timestamps: { start_date: isodate(2000, 0, 2, 0, 0, 0), end_date: isodate(2000, 0, 1, 0, 0, 0) },
            kudos: [], verified: true
          },
          {
            owner: '2ff6440d15729b5df16823e3', path: [],
            timestamps: { start_date: isodate(2000, 0, 3, 0, 0, 0), end_date: isodate(2000, 0, 1, 0, 0, 0) },
            kudos: [], verified: true
          }],
          pagingTime: ""
        }
      }
    },
    {
      name: 'Rejects when user invalid',
      params: {
        user: 5, from: isodate(1999, 11, 30, 0, 0, 0), pageSize: 10
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { invalid: true } } }
      }
    },
    {
      name: 'Rejects when date invalid',
      params: {
        user: '2ff6440d15729b5df16823e3', from: 'this is not a date', pageSize: 10
      },
      want: {
        code: 400,
        result: { success: false, errors: { from: { invalid: true } } }
      }
    },
    {
      name: 'Rejects when pageSize invalid',
      params: {
        user: '2ff6440d15729b5df16823e3', from: isodate(1999, 11,30, 0, 0, 0), pageSize: 'abc'
      },
      want: {
        code: 400, 
        result: { success: false, errors: { pageSize: { invalid: true } } }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .get(`/exercise/multiple?usr=${test.params.user}&f=${test.params.from}&ps=${test.params.pageSize}`)
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})

describe('POST /exercise/kudos', () => {
  const tests = [
    {
      name: 'Correctly adds a kudos',
      params: {
        token: '4ff6440d15729b5df16823e3', exercise: '3ff6440d15729b5df16823e3', kudos: 'Wow'
      },
      want: {
        code: 200,
        result: { success: true }
      }
    },
    {
      name: 'Rejects when already kudoed',
      params: {
        token: '4ff6440d15729b5df16823e3', exercise: '5ff6440d15729b5df16823e3', kudos: 'Wow'
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { alreadykudoed: true } } }
      }
    },
    {
      name: 'Rejects when token is invalid',
      params: {
        token: 'invalid', exercise: '3ff6440d15729b5df16823e3', kudos: 'Wow'
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { invalid: true } } }
      }
    },
    {
      name: 'Rejects when exercise is invalid',
      params: {
        token: '3ff6440d15729b5df16823e3', exercise: 'invalid', kudos: 'Wow'
      },
      want: {
        code: 400,
        result: { success: false, errors: { exercise: { invalid: true } } }
      }
    },
    {
      name: 'Rejects when kudos is invalid',
      params: {
        token: '3ff6440d15729b5df16823e3', exercise: '3ff6440d15729b5df16823e3', kudos: '123'
      },
      want: {
        code: 400,
        result: { success: false, errors: { kudos: { invalid: true } } }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .post(`/exercise/kudos?ex=${test.params.exercise}&ku=${test.params.kudos}&token=${test.params.token}&eztoken=true`)
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})

describe('DELETE /exercise/kudos', () => {
  const tests = [
    {
      name: 'Correctly removes a kudos',
      params: {
        token: '4ff6440d15729b5df16823e3', exercise: '5ff6440d15729b5df16823e3'
      },
      want: {
        code: 200,
        result: { success: true }
      }
    },
    {
      name: 'Rejects when user hasnt kudoed',
      params: {
        token: '4ff6440d15729b5df16823e3', exercise: '3ff6440d15729b5df16823e3'
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { notkudoed: true } } }
      }
    },
    {
      name: 'Rejects when token is invalid',
      params: {
        token: 'invalid', exercise: '3ff6440d15729b5df16823e3'
      },
      want: {
        code: 400,
        result: { success: false, errors: { user: { invalid: true } } }
      }
    },
    {
      name: 'Rejects when exercise is invalid',
      params: {
        token: '3ff6440d15729b5df16823e3', exercise: 'invalid'
      },
      want: {
        code: 400,
        result: { success: false, errors: { exercise: { invalid: true } } }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .delete(`/exercise/kudos?ex=${test.params.exercise}&token=${test.params.token}&eztoken=true`)
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery(['_id']).to.deep.equal(test.want.result)
          done()
        })
    })
  })
})