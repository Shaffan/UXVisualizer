'use strict'
var UXVisualiser = {
    papaOptions: null,
    $codeMirror: null,
    lastOp: null,

    completionTime: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        this.papaOptions.complete = function(results, file) {
            var parsedParsed = [];
            var totals = [];
            var means = [];
            var headings = [];
            var dataCounter = 0;

            var zipped = _.zip.apply(_, results.data);
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

                means[index] = mean;

                headings.push(heading || 'Data ' + dataCounter);
            });

            var layout = {
                xaxis: {
                    autorange: true
                },
                yaxis: {
                    autorange: true
                },
                shapes: []
            };

            var data = [];
            _.each(parsedParsed, function(val, index) {
                data.push({
                    x: _.map(val, function(v, i) {
                        return i + 1;
                    }),
                    y: val,
                    mode: 'markers',
                    type: 'scatter',
                    name: headings[index],
                    marker: {
                        size: 10
                    }
                });
                data.push({
                    x: [Math.max.apply(Math, data[index].x) - 5,
                        Math.max.apply(Math, data[index].x) - 1
                    ],
                    y: [means[index], means[index]],
                    text: ['Mean: ' + means[index]],
                    mode: 'text',
                    showlegend: false
                });
                layout.shapes.push({
                    type: 'line',
                    x0: 1,
                    y0: means[index],
                    x1: val.length + 1,
                    y1: means[index]
                });
            });
            Plotly.newPlot('chart', data, layout);
        };
        Papa.parse(csv, this.papaOptions);
    },

    successRate: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        this.papaOptions.complete = function(results, file) {
            // TODO: validation

            var totals = [];
            var means = [];
            var dataCounter = 0;
            var groups = [];
            var headings = [];

            var zipped = _.zip.apply(_, results.data);
            _.each(zipped, function(val, index) {
                dataCounter += 1
                totals[index] = 0;
                headings[index] = [];

                // Detect whether data has a heading or not
                var heading = "";
                if (!functions.matchTime(val[0]).isMatch) {
                    heading = val.shift(0);
                }
                headings[index] = (heading || 'Data ' + dataCounter);

                // calculate means
                totals[index] = _.reduce(val, function(sum, n) {
                    return sum + n;
                }, 0);

                var mean = totals[index] / val.length;
                mean = +mean.toFixed(2);
                means[index] = [
                    mean
                ];
            });

            var data = [];
            _.each(means, function(val, index) {
                data.push({
                    x: _.map(means[index], function(v, i) {
                        return i + 1
                    }),
                    y: means[index],
                    type: 'bar',
                    name: headings[index]
                });
            })

            Plotly.newPlot('chart', data);
        };
        Papa.parse(csv, this.papaOptions);
    },

    test: function() {
        var self = this;
        var csv = this.$codeMirror.doc.getValue();
        this.papaOptions.complete = function(results, file) {
            // TODO: validation

            var means = [];
            var totals = [];
            var data = [];

            // isolate and remove headings
            var headings = results.data.shift(0);

            // if the top left corner is empty
            if (headings[0] === "") {
                var groupComps = {};
                _.each(results.data, function(val, index) {
                    groupComps[val[0]] = groupComps[val[0]] || [];

                    groupComps[val[0]].push(index);
                });

                var zipped = _.zip.apply(_, results.data);
                // isolate and remove group-names
                var groups = zipped.shift(0);

                headings.shift(0);
                _.each(zipped, function(val, index) {
                    data.push({
                        x: groups,
                        y: val,
                        name: headings[index],
                        type: 'bar'
                    });
                });

                Plotly.newPlot('chart', data);
            }


        };
        Papa.parse(csv, this.papaOptions);
    },

    init: function() {
        var self = this;

        self.initFileSubmit();
        self.initButtons();

        // move to initCodeMirror
        var codeContainer = $("#codeMirrorMain")[0];
        this.$codeMirror = CodeMirror(codeContainer, {
            mode: 'text/plain',
            lineNumbers: true,
        });
        this.$codeMirror.on("change", function(cm, change) {
            self.buttonClicked({
                id: self.lastOp
            });
        });
        $(this.$codeMirror.getWrapperElement()).hide();

        // TODO: possibly move to config file if the need arises
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

        console.log('UXVisualiser: initialised');
    },

    initButtons: function() {
        var self = this;

        $(".toggle").click(function() {
            self.buttonClicked(this)
        });

        var selected = $('#dataType').find(':selected').val();

    },

    buttonClicked: function(caller) {
        var self = this;

        // If the button was actually clicked toggle the classes; otherwise it is redoing the previous operation and do nothing
        if (caller.nodeType === 1) {
            $(".toggle").removeClass('button-primary');
            $(caller).addClass('button-primary');
        }
        self.lastOp = caller.id;

        switch (caller.id) {
            case "ct":
                self.completionTime();
                break;
            case "ser":
                self.test();
                break;
            case "ae":
                break;
            case "cf":
                break;
            default:
                console.log("No data type selected");
                break;
        };
    },

    // Curtesy of https://css-tricks.com/drag-and-drop-file-uploading/
    initFileSubmit: function() {
        var self = this;
        var $form = $('.box');
        var droppedFiles = false;

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
                    reset();
                    droppedFiles = e.originalEvent.dataTransfer.files;
                    fileToCodeMirror(droppedFiles[0]);
                });
        };

        $('#file').change(function() {
            reset();
            var submittedFile = this.files[0];
            fileToCodeMirror(submittedFile);
        });

        function fileToCodeMirror(file) {
            if (config.ALLOWED_FILETYPES.indexOf(file.type) !== -1) {
                var csv;
                self.papaOptions.complete = function(results, file) {
                    csv = _.reduce(results.data, function(sum, n) {
                        return sum + n + "\n";
                    }, "");
                    self.$codeMirror.doc.setValue(csv);
                };
                Papa.parse(file, self.papaOptions);
                fileSubmitted();
            } else {
                window.alert('Unsupported file type');
                // add message to user - make error div visible etc
            }
        };

        function fileSubmitted() {
            $(self.$codeMirror.getWrapperElement()).show();
            $('.box').hide();
            $('.button-div').show();
        };

        function reset() {
            self.$codeMirror.doc.setValue('');
            Plotly.purge('chart');
            $(".toggle").removeClass('button-primary');
        };
    },
};

(function() {
    UXVisualiser.init();
})();
