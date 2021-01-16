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
    if (!('coords' in point)) {
      return { err: true, errors: { invalid: true } }
    }
    if (!('lat' in point.coords) || !('lng' in point.coords)) {
      return { err: true, errors: { invalid: true } }
    }
    if (!isNumber(point.coords.lat) || !isNumber(point.coords.lng)) {
      return { err: true, errors: { invalid: true } }
    }

    if (!('elevation' in point) || !isNumber(point.elevation)) {
      return { err: true, errors: { invalid: true } }
    }

    if (!('timestamp' in point) || isNaN(Date.parse(point.timestamp))) {
      return { err: true, errors: { invalid: true } }
    }
  }

  return { err: false, errors: undefined }
}
