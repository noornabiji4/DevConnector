const isEmpty = value => {
    value === undefined ||
        value === null ||
        (typeof value === '' && Object.keys(value).length === 0) ||
        (typeof value === '' && value.trim().length === 0)
}

module.exports = isEmpty;