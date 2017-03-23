const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const serve = require('express-static');
const cons = require('consolidate');
const mongoose = require('mongoose');

var config = require('./webpack.dev.config.js');

var db = require('./db.js');

var NoteSchema = new mongoose.Schema({
    date: Number,
    title: String,
    content: String
});
var NoteModel = db.model('Note', NoteSchema);


for (let p in config.entry) {
    config.entry[p] = ['webpack-dev-server/client?http://localhost:3000/', 'webpack/hot/dev-server', config.entry[p]];
}

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    // contentBase: './src',
    hot: true,
    setup: app => {

        app.set('views', './src/');
        app.engine('html', cons.handlebars);
        app.set('view engine', 'html');

        app.use(serve(__dirname + '/dist/public'));
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
            res.render(path.join(__dirname, '/src/user.html'), { username: 'xxx' });
        })

        app.get('/', (req, res) => {
            if (req.isAuthenticated()) {
                res.redirect('/users');
            }
            var file = path.join(__dirname, '/src/index.html');
            res.render(file);
        });

        passport.serializeUser(function(user, done) { //保存user对象
            done(null, user); //可以通过数据库方式操作
        });

        passport.deserializeUser(function(user, done) { //删除user对象
            done(null, user); //可以通过数据库方式操作
        });


        app.post('/save', (req, res) => {
            if (!req.isAuthenticated()) {
                return;
            }
            var noteEntity = new NoteModel({
                date: Date.now(),
                title: req.body.title,
                content: req.body.content
            });

            if (req.body.id) {

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
                        if (err) {
                            console.log(err);
                            res.json({
                                result: 'failed',
                                message: '数据保存失败'
                            });
                        } else {
                            res.json({
                                result: 'success'
                            });
                        }
                    });
                });


            } else {
                noteEntity.save(function(err) {
                    if (err) {
                        res.json({
                            result: 'failed',
                            message: '数据保存失败'
                        });
                    } else {
                        res.json({
                            result: 'success'
                        });
                    }
                });
            }

        });

        app.post('/login', passport.authenticate('local', {
            successRedirect: '/users',
            failureRedirect: '/'
        }));

        app.get('/logout', function(req, res) {
            req.logout();
            res.redirect('/');
        });

        app.post('/delete', function(req, res) {
            if (!req.isAuthenticated()) {
                return;
            }
            var id = mongoose.Types.ObjectId(req.body.id);
            NoteModel.remove({ _id: id }, function(err) {
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
            })
        })



        app.get('/list', (req, res) => {
            if (req.isAuthenticated()) {
                NoteModel.find({}).sort({ date: 'desc' }).exec(function(err, docs) {
                    if (!err) {
                        res.json(docs);
                    } else {
                        console.log(err);
                    }
                })
            } else {
                res.redirect('/');
            }

        });

        app.get(/\.mock.json$/, (req, res) => {
            let name = path.basename(req.url, '.mock.json');
            let json = '/mock/' + name + '.js';
            res.send(require(__dirname + json));
        });
    }
});
server.listen(3000);