const axios = require('axios').default;
const passport = require('passport');
const fs = require('node:fs');
const router = require("express").Router();
const logger = require("./log");

/**
 * I LOVE YOU SO MUCH STACKOVERFLOW: https://stackoverflow.com/questions/53963328/how-do-i-get-a-hash-for-a-picture-form-a-steam-game
 * 
 * https://cdn.cloudflare.steamstatic.com/steam/apps/{appid_here}/hero_capsule.jpg 
 * https://cdn.cloudflare.steamstatic.com/steam/apps/{appid_here}/capsule_616x353.jpg 
 * https://cdn.cloudflare.steamstatic.com/steam/apps/{appid_here}/header.jpg 
 * https://cdn.cloudflare.steamstatic.com/steam/apps/{appid_here}/capsule_231x87.jpg
 * 
 * https://steamcdn-a.akamaihd.net/steam/apps/{appid_here}/header.jpg
 */

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

/** TODO: potentially substitute for https://api.steampowered.com/ISteamApps/GetAppList/v2/ */
router.get('/user/library', ensureAuthenticated, async function(req, res){
  const steamID = req.user.id;
  const response = await axios.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/", {params: {
    key: steamKey,
    steamid: steamID,
    include_appinfo: 1,
    format: "json"
  }});

  const games = response.data.response.games;

  res.json(games);
});

/** TODO: the filtering can be made through the appdetails endpoints using the Categories in the response */
router.get('/random', ensureAuthenticated,  async function(req, res){
  const steamID = req.user.id;
  const response = await axios.get("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/", {params: {
    key: steamKey,
    steamid: steamID,
    include_appinfo: 0,
    format: "json"
  }});

  const totalGames = response.data.response.game_count;
  const game = response.data.response.games[Math.floor(Math.random() * totalGames)];

  res.json(game);
});

router.get('/gameinfo', ensureAuthenticated, async function(req, res) {  
  if(!req.query.appid) {
    return res.status(400).json({message: "Appid not informed"})
  }

  const response = await axios.get("https://store.steampowered.com/api/appdetails", {params: {
    appids: req.query.appid
  }, headers: {
    "accept-language": req.headers['accept-language']
  }});

  if(response.data[req.query.appid].success === false){
    return res.status(404).json({message: "Game with supplied App id was not found"});
  }
  
  const reviews = response.data[req.query.appid].data.reviews;
  
  const data = {
    name: response.data[req.query.appid].data.name,
    image: response.data[req.query.appid].data.header_image,
    description: response.data[req.query.appid].data.short_description
  }

  if(reviews){
    var links = reviews.match(/<a.*?<\/a>/g);

    if(links){
      links = links.map(li => (
        {
          href: li.match(/href="([^"]*)/)[1],
          name: li.match(/(?<=>)[^]*?(?=<)/)[0]
        }))
    } 

    data.reviews = {
      link: links,
      rating: reviews.match(/(?<=”<br>)[^<a]*?(?= – )/g),
      text: reviews.match(/\“(.*?)\”/g)
    }
  }

  res.json(data);
})


router.get('/logout', ensureAuthenticated,  function(req, res){
    req.logout((err) => err ? console.log(err) : null);
    res.json({"message": "Logged out successfully"})
  }
);

router.use('/*', ensureAuthenticated, function(req, res) {
  res.status(404).json({message: "It seems like something went wrong..."})
});

module.exports = router;