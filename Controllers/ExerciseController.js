const Exercise = require('../Database/Models/Exercise')

module.exports = {
  vars: {
    saveExercise: (exercise) => {
      return new Promise((resolve, reject) => {
        // upsert the exercise doc
        Exercise.findOneAndUpdate({ _id: exercise._id }, exercise, { upsert: true })
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(exercise)
            }
          })
      })
    },
    findSomeExercises: (query, opts) => {
      return new Promise((resolve, reject) => {
        Exercise.find(query)
          .sort({ 'timestamps.start_date': opts.sort })
          .limit(opts.limit)
          .exec((err, docs) => {
            if (err) {
              reject(err)
            } else {
              resolve(docs)
            }
          })
      })
    },
    findOneExercise: (query) => {
      return new Promise((resolve, reject) => {
        Exercise.findOne(query)
          .exec((err, doc) => {
            if (err) {
              reject(err)
            } else {
              resolve(doc)
            }
          })
      })
    },
    deleteExerciseWithQuery: (query) => {
      return new Promise((resolve, reject) => {
        Exercise.deleteOne(query)
          .exec((err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
      })
    },
    deleteManyExerciseWithQuery: (query) => {
      return new Promise((resolve, reject) => {
        Exercise.deleteMany(query)
          .exec((err, res) => {
            if (err) {
              reject(err)
            } else {
              resolve(res)
            }
          })
      })
    }
  },
  /**
   * Saves an exercise to a document in the database.
   * @param {string} user - The user ID of the exercise owner.
   * @param {[Object]} path - The path of the exercise, should take the form [{ coords: { lat: Num, lng: Num }, elevation: Num, timestamp: string }]
   * @param {Date} start - The start time of the exercise.
   * @param {Date} end - The end time of the exercise.
   * @returns {Promise} A promise resolving with { ok, doc }
   */
  RecordExercise: (user, path, start, end) => {
    return new Promise((resolve, reject) => {
      const exercise = {
        owner: user,
        path: path,
        timestamps: {
          start_date: start,
          end_date: end
        }
      }

      Exercise.testValidate(exercise)
        .then(module.exports.saveExercise)
        .then((doc) => {
          resolve({ ok: true, doc })
        })
        .catch(() => { reject(new Error('Could not validate and save exericse.')) })
    })
  },
  /**
   * Fetches a single exercise from the db, does not check auth.
   * @param {string} id - The id of the exercise to fetch
   * @returns {Promise} A promise resolving with { ok, doc?, errors? }
   * @throws {nonexist} If the exercise cannot be found
   */
  FetchExercise: (id) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneExercise({ _id: id })
        .then((doc) => {
          if (doc !== undefined) {
            resolve({ ok: true, doc })
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => reject(new Error('Error finding exercise.')))
    })
  },
  /**
   * Fetches a users exercise from the db, does not check auth.
   * @param {string} id - The id of the exercise to fetch
   * @param {Date} from - The date to fetch from
   * @param {Number} count - the number of exercises to fetch
   * @returns {Promise} A promise resolving with { ok, docs?, errors? }
   * @throws {nonexist} If no exercises can be found
   */
  FetchExerciseForUser: (userID, from, count) => {
    return new Promise((resolve, reject) => {
      const q = { owner: userID, 'timestamps.start_date': { $lte: from } }
      const opts = { limit: count, sort: -1 }
      module.exports.vars.findSomeExercises(q, opts)
        .then((docs) => {
          if (docs !== undefined) {
            resolve({ ok: true, docs })
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => reject(new Error('Error finding exercises for user.')))
    })
  },
  /**
   * Deletes an exercise from it's id
   * @param {string} id - The id of the exercise to delete
   * @returns {Promise} A promise resolving with { ok }
   */
  DeleteExercise: (id) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.deleteExerciseWithQuery({ _id: id })
        .then(() => {
          resolve({ ok: true })
        })
        .catch(() => {
          reject(new Error(`Error deleting exercise with id ${id}`))
        })
    })
  },
  /**
   * Deletes all exercises associated with a userID
   * @param {string} userID - The userID associated with all exercises to delete
   * @returns {Promise} A Promise resolving with { ok }
   */
  DeleteExercisesForUser: (userID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.deleteManyExerciseWithQuery({ owner: userID })
        .then(() => {
          resolve({ ok: true })
        })
        .reject(() => {
          reject(new Error(`Error deleting exercises with owner id ${userID}`))
        })
    })
  },
  /**
   * Adds a kudo with emoji and userID to exercise
   * @param {string} userID - The id of the user kudoing someone
   * @param {string} exerciseID - The id of the exercise to kudo
   * @param {string} emoji - The emoji to add to the exercise
   * @returns {Promise} A promise resolving with { ok, doc?, errors? }.
   * @throws {nonexist} The exercise document does not exist
   * @throws {user.alreadykudoed} The user has already added a kudo to this doc.
   */
  AddKudos: (userID, exerciseID, emoji) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneExercise({ _id: exerciseID })
        .then((doc) => {
          if (doc !== undefined) {
            // check if user has already kudoed
            const notKudoed = doc.kudos.filter(x => x.user === userID).length === 0
            if (notKudoed) {
              const kudos = {
                emoji: emoji,
                user: userID
              }
              doc.kudos.push(kudos)
              module.exports.vars.saveExercise(doc)
                .then((doc) => {
                  resolve({ ok: true, doc })
                })
                .catch(() => {
                  reject(new Error(`Error updating exercise with id ${exerciseID}`))
                })
            } else {
              resolve({ ok: false, errors: { user: { alreadykudoed: true } } })
            }
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => {
          reject(new Error(`Error find exercise with id ${exerciseID}`))
        })
    })
  },
  /**
   * Removes a kudo from a user with usedID from exercise
   * @param {string} userID - The id of the user removing a kudo
   * @param {string} exerciseID - The id of the exercise with the kudo being removed
   * @returns {Promise} A promise resolving with { ok, doc?, errors? }.
   * @throws {nonexist} The exercise document does not exist
   * @throws {user.notkudoed} The user has not added a kudo to this doc.
   */
  RemoveeKudos: (userID, exerciseID) => {
    return new Promise((resolve, reject) => {
      module.exports.vars.findOneExercise({ _id: exerciseID })
        .then((doc) => {
          if (doc !== undefined) {
            // check if user has already kudoed
            const ind = doc.kudos.findIndex(x => x.user === userID)
            if (ind !== -1) {
              doc.kudos = doc.kudos.splice(ind, 1)
              module.exports.vars.saveExercise(doc)
                .then((doc) => {
                  resolve({ ok: true, doc })
                })
                .catch(() => {
                  reject(new Error(`Error updating exercise with id ${exerciseID}`))
                })
            } else {
              resolve({ ok: false, errors: { user: { kudoed: true } } })
            }
          } else {
            resolve({ ok: false, errors: { nonexist: true } })
          }
        })
        .catch(() => {
          reject(new Error(`Error find exercise with id ${exerciseID}`))
        })
    })
  },
  FetchStats: undefined
}
