var League = require('../Database/Models/League')

/**
 * @module LeagueController
 */
module.exports = {
  vars: {
    saveLeague: (league) => {
      return new Promise((resolve, reject) => {
        // if the league document already exists update it
        if (league._id) {
          League.updateOne({_id: league._id}, league)
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(doc)
            }
          })
        } else { // otherwise save it
          league.save((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(doc)
            }
          })
        }
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
        .exec((err, docs) => {
          if (err) {
            reject(err)
          } else {
            resolve(docs)
          }
        })
      })
    },
    rightNow: () => { return Date.now() }
  },

  /**
   * Returns true if input is a valid LeagueLength enum
   * @param {string} input - The input string
   * @return {boolean} whether the input is a valid league_length enum
   */
  ValidateLeagueLength: input => ['Weekly','Monthly', 'Quaterly', 'Yearly'].includes(input),

  /**
   * Creates a league document in the database
   * @param {string} title - The title of this league
   * @param {string} creator - The creator of this league
   * @param {string} length - The length of this league 'Weekly', 'Monthly', 'Quarterly', 'Yearly'
   * @return {Promise} Promise resolving with the newly inserted document
   */
  CreateLeague: (title, creator, length) => {
    return new Promise((resolve, reject) => {

      let league = {
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
        .then(doc => resolve(doc))
        .catch(err => reject(err))
      })
      .catch((err) => {
        reject(err)
      })
    })
  },

  /**
   * Enters a user into a league
   * @param {string} leagueID - The league to add to
   * @param {string} userID - The user to add to the league
   * @return {Promise} Promise resolving with the updated document
   */
  JoinLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: leagueID })
      .then((doc) => {
        if (doc) {
          var index = doc.invited_users.indexOf(userID);
          // if league is public, or user has been invited
          if (!doc.private || index !== -1) {
            // Update document
            doc.participants.push(userID)
            if (index !== -1) {
              doc.invited_users.splice(index, 1);
            }

            // Save document
            module.exports.vars.saveLeague(doc)
            .then((res) => {
              resolve(doc)
            })
            .catch((err) => {
              reject(err)
            })

          } else {
            reject(new Error(`user ${userID} cannot join league ${leagueID}`))
          }
        }
      })
      .catch((err) => {
        reject(err)
      })
    })
  },

  /**
   * Adds a user to a league's invited_user list
   * @param {string} leagueID - The league to add to
   * @param {string} userID - The user to invite to the league
   * @return {Promise} Promise resolving with the updated document
   */
  InviteToLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneLeague({ _id: leagueID })
      .then((doc) => {
        if (doc) {
          var index = doc.invited_users.indexOf(userID);
          if (index === -1) {
            // Update document
            doc.invited_users.push(userID)
            // Save document
            module.exports.vars.saveLeague(doc)
            .then((res) => {
              resolve(doc)
            })
            .catch((err) => {
              console.log(err)
              reject(new Error(`Error saving league document ${leagueID}`))
            })
          } else {
            reject(new Error(`user ${userID} cannot be invited to ${leagueID}`))
          }
        }
      })
      .catch((err) => {
        reject(new Error(`Error finding league document ${leagueID}`))
      })
    })
  },

  /**
   * Removes a user from a league
   * @param {string} leagueID - The league to remove the user from
   * @param {string} userID - The user to remove from the league
   * @return {Promise} Promise resolving with the updated document
   */
  leaveLeague: (leagueID, userID) => {
    return new Promise((resolve, reject) => {
      reject(new Error('Not yet implemented'))
    })
  },

  /**
   * Deletes a league from the db
   * @param {string} leagueID - The league to remove the user from
   * @return {Promise} Promise resolving with the updated document
   */
  DeleteLeague: (leagueID) => {
    return new Promise((resolve, reject) => {
      reject(new Error('Not yet implemented'))
    })
  },

  /**
   * Updates a league in the DB
   * @param {string} newLeague - a JSON Object, which will be merged into the existing document.
   * @return {Promise} Promise resolving with the updated document
   */
  UpdateLeague: (newLeague) => {
    return new Promise((resolve, reject) => {
      reject(new Error('Not yet implemented'))
    })
  }
}