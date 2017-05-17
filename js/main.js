'use strict'
var UXVisualiser = {
    papaOptions: null,
    $codeMirror: null,

    completionTime: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        this.papaOptions.complete = function(results, file) {
            var parsedParsed = [];
            var totals = [];
            var means = [];

            var zipped = _.zip.apply(_, results.data);
            var dataCounter = 0;
            _.each(zipped, function(val, index) {
                dataCounter += 1
                parsedParsed[index] = parsedParsed[index] || [];
                totals[index] = 0;

                // Detect whether data has a heading or not
                var heading = "";
                if (!functions.matchTime(val[0]).isMatch) {
                    heading = val.shift(0);
                }
                // parse and clean input
                _.each(val, function(v, i) {
                    // check for enexpected values
                    if (v !== "") {
                        var time = functions.isolateTime(v);
                        totals[index] += time;
                        parsedParsed[index].push(time[0] || time);
                    }
                });

                var mean = totals[index] / parsedParsed[index].length;
                mean = +mean.toFixed(2);

                means[index] = {
                    value: mean,
                    text: 'Mean: ' + mean,
                    position: 'middle',
                    class: 'mean-line'
                }

                parsedParsed[index].unshift(heading || 'Data ' + dataCounter);
            });

            var chartOptions = {
                bindto: '#chart',
                point: {
                    r: 3
                },
                data: {
                    columns: parsedParsed,
                    type: 'scatter'
                },
                grid: {
                    y: {
                        show: true,
                        lines: means
                    }
                },
                axis: {
                    x: {
                        min: 1
                    }
                }
            }
            self.drawChart(chartOptions);
        };
        Papa.parse(csv, this.papaOptions);
    },

    successRate: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        this.papaOptions.complete = function(results, file) {
            var totals = [];
            var means = [];
            var dataCounter = 0;
            var groups = [];

            var zipped = _.zip.apply(_, results.data);
            _.each(zipped, function(val, index) {
                dataCounter += 1
                totals[index] = 0;

                // Detect whether data has a heading or not
                var heading = "";
                if (!functions.matchTime(val[0]).isMatch) {
                    heading = val.shift(0);
                    groups.push(heading);
                }
                // parse and clean input
                _.each(val, function(v, i) {
                    totals[index] += +v;
                });

                var mean = totals[index] / val.length;
                mean = +mean.toFixed(2);

                means[index] = [
                    mean
                ];

                means[index].unshift(heading || 'Data ' + dataCounter);
            });

            var chartOptions = {
                bindto: '#chart',
                point: {
                    r: 5
                },
                data: {
                    columns: means,
                    type: 'bar'
                },
            }
            self.drawChart(chartOptions);
        };
        Papa.parse(csv, this.papaOptions);
    },

    drawChart: function(options) {
        var chart = c3.generate(options);
    },

    init: function() {
        var self = this;
        $(".visualize-btn").click(function() {
            self.buttonClicked();
        });

        var codeContainer = $("#codeMirrorMain")[0];
        this.$codeMirror = CodeMirror(codeContainer, {
            mode: 'text/plain',
            lineNumbers: true
        });

        this.papaOptions = {
            delimeter: ',', // IDEA: give option to set delimeter
            newline: '',
            quoteChar: '""',
            header: false,
            dynamicTyping: false,
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            complete: undefined,
            error: undefined,
            download: false,
            skipEmptyLines: true
        };
    },

    buttonClicked: function() {
        var selected = $('#dataType').find(':selected').val();
        switch (selected) {
            case "1":
                this.completionTime();
                break;
            case "2":
                this.successRate();
                break;
            case "3":
                break;
            case "4":
                break;
            case "5":
                break;
            default:
                console.log("No data type selected");
                break;
        };
    }
};

(function() {
    UXVisualiser.init();
})();
