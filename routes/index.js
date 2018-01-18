'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db/index.js');

module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT t.id, u.name, t.content FROM users u INNER JOIN tweets t ON u.id = t.user_id;', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT t.id, u.name, t.content FROM users u INNER JOIN tweets t ON u.id = t.user_id WHERE u.name = $1', [req.params.username], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT t.id, u.name, t.content FROM users u INNER JOIN tweets t ON u.id = t.user_id WHERE t.id = $1', [req.params.id], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  // create a new tweet

  router.post('/tweets', function(req, res, next){
    var newTweet = {name: req.body.name, content: req.body.content};
    client.query('SELECT id FROM users WHERE name = ($1);', [req.body.name], function (err, result) {
      if (err) return next(err);
      let uid = result.rows;

      if(!uid.length){
        client.query('INSERT INTO users (name, picture_url) VALUES ($1, $2) RETURNING id', [req.body.id, 'http://i.imgur.com/bI1zf2b.jpg'], function (err, result) {
          if (err) return next(err); // pass errors to Express
          console.log(result);
        });
      }


      //post tweet
      client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)', [uid[0].id, req.body.content], function (err, result) {
        if (err) return next(err); // pass errors to Express
        //io.sockets.emit('new_tweet', newTweet);
        res.redirect('/');
      });
    });

  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
