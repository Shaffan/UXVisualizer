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
                    displayModeBar: true
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
                    autorange: true
                },
                yaxis: {
                    autorange: true
                },
                shapes: []
            };

            var data = [];
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
            // TODO: validation

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

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
                        name: headings[index],
                        type: 'bar',
                    });
                });

                if (valid) {
                    Plotly.newPlot('chart', data, {
                        displayModeBar: true
                    });
                } else {
                    functions.showError('Please ensure that the data contains no letters apart from the headings');
                }
            } else if (results.data[0].length > 3) {
                var analysedData = functions.calcSuccessRate(results.data);

                _.each(analysedData.results, function(rates, key) {
                    _.each(rates, function(v, i) {
                        rates[i] = v + '%';
                    });
                    data.push({
                        x: analysedData.tasks,
                        y: rates,
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
                        displayModeBar: true
                    });
                } else {
                    functions.showError('Please ensure that the data contains no letters apart from the headings');
                }
            } else {
                self.scatter('', false);
            }
        }

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        }
    },

    confusionMatrix: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        config.papaConfig.complete = function(results, file) {
            var data = [];
            var valid = true;
            var datasetCounter;
            var zippedParsed = [];
            var parsedParsed = [];
            // TODO: validation

            if (results.errors.length > 0) {
                functions.handlePapaError(results.errors);
            }

            var layout = {
                displayModeBar: true,
                hovermode: 'closest',
            };

            var op = determineOp(results.data);
            switch (op) {
                case 1:
                    compareSets();
                    break;
                case 2:
                    compareUnknown();
                    break;
                default:
                    recall();
                    break;
            };

            function compareSets() {
                // isolate and remove headings
                var headings = results.data.shift(0);
                var groups = [];

                _.each(results.data, function(val, index) {
                    if (val[0] === '') {
                        datasetCounter = (typeof datasetCounter !== 'undefined') ? datasetCounter + 1 : 0;
                        if (val[1] === '') {
                            functions.showError('Failed to distinguish dataset name. Please consult the examples page to ensure you are using the correct format for this graph.');
                        }
                        groups.push(val[1]);
                        parsedParsed[datasetCounter] = [];
                    } else {
                        if (parsedParsed[datasetCounter]) {
                            parsedParsed[datasetCounter].push(val);
                        } else {
                            functions.showError('Encountered unexpected error while parsing your data. Please contact the developer');
                        }
                    }
                });

                _.each(parsedParsed, function(val, index) {
                    zippedParsed.push(_.zip.apply(_, val));
                });

                _.each(zippedParsed, function(val, index) {
                    data.push({
                        x: val[0],
                        y: val[1],
                        name: headings[1] + ' (' + groups[index] + ')',
                        type: 'markers',
                    });
                    data.push({
                        x: val[0],
                        y: val[2],
                        name: headings[2] + ' (' + groups[index] + ')',
                        type: 'markers',
                    });
                });
            };
            // TODO: rename later
            function compareUnknown() {

                // isolate and remove headings
                var headings = results.data.shift(0);

                var zipped = _.zip.apply(_, results.data);
                _.each(zipped, function(val, index) {
                    _.each(val, function(v, i) {
                        // check if values - apart from headings - contain letters
                        if (index > 0 && v.match(/[a-z]/i)) {
                            valid = false;
                        }
                    });
                });

                headings.shift(0);
                var xAxis = zipped.shift(0);
                _.each(zipped, function(val, index) {
                    data.push({
                        x: xAxis,
                        y: val,
                        name: headings[index],
                        type: 'line'
                    });
                });
            }

            function recall() {
                layout.title = 'Recall';
                // isolate and remove headings
                var headings = results.data.shift(0);

                var zipped = _.zip.apply(_, results.data);
                _.each(zipped, function(val, index) {
                    _.each(val, function(v, i) {
                        // check if values - apart from headings - contain letters
                        if (index > 0 && v.match(/[a-z]/i)) {
                            valid = false;
                        }
                    });
                });

                headings.shift(0);
                data.push({
                    x: zipped[1],
                    y: zipped[0],
                    name: 'Recall',
                    type: 'lines'
                })
            }

            if (valid) {
                Plotly.newPlot('chart', data, layout);
            } else {
                functions.showError('Please ensure that the data contains no letters apart from the headings');
            }
        }
        // determine which graph to generate based on data format
        function determineOp(data) {
            if (data[1][0] === '') {
                return 1;
            } else if (data[0][0] === '') {
                return 2;
            } else {
                return 3;
            }
        };

        if (csv !== '') {
            Papa.parse(csv, config.papaConfig);
        } else {
            // change this
            functions.showError('Please submit some data for the graph');
        };
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
            case "ser":
                self.successRate();
                break;
            case "ae":
                self.averageErrors();
                break;
            case "cf":
                self.confusionMatrix();
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
