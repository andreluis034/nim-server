const fs = require('fs')
const path = require('path')
const config = require('../config.json')
const mediaTypes = { 
    ".txt": "text/plain", 
    ".html": "text/html", 
    ".css": "text/css", 
    ".js": "application/javascript", 
    ".png": "image/png", 
    ".jpeg": "image/jpeg", 
    ".jpg": "image/jpeg", 
    ".eot": "application/vnd.ms-fontobject",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".otf": "font/otf",
}

const root = config.public.root.replace("/", path.sep)
function getPathname(request) {
    var purl = request.url.pathname;
    var pathname = path.normalize(path.join("." + path.sep, root, purl));
    if(!pathname.startsWith(root))  
        pathname = null; 
    return pathname;
}

function isText(mediaType)
{
    var isText = !mediaType.startsWith("image") && !mediaType.startsWith("font") && !mediaType.startsWith("application/vnd.ms-fontobject")
    return isText;
}

function doGetPathname(pathname, response) {
    var mediaType = mediaTypes[path.extname(pathname).toLowerCase()] || "application/octet-stream";
    var encoding = isText(mediaType) ? "utf8" : null;
    fs.readFile(pathname, encoding, (err, data) => {
        if (err) {
            response.writeHead(404); // Not Found 
            response.end("File not found");
        } else {
            response.writeHead(200, {
                'Content-Type': mediaType
            });
            response.end(data);
        }
    });
}

module.exports = (request, response) => {
    var pathname = getPathname(request);
    if (pathname === null) {
        response.writeHead(403); // Forbidden 
        response.end("Forbidden");
    } else {
        fs.stat(pathname, (err, stats) => {
            if (err) {
                response.writeHead(404); // Internal Server Error 
                console.log(err)
                response.end("File not found");
            } else if (stats.isDirectory()) {
                if (pathname.endsWith(path.sep)) {
                    doGetPathname(path.join(pathname, config.public.default_index), response);
                }
                else {
                    response.writeHead(301, // Moved Permanently 
                        {
                            'Location': request.url.pathname + "/"
                        });
                    response.end();
                }
            } else {
                doGetPathname(pathname, response);
            }
        });
    }

}