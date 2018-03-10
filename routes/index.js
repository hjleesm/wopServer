// routes/index.js
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var express         = require('express');

module.exports = function(app, Bible, Account, Tag, passport)
{
    var isAuthenticated = function (req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.sendStatus(401);
    };

	var wopPath = path.resolve(__dirname + '/wop/');
	
	app.use('/wop', express.static(wopPath));
	
	passport.serializeUser(function(account, done) {
		done(null, account);
    });

    passport.deserializeUser(function(account, done) {
		done(null, account);
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'pw',
        session: true,
        passReqToCallback: true 
    }, function(req, id, password, done) {
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
	
    // GET ALL BIBLES
    app.get('/api/bibles', function(req,res){
        Bible.find(function(err, bible){
            if(err) return res.status(500).send({error: 'database failure'});
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(bible);
        });
    });

    // GET BOOK
    app.get('/api/bibles/:book_id', function(req, res){
        Bible.find({book: req.params.book_id}, function(err, bible){
            if(err) return res.status(500).json({error: err});
            if(!bible) return res.status(404).json({error: 'bible not found'});
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(bible);
        })
    });

    // GET CHAPTER OF BOOK
    app.get('/api/bibles/:book_id/:chapter_id', function(req, res){
        Bible.find({book: req.params.book_id, chapter: req.params.chapter_id}, function(err, bible){
            if(err) return res.status(500).json({error: err});
            if(!bible) return res.status(404).json({error: 'bible not found'});
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(bible);
        })
    });

    // GET VERSE OF CHAPTER OF BOOK
    app.get('/api/bibles/:book_id/:chapter_id/:verse_id', function(req, res){
        Bible.find({book: req.params.book_id, chapter: req.params.chapter_id, verse:req.params.verse_id}, function(err, bible){
            if(err) return res.status(500).json({error: err});
            if(!bible) return res.status(404).json({error: 'bible not found'});
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(bible);
        })
    });

    var addedScore = function(id) {
        Account.find({id: id}, function(err, account) {
            if(!(err || !account)) {
                account[0].score += 10;
            }
        });
    };

    var writeHistory = function(id, book, chapter, verse, body_tag) {
        // find bible
        Bible.find({book: book, chapter: chapter, verse: verse}, function(err, bible){
            if(!(err || !bible)) {
                var removeArray = [];
                var addArray = JSON.parse(JSON.stringify( body_tag ));

                if(bible[0].tag)
                    removeArray = JSON.parse(JSON.stringify( bible[0].tag ));

                if(removeArray.length !== 0 && addArray.length !== 0) {
                    for (var i = 0; i < removeArray.length; i++) {
                        for (var j = 0; j < addArray.length; j++) {
                            if(removeArray[i] === addArray[j]) {
                                removeArray.splice(i, 1);
                                addArray.splice(j, 1);
                                i--;
                                j--;
                            }
                        }
                    }
                }

                if(removeArray.length > 0 || addArray.length > 0) {
                    var saveTag = function(action) {
                        var tag = new Tag();
                        tag.date = new Date();
                        tag.book = book;
                        tag.chapter = chapter;
                        tag.verse = verse;
                        tag.id = id;
                        tag.tag = removeArray[i];
                        tag.action = action;

                        tag.save(function(err){
                            if(err){
                                console.error(err);
                                return;
                            }
                        });
                    };

                    for (var i = 0; i < removeArray.length; i++) {
                        saveTag('removed');
                    }

                    for (var i = 0; i < addArray.length; i++) {
                        saveTag('added');
                    }

                    addedScore(id);
                }
            }
        });
    };

    // UPDATE TAG
    app.put('/api/bibles/:book_id/:chapter_id/:verse_id', isAuthenticated, function(req, res){
        writeHistory(req.user.id, req.params.book_id, req.params.chapter_id, req.params.verse_id, req.body.tag);

        Bible.update({book: req.params.book_id, chapter: req.params.chapter_id, verse:req.params.verse_id}, { $set: req.body }, function(err, output){
            if(err) res.status(500).json({ error: 'database failure' });
            if(!output.n) return res.status(404).json({ error: 'bible not found' });
			
			res.setHeader('Access-Control-Allow-Origin','*');
            res.json( { message: 'bible\'s tag updated' } );
        })
    });

    // GET ALL TAGS
    app.get('/api/tags', function(req,res){
        Bible.find({tag: {$exists: true, $not: {$size: 0}}}).select({_id: 0, tag: 1}).exec(function(err, bible){
            if(err) return res.status(500).send({error: 'database failure'});

            // remove duplicated tags
            var uniqTags = [];
            if(bible) {
                bible.forEach(function(element) {
                    element.tag.forEach(function(tag) {
                        var index = uniqTags.map(function(obj) { return obj.text; }).indexOf(tag);
                        
                        if(index < 0)
                            uniqTags.push({ text: tag, count: 1 });
                        else
                            uniqTags[index].count++;
                    });
                });
            }
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(uniqTags);
        });
    });

    // GET WORDs have tag
    app.get('/api/words/:tag_name', function(req, res) {
        Bible.find({tag: {$exists: true, $not: {$size: 0}}}).exec(function(err, bible) {
            var words = [];
            if(bible) {
                bible.forEach(function(element) {
                    element.tag.some(function(tag) {
                        if(tag == req.params.tag_name) {
                            words.push(element);

                            return true;
                        }
                    });
                });
            }
            res.setHeader('Access-Control-Allow-Origin','*');
            res.json(words);
        });
    });

    // Create Account
    app.post('/api/account/create', function(req, res){
        Account.find({id: req.body.id}, function(err, account){
            if(err) return res.status(500).json({error: err});
            if(!account) return res.status(404).json({error: 'account not found'});

            res.setHeader('Access-Control-Allow-Origin','*');
            if(account.length > 0) {
                res.json({
                    result: 0,
                    msg: 'This account is submitted!'
                });
            } else { 
                var account = new Account();
                account.id = req.body.id;
                account.password = req.body.password;
                account.email = req.body.email;
                account.score = 0;
        
                account.save(function(err){
                    if(err){
                        console.error(err);
                        res.json({result: 0});
                        return;
                    }
            
                    res.json({result: 1});
                });
            }
        });
    });
    
    // Check id
    app.get('/api/account/exist/:id', function(req, res){
        Account.find({id: req.params.id}, function(err, account){
            if(err) return res.status(500).json({error: err});
            if(!account) return res.status(404).json({error: 'account not found'});
            
            res.setHeader('Access-Control-Allow-Origin','*');
            if(account.length > 0)
            res.json({exist: true});
            else 
            res.json({exist: false});
        })
    });
    
    // login
    app.post('/api/auth', passport.authenticate('local'), function(req, res) {
        res.sendStatus(200);
    });

    // check session
    app.get('/api/auth', isAuthenticated, function (req, res) {
        res.json({
			id: req.user.id, 
			score: req.user.score
		});
    });

    // logout
    app.delete('/api/auth', function (req, res) {
        req.logout();
		res.sendStatus(200);
    });

    // // GET BOOK BY AUTHOR
    // app.get('/api/books/author/:author', function(req, res){
    //     res.end();
    // });

    // // CREATE BOOK
    // app.post('/api/books', function(req, res){
    //     res.end();
    // });

    // // UPDATE THE BOOK
    // app.put('/api/books/:book_id', function(req, res){
    //     res.end();
    // });

    // // DELETE BOOK
    // app.delete('/api/books/:book_id', function(req, res){
    //     res.end();
    // });

}