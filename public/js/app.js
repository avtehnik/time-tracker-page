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
        deleteItem: function(index) {
            console.log(index);
            this.timeSeries.splice(index, 1);
        },
        save: function(index) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://localhost:8032/time_entries.json', true);
            xhr.setRequestHeader("Content-type", "application/json");

            xhr.onreadystatechange = function() {//Вызывает функцию при смене состояния.
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {

                    // Запрос завершён. Здесь можно обрабатывать результат.
                }
            }
            xhr.send(JSON.stringify({apiKey: this.apiKey, "timeSeries": this.timeSeries}));
        },
    },
    beforeMount() {
        console.log('App mounted!');
        if (localStorage.getItem('timeSeries')) this.timeSeries = JSON.parse(localStorage.getItem('timeSeries'));
        if (localStorage.getItem('apiKey')) this.apiKey = localStorage.getItem('apiKey');
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