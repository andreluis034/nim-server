module.exports = {
    parseJSON: function(req, res, next) {
        var str = ''
        console.log('parseJSON')
        
        req.on('data', function(chunk) {
            str += chunk;
        })
        req.on('end', function() {
            try {
                req.body = JSON.parse(str)
            } catch (e) {
                res.writeHead(400)
                res.end(JSON.stringify({ error: e.message }))
                return;
            }
            next()
        })
    }
}