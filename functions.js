var functions = {
    isolateTime: function() {

        var result = value,
            minutes = /([0-9]+\.?[0-9]*)\s?(minutes|mins?|m\s?)/i,
            seconds = /([0-9]+\.?[0-9]*)\s?(seconds|secs?|s\s?)/i,
            numbers = /[0-9]+\.?[0-9]*/i,
            matchesMinutes = minutes.exec(value),
            matchesSeconds = seconds.exec(value),
            matchesNumbers = numbers.exec(value);

        var minMatch = matchesMinutes !== null && matchesMinutes.length;
        var secMatch = matchesSeconds !== null && matchesSeconds.length;
        var numMatch = matchesNumbers !== null && matchesNumbers.length;

        if (minMatch) {
            result = matchesMinutes[1] * 60;
        }
        if (minMatch && secMatch) {
            result += +matchesSeconds[1];
        } else if (secMatch) {
            result = matchesSeconds[1];
        }
        if (!minMatch && !secMatch && numMatch) {
            result = matchesNumbers[0];
        }
        return result;
    }
};
