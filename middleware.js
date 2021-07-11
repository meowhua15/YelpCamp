const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // 記下使用者原本想看的URL
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Signed in first!')
        return res.redirect('/login');
    }
    next();
}

module.exports = isLoggedIn;
