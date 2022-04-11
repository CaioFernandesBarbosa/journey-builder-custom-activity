'use strict';

const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const util = require('util');
const axios = require('axios');

exports.logExecuteData = [];
/*
var connection = new Postmonger.Session();

connection.trigger('ready');

connection.on('initActivity', function( data ){
        document.getElementById('TesteCaio').value = JSON.stringify(data,null,2);
});

connection.on('clickedNext', function(){
    var TesteCaio = JSON.parse(document.getElementById('TesteCaio').value)
    connection.trigger('updateActivity', TesteCaio)
});
*/
function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + util.inspect(req.headers));
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

exports.edit = function (req, res) {
    console.log('edit request');
    logData(req);
    res.send(200, 'Edit');
};

exports.save = function (req, res) {
    console.log('save request');
    logData(req);
    res.send(200, 'Save');
};

exports.execute = function (req, res) {
    logData(req);
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        // console.log('buffer hex', req.body.toString('hex'));

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            // console.log('inArguments', JSON.stringify(decoded.inArguments));
            // console.log('decodedArgs', JSON.stringify(decodedArgs));

            const templateName = decodedArgs['templateName'];
            const phoneNumber = decodedArgs['phoneNumber'];
            const parameters = decodedArgs['parameters'];
            const account = decodedArgs['account'];

            console.log('templateName', templateName);
            console.log('phoneNumber', phoneNumber);
            console.log('parameters', parameters);
            console.log('account', account);

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Key ${process.env.BLIPAUTHORIZATIONKEY}`
            }

            const guid_id = uuidv4();

            const post_save = {
                "id": guid_id,
                "to": "postmaster@wa.gw.msging.net",
                "method": "get",
                "uri": `lime://wa.gw.msging.net/accounts/+${phoneNumber}`
            }

            axios.post('https://bancopan.http.msging.net/commands', post_save, { headers: headers }).then((res) => {
                const post_hsm = {
                    "id": guid_id,
                    "to": `${phoneNumber}@wa.gw.msging.net`,
                    "type": "application/json",
                    "content": {
                        "type": "hsm",
                        "hsm": {
                            "namespace": "beb7e8c5_c488_411a_9d90_4974ba197671",
                            "element_name": templateName,
                            "language": {
                                "policy": "deterministic",
                                "code": "pt_BR"
                            },
                            "localizable_params": parameters.map(x => { return { 'default': x } })
                        }
                    }
                }

                axios.post('https://bancopan.http.msging.net/messages', post_hsm, { headers: headers }).then((res) => {
                    console.log(`Success send whatsapp to ${phoneNumber}`);
                }).catch((err) => {
                    console.error(`ERROR send whatsapp to ${phoneNumber}: ${err}`)
                })
            }).catch((err) => {
                console.error(`ERROR verify whatsapp to ${phoneNumber}: ${err}`)
            })

            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};

exports.publish = function (req, res) {
    console.log('publish request');
    // logData(req);
    res.send(200, 'Publish');
};

exports.validate = function (req, res) {
    console.log('validate request');
    // logData(req);
    res.send(200, 'Validate');
};

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}