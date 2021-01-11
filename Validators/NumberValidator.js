function isNumber (value) {
  return typeof value === 'number' && isFinite(value)
}

module.exports = (object) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if (!isNumber(object)) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
