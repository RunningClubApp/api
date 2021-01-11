module.exports = {
  password: {
    saltRounds: 8
  },
  jwt: {
    options: {
      expiresIn: '31d',
      algorithm: 'RS256'
    },
    privateKey: 'auth/jwt.key',
    publicKey: 'auth/jwt.pem'
  }
}
