module.exports = (object, opts) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if ('range' in opts) {
    if (object.length < opts.range[0] || object.length > opts.range[1]) {
      return { err: true, errors: { invalid: true } }
    }
  }

  if ('regex' in opts) {
    if (object.match(opts.regex)[0] !== object) {
      return { err: true, errors: { invalid: true } }
    }
  }

  return { err: false, errors: undefined }
}
