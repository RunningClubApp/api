module.exports = (object) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if (isNaN(parseInt(object))) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
