// routes/index.js

module.exports = function(app, Bible, Account)
{
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

    // UPDATE TAG
    app.put('/api/bibles/:book_id/:chapter_id/:verse_id', function(req, res){
		console.log('!!!');
        Bible.update({book: req.params.book_id, chapter: req.params.chapter_id, verse:req.params.verse_id}, { $set: req.body }, function(err, output){
            if(err) res.status(500).json({ error: 'database failure' });
            console.log(output);
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