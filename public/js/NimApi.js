const host = location.hostname; //twserver.alunos.dcc.fc.up.pt
const port = location.port; //8008

const NimApi =  {
    
}

/**
 * Makes a request to the specified command 
 * @param {String} command 
 * @param {String} method 
 * @param {*} data 
 * @param {Function} callback 
 */
function makeRequest(command, method, data, callback) {
    
    //console.log(host_ + "    " + port_);
    
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4)
            return
        callback(xhr.status, JSON.parse(xhr.responseText))
    }
    xhr.open(method, `http://${host}:${port}/${command}`);
    //xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data))
}
