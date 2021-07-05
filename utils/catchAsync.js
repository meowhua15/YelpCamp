function catchAsync(ftn) {
    return function (req, res, next) {
        ftn(req, res, next).catch(e => next(e));
    }
}

module.exports = catchAsync;