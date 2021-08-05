function dateStr() {
    var date = new Date();
    var day = ("0" + date.getUTCDate()).slice(-2)
    return day + ' ' + date.getFullYear() + ' ' + date.getDay()
}

var vueApp = new Vue({
    el: '#vue-app',
    data: {
        task: null,
        time: null,
        apiKey: null,
        calendar:{},
        taskDate: new Date().toLocaleDateString('en-CA'),
        comment: null,
        timeSeries: [
            // {
            //     'task': 'next1',
            //     'comment': 'hello',
            //     'time': 9.3
            // }
        ],
    },
    methods: {
        updateDate: function() {
            this.timeSeries.forEach(function(item) {
                this.$set(item, 'date', this.taskDate)
                // item.date = this.taskDate;
                console.log(item.date);
            }.bind(this));
        },

        saveApiKey: function() {
            localStorage.setItem('apiKey', this.apiKey);
        },
        addRow: function() {
            console.log(this.taskDate);
            this.timeSeries.push(
                {
                    'task': this.task,
                    'comment': this.comment,
                    'time': this.time,
                    'dateTime': new Date(),
                    'date': this.taskDate
                }
            );

            this.task = null;
            this.comment = null;
            this.time = null;

        },
        addTask: function(taskId, comment, time) {
            this.timeSeries.push(
                {
                    'task': taskId,
                    'comment': comment,
                    'time': time,
                    'date': this.taskDate
                }
            );
        },
        loadCalendar: function(data) {
            var days = {};
            data.time_entries.forEach(function(item) {
                if (!days.hasOwnProperty(item.spent_on)) {
                    days[item.spent_on] = [];
                }
                days[item.spent_on].push(item);
            })
            this.calendar = days;
        },
        deleteItem: function(index) {
            console.log(index);
            this.timeSeries.splice(index, 1);
        },
        save: function() {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://localhost:8032/time_entries.json', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.setRequestHeader("X-Redmaine-Token", this.apiKey);
            xhr.setRequestHeader("X-Redmaine-UserId", 4);

            xhr.onreadystatechange = function() {//Вызывает функцию при смене состояния.
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    setTimeout(this.load, 1000);
                    // Запрос завершён. Здесь можно обрабатывать результат.
                }
            }.bind(this)
            xhr.send(JSON.stringify(this.timeSeries));
        },
        load: function() {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", 'http://localhost:8032/time_entries.json', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.setRequestHeader("X-Redmaine-Token", this.apiKey);
            xhr.setRequestHeader("X-Redmaine-UserId", 4);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = function() {//Вызывает функцию при смене состояния.
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    this.loadCalendar(JSON.parse(xhr.responseText));
                    // Запрос завершён. Здесь можно обрабатывать результат.
                }
            }.bind(this)
            xhr.send();
        },
    },

    beforeMount() {
        console.log('App mounted!');
        if (localStorage.getItem('timeSeries')) this.timeSeries = JSON.parse(localStorage.getItem('timeSeries'));
        if (localStorage.getItem('apiKey')) this.apiKey = localStorage.getItem('apiKey');
        this.load();
    },
    computed: {
        totalTime: function() {
            localStorage.setItem('timeSeries', JSON.stringify(this.timeSeries));
            return this.timeSeries.reduce((accumulator, item) => {
                var val = parseFloat(item.time);
                if (isNaN(val)) {
                    val = 0;
                }
                return accumulator + val;
            }, 0).toFixed(2);
        },

        lastTime: function() {
            var time = this.timeSeries.reduce((accumulator, item) => {
                var val = parseFloat(item.time);
                if (isNaN(val)) {
                    val = 0;
                }
                return accumulator + val;
            }, 0);

            var last = (8 - time).toFixed(2);
            var overtime = 0;
            if (last < 0) {
                overtime = Math.abs(last).toFixed(2);
                last = 0;
            }

            return {
                last: last,
                overtime: overtime
            };
        }
    }
});