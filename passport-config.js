const SteamStrategy = require('passport-steam').Strategy;

function initializePassport(passport, key){
    /** Essa função é utilizada para guardar alguma informação do usuário no cookie,
     *  neste caso é o próprio usuário, ela é chamada após o login e logo antes da criação da sessão
     *  https://stackoverflow.com/questions/63335877/contents-of-cookie-generated-by-passport-js
     */
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    /** Essa função é chamada após cada requisição que possui um cookie. 
     *  Faz a leitura do cookie e põe em req.session.passport
     */
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(new SteamStrategy({
        returnURL: process.env.URL + '/auth/steam/return',
        realm: process.env.URL + '/',
        apiKey: key
    },
    function(identifier, profile, done) {
        process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
        });
    }
    ));
}

module.exports = initializePassport;