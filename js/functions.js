var functions = {
    isolateTime: function(value) {

        var result = value;
        var matches = this.matchTime(value);

        if (matches.minutes !== null) {
            result = +matches.minutes[1] * 60;
        }
        if (matches.minutes !== null && matches.seconds !== null) {
            result += +matches.minutes[1];
        } else if (matches.seconds !== null) {
            result = +matches.seconds[1];
        }
        if (matches.minutes == null && matches.seconds == null && matches.numbers !== null) {
            result = +matches.numbers[0];
        }
        return result;
    },
    matchTime: function(value) {
        value = value.replace(/ /g, "");
        var minutes = /([0-9]+\.?[0-9]*)\s?(minutes|mins?|m\s?)/i,
            seconds = /([0-9]+\.?[0-9]*)\s?(seconds|secs?|s\s?)/i,
            numbers = /[0-9]+\.?[0-9]*/i;

        var minutes = minutes.exec(value);
        var seconds = seconds.exec(value);
        var numbers = numbers.exec(value);

        return {
            isMatch: minutes !== null || seconds !== null || numbers !== null,
            minutes: minutes,
            seconds: seconds,
            numbers: numbers
        };
    },
    // Found at https://css-tricks.com/drag-and-drop-file-uploading/
    isAdvancedUpload: function() {
        var div = document.createElement('div');
        return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
    },
    handlePapaError(errors) {
        if (errors.length > 0) {
            var row = errors[0].row;
            functions.showError(errors[0].message + (row ? ':' + row : ''));
            return false;
        }
    },
    showError: function(msg) {
        var div = $('.error-div')
        div.html(msg);
        div.slideDown().delay(3000).slideUp();

    },
    analyseData: function(data) {
        var sites = [];
        var tasks = [];
        var sorted = [];
        _.each(data, function(val, index) {
            var i = sites.indexOf(val[0]);
            var j = tasks.indexOf(val[1]);
            if (i === -1) {
                sites.push(val[0]);
                i = sites.length - 1;
            }
            if (j === -1) {
                tasks.push(val[1]);
                j = tasks.length - 1;
            }
            if (typeof sorted[i] === 'undefined') {
                sorted[i] = []
            }
            if (typeof sorted[i][j] === 'undefined') {
                sorted[i][j] = [];
            }
            sorted[i][j].push(val);
        });
        _.each(sorted, function(val, i) {
            _.each(val, function(v, j) {
                sorted[i][j] = _.zip.apply(_, v);
            });
        });

        return {
            sites: sites,
            tasks: tasks,
            data: sorted
        };
    },
    calcCompletionTime: function(data) {
        var self = this;
        var analysed = this.analyseData(data);
        var sites = analysed.sites;
        var tasks = analysed.tasks;
        var sorted = analysed.data;

        var completionTimes = {};
        _.each(sorted, function(val, i) {
            _.each(val, function(v, j) {
                if (typeof completionTimes[sites[i]] === 'undefined') {
                    completionTimes[sites[i]] = []
                }
                // v[3] is the time column
                var len = v[3].length;
                _.each(v[3], function(time, i) {
                    v[3][i] = self.isolateTime(time);
                });
                var total = _.reduce(v[3], function(sum, n) {
                    return sum + +n;
                }, 0)
                var ct = (total / len).toFixed(2);
                completionTimes[sites[i]].push(ct);
            });
        });

        _.each(tasks, function(v, i) {
            tasks[i] = 'Task ' + v;
        });

        return {
            results: completionTimes,
            tasks: tasks
        };
    },
    calcSuccessRate: function(data) {
        var self = this;
        var analysed = this.analyseData(data);
        var sites = analysed.sites;
        var tasks = analysed.tasks;
        var sorted = analysed.data;

        var successRates = {};
        _.each(sorted, function(val, i) {
            _.each(val, function(v, j) {
                if (typeof successRates[sites[i]] === 'undefined') {
                    successRates[sites[i]] = []
                }
                // v[4] is the success column
                var len = v[4].length;
                var total = _.reduce(v[4], function(sum, n) {
                    return sum + +n;
                }, 0)
                var sr = ((total / len) * 100).toFixed(2);
                successRates[sites[i]].push(sr);
            });
        });

        _.each(tasks, function(v, i) {
            tasks[i] = 'Task ' + v;
        });

        return {
            results: successRates,
            tasks: tasks
        };
    },
    calcAverageErrors: function(data) {
        var self = this;
        var analysed = this.analyseData(data);
        var sites = analysed.sites;
        var tasks = analysed.tasks;
        var sorted = analysed.data;

        var averageErrors = {};
        _.each(sorted, function(val, i) {
            _.each(val, function(v, j) {
                if (typeof averageErrors[sites[i]] === 'undefined') {
                    averageErrors[sites[i]] = []
                }
                // v[4] is the success column
                var len = v[2].length;
                var actions = _.reduce(v[2], function(sum, n) {
                    return sum + +n;
                }, 0)
                var matches = _.reduce(v[5], function(sum, n) {
                    return sum + +n;
                }, 0)
                var ae = ((actions - matches) / len).toFixed(2);
                averageErrors[sites[i]].push(ae);
            });
        });

        _.each(tasks, function(v, i) {
            tasks[i] = 'Task ' + v;
        });

        return {
            results: averageErrors,
            tasks: tasks
        };
    }

};
