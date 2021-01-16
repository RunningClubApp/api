/* eslint-disable */
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiExclude = require('chai-exclude')

chai.use(chaiExclude)
chai.use(chaiHttp)

const expect = chai.expect
const should = chai.should()
const app = require('../../app')
const UserController = require('../../Controllers/UserController')

let db = require('./testdata/users.data')()
function restoreDB() {
  db = require('./testdata/users.data')()
}

UserController.vars.findUsers = ((query) => {
  return new Promise((resolve, reject) => {
    const term = query.$text.$search
    const users = Object.values(db.users).filter(x => x.name === term || x.email === term)
    resolve(users)
  })
})

describe('GET /users/search', () => {
  const tests = [
    {
      name: 'It fetches users correctly',
      query: 'testington',
      want: {
        code: 200,
        body: {
          success: true,
          users: [ { name: 'testington', email: 'test@testing.test', pass_hash: 'hash$password', timestamps: { signup_at: '2000-01-01T00:00:00.000Z' }}]
        }
      }
    },
    {
      name: 'It rejects empty query',
      query: '',
      want: {
        code: 400,
        body: {
          success: false, errors: { query: { invalid: true } }
        }
      }
    }
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .get(`/users/search?q=${test.query}`)
        .set('content-type', 'application/json')
        .send(test.body)
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(test.want.code)
          expect(res.body).excludingEvery('_id').to.deep.equal(test.want.body)
          done()
        })
    })
  })
})
