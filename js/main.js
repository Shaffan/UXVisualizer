$(document).ready(function() {
    var $form = $('.box');

    if (isAdvancedUpload) {
        $form.addClass('has-advanced-upload');

        var droppedFiles = false;

        $form.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
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
                e.preventDefault();
                droppedFiles = e.originalEvent.dataTransfer.files;
                var file = document.getElementById('file');

                Papa.parse(droppedFiles[0], {
                    delimeter: ',', // give option to set delimeter
                    newline: '',
                    quoteChar: '""',
                    header: true,
                    dynamicTyping: false,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    complete: function(results, file) {
                        console.log("Parsing complete:", results);
                        var res = results;
                    },
                    error: undefined,
                    download: false,
                    skipEmptyLines: false,
                });
            });
    }
    var codeContainer = $("[name='codeMirrorMain']")[0];
    var newCodeMirror = CodeMirror(codeContainer, {
        value: 'Drag your CSV here',
        mode: 'text/plain',
        lineNumbers: true
    });
});

function drawChart(data) {
    var chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
                ['data1', 30, 200, 100, 400, 150, 250],
                ['data2', 50, 20, 10, 40, 15, 25]
            ]
        }
    });
}

function isAdvancedUpload() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
};
