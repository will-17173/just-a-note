const path = require('path');
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const cons = require('consolidate');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const serve = require('express-static');
const mongoose = require('mongoose');
const db = require('./db.js');

module.exports = function(app, isDev) {

    var router = express.Router();

    var NoteSchema = new mongoose.Schema({
        date: Number,
        title: String,
        content: String
    });
    var NoteModel = db.model('Note', NoteSchema);

    app.set('views', './dist/');
    app.engine('html', cons.handlebars);
    app.set('view engine', 'html');

    if (isDev) {
        app.use(serve(__dirname + '/dist/public'));
    } else {
        app.use(express.static(__dirname + '/dist/public'));
        app.use(express.static(__dirname + '/dist/js'));
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(session({
        secret: 'note.onfocus.win',
        cookie: { maxAge: 6000000 }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('local', new LocalStrategy(
        function(username, password, done) {
            var user = {
                id: '1',
                username: 'a',
                password: 'a'
            };

            if (username !== user.username) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (password !== user.password) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        }
    ));

    app.all('/users', (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    });
    app.get('/users', (req, res) => {
        // res.render(path.join(__dirname, '/src/user.html'), { username: req.user.username });
        var file = isDev ? '/src/user.html' : '/dist/user.html';
        res.render(path.join(__dirname, file));
    });

    app.get('/', (req, res) => {
        // if (/(iPhone|Android|iPod|iPad)/.test(navigator.userAgent)) {

        // }
        if (req.isAuthenticated()) {
            res.redirect('/users');
        }
        var file = isDev ? '/src/index.html' : '/dist/index.html';
        res.render(path.join(__dirname, file));
    });

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    var optCallback = (err, res) => {
        if (err) {
            res.json({
                result: 'failed',
                message: err
            });
        } else {
            res.json({
                result: 'success'
            });
        }
    };

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/users',
        failureRedirect: '/'
    }));

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    router.use(function isAuth(req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        next();
    });

    router.get('/list', (req, res) => {
        NoteModel.find({}).sort({ date: 'desc' }).exec(function(err, docs) {
            if (!err) {
                res.json(docs);
            } else {
                console.log(err);
            }
        });
    });

    router.post('/delete', (req, res) => {
        var id = req.body.id;
        NoteModel.remove({ _id: id }, function(err) {
            optCallback(err, res);
        });
    });

    router.post('/save', (req, res) => {
        if (req.body.id) { //更新
            NoteModel.findById(req.body.id, function(err, note) {
                if (err) {
                    return res.json({
                        result: 'failed',
                        message: '数据查询失败'
                    });
                }
                note.title = req.body.title;
                note.content = req.body.content;
                note.save(function(err) {
                    optCallback(err, res);
                });
            });
        } else { // 新建
            var noteEntity = new NoteModel({
                date: Date.now(),
                title: req.body.title,
                content: req.body.content
            });
            noteEntity.save(function(err) {
                optCallback(err, res)
            });
        }
    })

    app.use('/note', router);

    app.get(/\.mock.json$/, (req, res) => {
        let name = path.basename(req.url, '.mock.json');
        let json = '/mock/' + name + '.js';
        res.send(require(__dirname + json));
    });
}