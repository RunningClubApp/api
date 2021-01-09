module.exports = (object, opts) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if (opts.range) {
    if (object.length < opts.range[0] || object.length > opts.range[1]) {
      return { err: true, errors: { invalid: true } }
    }
  }

  if (opts.regex) {
    if (!object.match(opts.regex)) {
      return { err: true, errors: { invalid: true } }
    }
  }

  return { err: false, errors: undefined }
}
