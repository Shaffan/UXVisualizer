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
    }
};
