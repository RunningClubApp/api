const League = require('../Database/Models/League')

/**
 * @module LeagueController
 */
module.exports = {
  /**
   * vars is used to access the db. It is done this way for easy stubbing during tests.
   */
  vars: {
    saveLeague: (league) => {
      return new Promise((resolve, reject) => {
        // if the league document already exists update it
        League.findOneAndUpdate({ _id: league._id }, league, { upsert: true })
        // League.updateOne({ _id: league._id }, league)
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(league)
            }
          })
      })
    },
    findSomeLeagues: (query) => {
      return new Promise((resolve, reject) => {
        League.find(query)
          .exec((err, docs) => {
            if (err) {
              reject(err)
            } else {
              resolve(docs)
            }
          })
      })
    },
    findOneLeague: (query) => {
      return new Promise((resolve, reject) => {
        League.findOne(query)
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(doc)
            }
          })
      })
    },
    deleteLeagueWithQuery: (query) => {
      return new Promise((resolve, reject) => {
        League.deleteOne(query)
          .exec((err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
      })
    },
    rightNow: () => { return Date.now() }
  },

  /**
   * Creates a league document in the database
   * @param {string} title - The title of this league
   * @param {string} creator - The creator of this league
   * @param {string} length - The length of this league 'Weekly', 'Monthly', 'Quarterly', 'Yearly'
   * @return {Promise} Promise resolving with the newly inserted document
   */
  CreateLeague: (title, creator, length) => {
    return new Promise((resolve, reject) => {
      const league = {
        title: title,
        creator: creator,
        participants: [creator],
        league_length: length,
        timestamps: {
          start_date: module.exports.vars.rightNow()
        },
        history: []
      }

      League.testValidate(league)
        .then((l) => {
          module.exports.vars.saveLeague(l)
            .then(newdoc => resolve({ ok: true, doc: newdoc }))
            .catch(() => {
              reject(new Error('Error saving league document'))
            })
        })
        .catch(() => {
          reject(new Error('Error validating league document'))
        })
    })
  },

  /**
   * Fetches a league document from the db
   * @throws {nonexist} - Returned if the document cannot be found
   * @param {string} id - The id of the league to fetch
   * @return {Promise} Promise resolving with the newly inserted document
   */
  FetchLeague: (id) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: id })
        .then((doc) => {
          if (doc !== undefined) {
            resolve({ ok: true, doc })
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => {
          reject(new Error(`Error fetching league with id: ${id}`))
        })
    })
  },

  /**
   * Enters a user into a league, provided the league is public
   * or the user has been invited.
   * @throws {private} - Returned if the document is private
   * @throws {noinvite} - Returned if the user has not been invited
   * @param {string} leagueID - The league t o add to
   * @param {string} userID - The user to add to the league
   * @return {Promise} Promise resolving with the updated document
   */
  JoinLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: leagueID })
        .then((doc) => {
          if (doc !== undefined) {
            const index = doc.invited_users.indexOf(userID)
            // if league is public, or user has been invited
            if (!doc.private || index !== -1) {
            // Update document
              doc.participants.push(userID)
              if (index !== -1) {
                doc.invited_users.splice(index, 1)
              }

              // Save document
              module.exports.vars.saveLeague(doc)
                .then((res) => {
                  resolve({ ok: true, doc })
                })
                .catch(() => {
                  reject(new Error(`Cannot save league ${leagueID}`))
                })
            } else {
              // resolve with soft error
              resolve({
                ok: false,
                errors: {
                  private: doc.private || undefined,
                  noinvite: index === -1 || undefined
                }
              })
            }
          }
        })
        .catch(() => {
          reject(new Error(`Error finding league document ${leagueID}`))
        })
    })
  },

  /**
   * Adds a user to a league's invited_user list
   * @throws {invited} - Returned if the user is already invited.
   * @throws {nonexist} - Returned if the league cannot be found.
   * @param {string} leagueID - The league to add to
   * @param {string} userID - The user to invite to the league
   * @return {Promise} Promise resolving with the updated document
   */
  InviteToLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: leagueID })
        .then((doc) => {
          if (doc !== undefined) {
            const index = doc.invited_users.indexOf(userID)
            if (index === -1) {
            // Update document
              doc.invited_users.push(userID)
              // Save document
              module.exports.vars.saveLeague(doc)
                .then((newdoc, res) => {
                  resolve({ ok: true, doc: newdoc })
                })
                .catch(() => {
                  reject(new Error(`Error saving league document ${leagueID}`))
                })
            } else {
              resolve({ ok: false, errors: { invited: true } })
            }
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => {
          reject(new Error(`Error finding league document ${leagueID}`))
        })
    })
  },

  /**
   * Removes a user from a league
   * @throws {nonexist} Returned if the league does not exist
   * @throws {notmember} Returned if the user is not a member of the league
   * @param {string} leagueID - The league to remove the user from
   * @param {string} userID - The user to remove from the league
   * @return {Promise} Promise resolving with the updated document
   */
  LeaveLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: leagueID })
        .then((doc) => {
          if (doc !== undefined) {
            const index = doc.participants.indexOf(userID)
            if (index !== -1) {
            // Update document
              doc.participants.splice(index, 1)

              // Save document
              module.exports.vars.saveLeague(doc)
                .then((res) => {
                  resolve({ ok: true, doc })
                })
                .catch(() => {
                  reject(new Error(`Error saving league document ${leagueID}`))
                })
            }
            resolve({ ok: false, errors: { notmember: true } })
          }
          resolve({ ok: false, errors: { nonexist: true } })
        })
        .catch(() => {
          reject(new Error(`Error finding league document ${leagueID}`))
        })
    })
  },

  /**
   * Deletes a league from the db
   * @param {string} leagueID - The league to remove the user from
   * @return {Promise} Promise resolving with the updated document
   */
  DeleteLeague: (leagueID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.deleteLeagueWithQuery({ _id: leagueID })
        .then((res) => {
          resolve({ ok: true })
        })
        .catch(() => {
          reject(new Error(`Error deleting league document ${leagueID}`))
        })
    })
  },

  /**
   * Updates a league in the DB
   * @throws {nonexist} Returned if the league does not exist
   * @param {string} newLeague - a JSON Object, which will be merged into the existing document.
   * @return {Promise} Promise resolving with the updated document
   */
  UpdateLeague: (newLeague) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: newLeague._id })
        .then((doc) => {
          if (doc !== undefined) {
            for (const [k, v] of Object.entries(newLeague)) {
              if (v !== undefined) {
                doc[k] = v
              }
            }

            module.exports.vars.saveLeague(doc)
              .then(doc => resolve({ ok: true, doc }))
              .catch(() => {
                reject(new Error(`Error saving league document ${newLeague._id}`))
              })
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => {
          reject(new Error(`Error finding league with id ${newLeague._id}`))
        })
    })
  }
}
