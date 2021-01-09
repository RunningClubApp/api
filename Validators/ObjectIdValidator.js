const mongoose = require('mongoose')

module.exports = (object) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }
  if (!mongoose.Types.ObjectId.isValid(object)) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
