module.exports = (object, opts) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if (!['true', 'false'].includes(object)) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
