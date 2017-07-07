'use strict'
var UXVisualiser = {
    $codeMirror: null,
    lastOp: null,

    completionTime: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        config.papaConfig.complete = function(results, file) {
            var totals = [];
            var means = [];
            var dataCounter = 0;
            var valid = true;
            var analysedData = {
                results: {}
            };
            var layout = {
                title: 'Average completion time',
                hovermode: 'closest',
                displayModeBar: true,
                bargap : 0.01,
                xaxis: {
                    showgrid: false,
                },
                yaxis: {
                    gridcolor: '#b3b3b3',
                },
            };

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            if (results.data[0].length > 2) {
                results.data.shift(0);
                analysedData = functions.calcCompletionTime(results.data);
                layout.barmode = 'group';
            } else {
                _.each(zipped, function(val, index) {
                    var heading = val.shift(0);
                    analysedData.results[heading] = {};
                    analysedData.results[heading][0] = [];
                    analysedData.tasks = [0];
                    dataCounter += 1
                    totals[index] = 0;

                    // parse and clean input
                    _.each(val, function(v, i) {
                        // check for unexpected values
                        if (v !== "") {
                            var time = functions.isolateTime(v);
                            totals[index] += time;
                        }
                    });
                    var mean = totals[index] / val.length;
                    mean = +mean.toFixed(2);

                    analysedData.results[heading][0].push(mean);
                });
            }

            var data = [];

            _.each(analysedData.results, function(means, key) {
                data.push({
                    x: analysedData.tasks,
                    y: means,
                    width: means.length / 10,
                    type: 'bar',
                    text: means,
                    textfont: {
                        color: 'black'
                     },
                    name: key,
                    textposition: 'auto',
                    hoverinfo: 'none',
                });
            });

            if (valid) {
                Plotly.newPlot('chart', data, layout);
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        };
        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    averageErrors: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();

        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            results.data.shift(0);
            var analysedData = functions.calcAverageErrors(results.data);

            _.each(analysedData.results, function(means, key) {
                data.push({
                    x: analysedData.tasks,
                    y: means,
                    width: means.length / 10,
                    type: 'bar',
                    text: means,
                    textfont: {
                        color: 'black'
                     },
                    name: key,
                    textposition: 'auto',
                    hoverinfo: 'none',
                });
            });
            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'Average errors',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
            // this.scatter('Average errors', true);
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    scatter: function(chartTitle, showMean, parseForTime) {
        showMean = (typeof showMean === 'undefined') ? true : showMean;
        parseForTime = (typeof parseForTime === 'undefined') ? false : parseForTime;
        chartTitle = (typeof chartTitle === 'undefined') ? '' : chartTitle;


        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        config.papaConfig.complete = function(results, file) {
            var parsedParsed = [];
            var totals = [];
            var means = [];
            var headings = [];
            var dataCounter = 0;
            var valid = true;

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            var zipped = _.zip.apply(_, results.data);

            _.each(zipped, function(val, index) {
                dataCounter += 1
                parsedParsed[index] = parsedParsed[index] || [];
                totals[index] = 0;

                // Detect whether data has a heading or not
                var heading = "";
                if (parseForTime) {
                    if (!functions.matchTime(val[0]).isMatch) {
                        heading = val.shift(0);
                    }
                } else {
                    heading = val.shift(0);
                }

                if (parseForTime) {
                    // parse and clean input
                    _.each(val, function(v, i) {
                        // check for unexpected values
                        if (v !== "") {
                            var time = functions.isolateTime(v);
                            totals[index] += time;
                            parsedParsed[index].push(time[0] || time);
                        }
                    });
                } else {
                    _.each(val, function(v, i) {
                        if (v !== "") {
                            totals[index] += +v;
                            parsedParsed[index].push(v);
                        }
                    })
                }

                var mean = totals[index] / parsedParsed[index].length;
                mean = +mean.toFixed(2);

                means[index] = mean;

                headings.push(heading || 'Data ' + dataCounter);
            });

            if (!parseForTime) {
                _.each(zipped, function(val, index) {
                    _.each(val, function(v, i) {
                        // check if values - apart from headings - contain letters
                        if (index > 0 && v.match(/[a-z]/i)) {
                            valid = false;
                        }
                    });
                });
            }

            var layout = {
                title: chartTitle,
                hovermode: 'closest',
                xaxis: {
                    autorange: true,
                    showgrid: false,
                },
                yaxis: {
                    autorange: true,
                    gridcolor: '#b3b3b3',
                },
                bargap : 0.01,
            };

            var data = [];
            _.each(zipped, function(val, index) {
                data.push({
                    x: _.map(val, function(v, i) {
                        return i + 1;
                    }),
                    y: val,
                    mode: 'markers',
                    type: 'scatter',
                    name: headings[index],
                    marker: {
                        size: 8
                    }
                });
            });

            if (showMean) {
                _.each(parsedParsed, function(val, index) {
                    var meanLine = [];
                    _.each(val, function(v, i) {
                        meanLine.push(means[index]);
                    });
                    data.push({
                        x: _.map(val, function(v, i) {
                            return i + 1;
                        }),
                        y: meanLine,
                        mode: 'lines',
                        name: 'Mean ' + '(' + headings[index] + ')',
                    })
                })
            }
            if (valid) {
                Plotly.newPlot('chart', data, layout, {
                    displayModeBar: true
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        };
        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    successRate: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            results.data.shift(0);
            // TODO: validation

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            var analysedData = functions.calcSuccessRate(results.data);
            _.each(analysedData.results, function(rates, key) {
                _.each(rates, function(v, i) {
                    rates[i] = v + '%';
                });
                data.push({
                    x: analysedData.tasks,
                    y: rates,
                    width: rates.length / 10,
                    type: 'bar',
                    text: rates,
                    textfont: {
                        color: 'black'
                    },
                    name: key,
                    textposition: 'auto',
                    hoverinfo: 'none',
                });
            });
            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'Success rate',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }

        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    errorRate: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();

        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            results.data.shift(0);

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            var analysedData = functions.calcErrorRate(results.data);
            _.each(analysedData.results, function(rates, key) {
                data.push({
                    x: analysedData.tasks,
                    y: rates,
                    width: rates.length / 10,
                    type: 'bar',
                    text: rates,
                    textfont: {
                        color: 'black'
                     },
                    name: key,
                    textposition: 'auto',
                    hoverinfo: 'none',
                });
            });
            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'Error rate',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
            // this.scatter('Average errors', true);
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    successErrorComparison: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        config.papaConfig.complete = function(results, file) {
            var means = [];
            var totals = [];
            var data = [];
            var valid = true;

            // isolate and remove headings
            var headings = results.data.shift(0);

            // if the top left corner is empty
            if (headings[0] === "") {
                var zipped = _.zip.apply(_, results.data);
                _.each(zipped, function(val, index) {
                    _.each(val, function(v, i) {
                        // check if values - apart from headings - contain letters
                        if (index > 0 && v.match(/[a-z]/i)) {
                            valid = false;
                        }
                    });
                });

                // isolate and remove group-names
                var groups = zipped.shift(0);

                headings.shift(0);
                _.each(zipped, function(val, index) {
                    data.push({
                        x: groups,
                        y: val,
                        width: groups.length / 10,
                        name: headings[index],
                        type: 'bar',
                    });
                });

                if (valid) {
                    Plotly.newPlot('chart', data, {
                        displayModeBar: true,
                        xaxis: {
                            showgrid: false,
                        },
                        yaxis: {
                            gridcolor: '#b3b3b3',
                        },
                    });
                } else {
                    functions.showError('Please ensure that the data contains no letters apart from the headings');
                }
            } else {
                self.scatter('', false);
            }
        };
        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    fMeasure: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();

        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            // results.data.shift(0);

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            var analysedData = functions.calcFMeasure(results.data);
            var xaxis = analysedData.data.shift(0);
            _.each(analysedData.data, function(values, i) {
                data.push({
                    x: xaxis,
                    y: values,
                    mode: 'lines+markers',
                    type: 'scatter',
                    name: analysedData.headings[i],
                    marker: {
                        size: 8
                    }
                });
            });
            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'F-Measure',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    recall: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();

        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            // results.data.shift(0);

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }


            var precisionRatings = functions.calcPrecision(results.data);
            precisionRatings.data.shift(0);
            var recalls = functions.calcRecall(results.data);
            recalls.data.shift(0);

            _.each(precisionRatings.data, function(val, i) {
                data.push({
                    x: recalls.data[i],
                    y: precisionRatings.data[i],
                    mode: 'lines+markers',
                    type: 'scatter',
                    name: precisionRatings.headings[i],
                    marker: {
                        size: 8
                    }
                });
            });

            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'Recall',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                        nticks: 10,
                        range: [0, 1]
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    precisionFPRComparison: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();

        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            // results.data.shift(0);

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }


            var precisionRatings = functions.calcPrecision(results.data);
            _.each(precisionRatings.headings, function(v, i) {
                precisionRatings.headings[i] = 'Precision ' + '(' + v + ')'
            });
            var xaxis = precisionRatings.data.shift(0);
            var fpRatings = functions.calcFPR(results.data);
            fpRatings.data.shift(0);

            var analysedData = {
                data: null,
                headings: null
            };
            analysedData.data = precisionRatings.data.concat(fpRatings.data);
            analysedData.headings = precisionRatings.headings.concat(fpRatings.headings);
            _.each(analysedData.data, function(values, i) {
                data.push({
                    x: xaxis,
                    y: values,
                    mode: 'lines',
                    type: 'scatter',
                    name: analysedData.headings[i],
                    marker: {
                        size: 8
                    }
                });
            });
            if (valid) {
                Plotly.newPlot('chart', data, {
                    title: 'F-Measure',
                    displayModeBar: true,
                    bargap : 0.01,
                    xaxis: {
                        showgrid: false,
                    },
                    yaxis: {
                        gridcolor: '#b3b3b3',
                        nticks: 10,
                        range: [0, 1]
                    },
                });
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    buttonClicked: function(caller) {
        var self = this;

        Plotly.purge('chart');

        // If the button was actually clicked toggle the classes; otherwise it is redoing the previous operation
        if (caller.nodeType === 1) {
            $(".toggle").removeClass('button-primary');
            $(caller).addClass('button-primary');
        } else {
            $("#" + caller.id).addClass('button-primary');
        }
        self.lastOp = caller.id;

        switch (caller.id) {
            case "ct":
                self.completionTime();
                break;
            case "sr":
                self.successRate();
                break;
            case "er":
                self.errorRate();
                break;
            case "ae":
                self.averageErrors();
                break;
            case "serc":
                self.successErrorComparison();
                break;
            case "fm":
                self.fMeasure();
                break;
            case "rc":
                self.recall();
                break;
            case "pfc":
                self.precisionFPRComparison();
                break;
            default:
                console.log("No data type selected");
                break;
        };
    },

    init: function() {
        var self = this;
        self.initCodeMirror();
        self.initFileSubmit();
        self.initButtons();

        console.log('UXVisualiser: initialised');
    },

    initCodeMirror: function() {
        var self = this;

        var codeContainer = $("#codeMirrorMain")[0];
        this.$codeMirror = CodeMirror(codeContainer, {
            mode: 'text/plain',
            lineNumbers: true,
        });
        this.$codeMirror.on("blur", function(cm, change) {
            $('#codeMirrorMain').css('border', 'none');
            if (self.$codeMirror.doc.getValue() === '') {
                self.reset();
            } else {
                self.buttonClicked({
                    id: self.lastOp
                });
            }
        });
        this.$codeMirror.on("focus", function(cm, change) {
            $('#codeMirrorMain').css('border', '1.5px solid skyblue');
        });
        $(this.$codeMirror.getWrapperElement()).hide();
    },

    initButtons: function() {
        var self = this;

        $(".toggle").click(function() {
            self.buttonClicked(this)
        });
        $(".logo-link").click(function() {
            window.location.reload(true);
        })
    },

    initFileSubmit: function() {
        var self = this;
        var $form = $('.box');
        var droppedFiles = false;

        $(window).on('paste', function(e) {
            fileSubmitted();
            self.$codeMirror.doc.setValue(e.originalEvent.clipboardData.getData('text'));
        });

        // Curtesy of https://css-tricks.com/drag-and-drop-file-uploading/
        if (functions.isAdvancedUpload()) {
            $form.addClass('has-advanced-upload');
            $('.box__dragndrop').addClass('has-advanced-upload');

            $(".container").on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                })
                .on('dragover dragenter', function() {
                    $form.addClass('is-dragover');
                })
                .on('dragleave dragend drop', function() {
                    $form.removeClass('is-dragover');
                })
                .on('drop', function(e) {
                    self.reset();
                    droppedFiles = e.originalEvent.dataTransfer.files;
                    fileToCodeMirror(droppedFiles[0]);
                });
        };

        $('#file').change(function() {
            self.reset();
            var submittedFile = this.files[0];
            fileToCodeMirror(submittedFile);
        });

        function fileToCodeMirror(file) {
            if (config.ALLOWED_FILETYPES.indexOf(file.type) !== -1) {
                var csv;
                config.papaConfig.complete = function(results, file) {
                    csv = _.reduce(results.data, function(sum, n) {
                        return sum + n + "\n";
                    }, "");
                    self.$codeMirror.doc.setValue(csv);
                };
                Papa.parse(file, config.papaConfig);
                fileSubmitted();
            } else {
                functions.showError('Unsupported file type');
            }
        };

        function fileSubmitted() {
            $(self.$codeMirror.getWrapperElement()).show();
            $('.box').hide();
            $('.button-wrapper').css('visibility', 'visible');
            $('.button-wrapper').show();
            $(window).off('paste');
        };
    },

    reset: function() {
        this.$codeMirror.doc.setValue('');
        Plotly.purge('chart');
        $(".toggle").removeClass('button-primary');
    },
};

(function() {
    UXVisualiser.init();
})();
