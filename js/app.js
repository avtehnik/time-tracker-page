var vueApp = new Vue({
    el: '#vue-app',
    data: {
        task: null,
        time: null,
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
        addRow: function() {
            this.timeSeries.push(
                {
                    'task': this.task,
                    'comment': this.comment,
                    'time': this.time
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
                    'time': time
                }
            );
        },
        deleteItem: function(index) {
            console.log(index);
            this.timeSeries.splice(index, 1);

        },
    },
    beforeMount() {
        console.log('App mounted!');
        if (localStorage.getItem('timeSeries')) this.timeSeries = JSON.parse(localStorage.getItem('timeSeries'));
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