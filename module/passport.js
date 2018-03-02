var passport        = require('passport');
var LocalStrategy   = require('passport-local').Strategy;

module.exports = function(Account) {
    passport.serializeUser(function(account, done) {
        done(null, account.id);
    });

    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, account) {
            done(null, account);
        })
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: true,
        passReqToCallback: false
    }, function(id, password, done) {
        Account.findOne({id: id}, function(err, account) {
            if(err) return done(err);
            if(!account) return done(null, false, { msg: 'not found id '});

            return account.authenticate(password, function(passError, isSuccess) {
                if(isSuccess) {
                    return done(null, account);
                } else {
                    return done(null, false, { msg: 'password is incorrect' });
                }
            })
        })
    }));
};