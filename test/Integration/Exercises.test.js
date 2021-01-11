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

function utcdate(y, m, d, t1, t2, t3) {
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


describe('POST /exercises', () => {
  const tests = [
    {
      name: 'Correctly creates a new exercises record',
      params: {
        token: '1ff6440d15729b5df16823e3', 
        start: utcdate(2000, 0, 1, 0, 0, 0),
        end: utcdate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: utcdate(2000, 0, 1, 0, 0, 0) }]
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
              timestamp: utcdate(2000, 0, 1, 0, 0, 0)
            }],
            timestamps: {
              start_date: utcdate(2000, 0, 1, 0, 0, 0),
              end_date: utcdate(2000, 0, 2, 0, 0, 0)
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
        end: utcdate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: utcdate(2000, 0, 1, 0, 0, 0) }]
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
        start: utcdate(2000, 0, 1, 0, 0, 0),
        end: 'invalid date'
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: utcdate(2000, 0, 1, 0, 0, 0) }]
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
        start: utcdate(2000, 0, 1, 0, 0, 0),
        end: utcdate(2000, 0, 2, 0, 0, 0)
      },
      body: {
        path: [{ coords: { lat: 1, lng: 1 }, elevation: 25, timestamp: utcdate(2000, 0, 1, 0, 0, 0) }]
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
        start: utcdate(2000, 0, 1, 0, 0, 0),
        end: utcdate(2000, 0, 2, 0, 0, 0)
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