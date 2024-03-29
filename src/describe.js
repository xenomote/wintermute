module.exports = function describe(err) {
    return {
        [OK]: 'OK',
        [ERR_NOT_OWNER]: 'ERR_NOT_OWNER',
        [ERR_NO_PATH]: 'ERR_NO_PATH',
        [ERR_NAME_EXISTS]: 'ERR_NAME_EXISTS',
        [ERR_BUSY]: 'ERR_BUSY',
        [ERR_NOT_FOUND]: 'ERR_NOT_FOUND',
        [ERR_NOT_ENOUGH_ENERGY]: 'ERR_NOT_ENOUGH_ENERGY', //and others
        [ERR_INVALID_TARGET]: 'ERR_INVALID_TARGET',
        [ERR_FULL]: 'ERR_FULL',
        [ERR_NOT_IN_RANGE]: 'ERR_NOT_IN_RANGE',
        [ERR_INVALID_ARGS]: 'ERR_INVALID_ARGS',
        [ERR_TIRED]: 'ERR_TIRED',
        [ERR_NO_BODYPART]: 'ERR_NO_BODYPART',
        [ERR_RCL_NOT_ENOUGH]: 'ERR_RCL_NOT_ENOUGH',
        [ERR_GCL_NOT_ENOUGH]: 'ERR_GCL_NOT_ENOUGH',
    } [err] || '' + err
}