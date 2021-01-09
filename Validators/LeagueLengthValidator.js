module.exports = (input) => {
  if (input === undefined) {
    return { err: true, errors: { missing: true } }
  }
  if (!['Weekly', 'Monthly', 'Quaterly', 'Yearly'].includes(input)) {
    return { err: true, errors: { invalid: true } }
  }

  return { err: false, errors: undefined }
}
