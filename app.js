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
    apiKey: null,
    setApiKey: function(apiKey) {
        this.apiKey = apiKey;
    },
    userId: null,
    setUserId: function(userId) {
        this.userId = userId;
    },
    req: function(method, path, data, cb) {
        var options = {
            uri: 'https://redmine.ekreative.com' + path,
            method: method,
            headers: {
                "Content-type": "application/json",
                'X-Redmine-API-Key': Client.apiKey
            },
            json: true,
        };

        if (data) {
            options.form = data;
        }

        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(body)
            } else {
                console.log(error);
            }
        });
    },

    myTimeEntries: function(cb) {
        Client.req('GET', '/time_entries.json?user_id=' + Client.userId, {}, cb);
    },

    trackTime: function(data, cb) {
        data.user_id = Client.userId;
        Client.req('POST', '/time_entries.json?user_id=' + Client.userId, {time_entry: data}, cb);
    },
}

app.post('/time_entries.json', (req, res) => {
    Client.setUserId(req.headers['x-redmaine-userid']);
    Client.setApiKey(req.headers['x-redmaine-token']);

    req.body.forEach(function(item) {
        Client.trackTime(
            {
                // project_id: 1094,
                issue_id: parseInt(item.task),
                spent_on: item.date,
                hours: item.time,
                activity_id: 23,
                comments: item.comment,
            }
        );
    })
    res.send(req.body)
})

app.get('/time_entries.json', (req, res) => {

    Client.setUserId(req.headers['x-redmaine-userid']);
    Client.setApiKey(req.headers['x-redmaine-token']);
    Client.myTimeEntries(
        function(data) {
            res.send(data)
        }
    );
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
