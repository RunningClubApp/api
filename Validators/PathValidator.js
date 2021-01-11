function isNumber (value) {
  return typeof value === 'number' && isFinite(value)
}

module.exports = (object) => {
  if (object === undefined) {
    return { err: true, errors: { missing: true } }
  }

  if (!Array.isArray(object)) {
    return { err: true, errors: { invalid: true } }
  }

  for (const point of object) {
    if (!point.coords) {
      return { err: true, errors: { invalid: true } }
    }
    if (!point.coords.lat || !point.coords.lng) {
      return { err: true, errors: { invalid: true } }
    }
    if (!isNumber(point.coords.lat) || !isNumber(point.coords.lng)) {
      return { err: true, errors: { invalid: true } }
    }

    if (!point.elevation || !isNumber(point.elevation)) {
      return { err: true, errors: { invalid: true } }
    }

    if (!point.timestamp || isNaN(Date.parse(point.timestamp))) {
      return { err: true, errors: { invalid: true } }
    }
  }

  return { err: false, errors: undefined }
}
