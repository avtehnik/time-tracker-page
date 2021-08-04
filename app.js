var request = require('request');
var cors = require('cors')
var bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3032

app.use('/', express.static(__dirname + '/public'));
app.use(cors())
app.use(bodyParser.json())

var Client = {
    req: function(method, path, data, cb,apiKey) {
        var options = {
            uri: 'https://redmine.ekreative.com' + path,
            method: method,
            form: data,
            headers: {
                "Content-type": "application/json",
                'X-Redmine-API-Key': apiKey
            },
            json: true,
        };

        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(body)
            } else {
                console.log(error);
            }
        });
    },

    myTimeEntries: function() {
        Client.req('GET', '/time_entries.json?user_id=4', {}, function(data) {
            console.log(data);
        });
    },

    trackTime: function(data, apiKey) {
        data.user_id = 4;
        Client.req('POST', '/time_entries.json?user_id=4', {time_entry: data}, function(data) {
            console.log(data);
        }, apiKey);
    },
}

app.post('/time_entries.json', (req, res) => {
    req.body.timeSeries.forEach(function(item) {
        Client.trackTime(
            {
                // project_id: 1094,
                issue_id: parseInt(item.task),
                spent_on: item.date,
                hours: item.time,
                activity_id: 23,
                comments: item.comment,
            },
            req.body.apiKey
        );
    })
    res.send(req.body)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
