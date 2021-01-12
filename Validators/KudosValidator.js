module.exports = (input) => {
  if (input === undefined) {
    return { err: true, errors: { missing: true } }
  }
  if (!['Smiley', 'Heart', 'Wow', 'Thumbs Up', '100'].includes(input)) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
