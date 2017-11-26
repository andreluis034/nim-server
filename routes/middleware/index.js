module.exports = {
    parseJSON: function(req, res, next) {

    },
    readBody: function(req, res, next) {
        if(req.method === "GET") {
            next()
            return
        }
    }
}