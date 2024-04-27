const axios = require('axios').default;
const passport = require('passport');
const fs = require('node:fs');
const router = require("express").Router();
const logger = require("./log");

const steamKey = process.env.API_KEY;
const frontRoutes = {
  LANDING: process.env.LANDING_PAGE,
  HOME: process.env.HOME_PAGE
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.status(403).json({"message": "Not logged in"});
}

router.get('/auth/steam', passport.authenticate('steam'));

router.get('/auth/steam/return',
  passport.authenticate('steam'),
  function(req, res) {
    res.redirect(frontRoutes.HOME);
});

/** APP ENDPOINTS */

router.get('/user', ensureAuthenticated, function(req, res){
    res.json(req.user);
});

router.get('/user/details', ensureAuthenticated,  async function(req, res){
  const steamID = req.user.id;
  const response = await axios.get("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/", {params: {
    key: steamKey,
    steamids: steamID,
    format: "json"
  }});

  const data = response.data.response.players[0];
  res.json(data);
});

router.get('/user/library', ensureAuthenticated, async function(req, res){
  const steamID = req.user.id;
  const response = await axios.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/", {params: {
    key: steamKey,
    steamid: steamID,
    include_appinfo: "true",
    format: "json"
  }});

  res.json(response.data.response);
});

router.get('/random', ensureAuthenticated,  async function(req, res){
  const steamID = req.user.id;
  const response = await axios.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/", {params: {
    key: steamKey,
    steamid: steamID,
    include_appinfo: "true",
    format: "json"
  }});

  const totalGames = response.data.response.game_count;
  const game = response.data.response.games[Math.floor(Math.random() * totalGames)];

  res.json(game);
});

router.get('/logout', ensureAuthenticated,  function(req, res){
    req.logout((err) => err ? console.log(err) : null);
    res.json({"message": "Logged out successfully"})
    // res.redirect(frontRoutes.LANDING);
  }
);

module.exports = router;