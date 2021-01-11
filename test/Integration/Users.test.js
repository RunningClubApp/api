/* eslint-disable */
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiExclude = require('chai-exclude')

chai.use(chaiExclude)
chai.use(chaiHttp)

const expect = chai.expect
const should = chai.should()
const app = require('../../app')
const AuthController = require('../../Controllers/AuthController')

let db = require('./testdata/users.data')()
function restoreDB() {
  db = require('./testdata/users.data')()
}

AuthController.vars.rightNow = () => { return Date.UTC(2000, 0, 1, 0, 0, 0) }
AuthController.vars.findOneUser = (q) => {
  return new Promise((resolve, reject) => {
    let usrs = Object.values(db.users).filter((usr) => {
      for (const [k, v] of Object.entries(q)) {
        if (usr[k] !== v) {
          return false
        }
      }
      return true
    })
    resolve(usrs[0])
  })
}

AuthController.vars.saveUser = (newUser) => {
  return new Promise((resolve, reject) => {
    db.users[newUser._id] = newUser
    resolve(newUser)
  })
}


AuthController.vars.encodeToken = (usr) => {
  return new Promise((resolve, reject) => {
    resolve(JSON.stringify({ token: 'token' }))
  })
}

AuthController.vars.decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    resolve(JSON.parse(token))
  })
}

AuthController.vars.hashPassword = (p) => {
  return new Promise((resolve, reject) => {
    resolve(`hash$${p}`)
  })
}

AuthController.vars.compPassword = (p, h) => {
  return new Promise((resolve, reject) => {
    resolve(`hash$${p}` === h)
  })
}

describe('POST /auth', () => {
  const tests = [
    {
      name: 'Correctly creates a user',
      body: { email: 'valid@testing.test', name: 'test name', password: 'password', confirmPassword: 'password' },
      want: {
        code: 200,
        body: {
          success: true,
          user: {
            name: 'test name', email: 'valid@testing.test',
            pass_hash: 'hash$password',
            counts: { golds: 0, silvers: 0, bronzes: 0 },
            timestamps: { last_login: "2000-01-01T00:00:00.000Z", signup_at: "2000-01-01T00:00:00.000Z" }
          },
          token: '{"token":"token"}'
        }
      }
    },
    {
      name: 'Rejects user with email in use',
      body: { email: 'test@testing.test', name: 'test name', password: 'password', confirmPassword: 'password' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { user: { exists: true } }
        }
      }
    },
    {
      name: 'Rejects mis matching passwords',
      body: { email: 'valid@testing.test', name: 'test name', password: 'drowssap', confirmPassword: 'password' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { password: { mismatch: true } }
        }
      }
    },
    {
      name: 'Rejects invalid password',
      body: { email: 'valid@testing.test', name: 'test name', password: 'pass', confirmPassword: 'pass' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { password: { invalid: true } }
        }
      }
    },
    {
      name: 'Rejects invalid name',
      body: { email: 'valid@testing.test', name: '!"£$%^&!"£$%^&*(', password: 'password', confirmPassword: 'password' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { name: { invalid: true } }
        }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .post(`/auth`)
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

describe('POST /auth/login', () => {
  const tests = [
    {
      name: 'Correctly logs a user',
      body: { email: 'test@testing.test', password: 'password' },
      want: {
        code: 200,
        body: {
          success: true,
          user: {
            name: 'testington', email: 'test@testing.test',
            pass_hash: 'hash$password',
            counts: { golds: 0, silvers: 0, bronzes: 0 },
            timestamps: { last_login: "2000-01-01T00:00:00.000Z", signup_at: "2000-01-01T00:00:00.000Z" }
          },
          token: '{"token":"token"}'
        }
      }
    },
    {
      name: 'Rejects incorrect password',
      body: { email: 'test@testing.test', password: 'drowssap' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { password: { incorrect: true } }
        }
      }
    },
    {
      name: 'Rejects incorrect email',
      body: { email: 'test2@testing.test', password: 'password' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { user: { notfound: true } }
        }
      }
    },
    {
      name: 'Rejects missing password',
      body: { email: 'test@testing.test' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { password: { missing: true } }
        }
      }
    },
    {
      name: 'Rejects missing email',
      body: { password: 'password' },
      want: {
        code: 400,
        body: {
          success: false,
          errors: { email: { missing: true } }
        }
      }
    },
  ]

  tests.forEach((test) => {
    it(test.name, (done) => {
      afterEach(restoreDB)
      chai
        .request(app)
        .post(`/auth/login`)
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