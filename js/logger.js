var chalk = require('chalk');
var Message = require('./message');

var Logger = (function () {
    function Logger() {
    }
    Logger.prototype.log = function (message) {
        var date = new Date();
        var timeString = addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ':' + addZero(date.getSeconds()) + '.' + date.getMilliseconds();
        var status = '';
        if (message.getType() === Message.Error) {
            status = String(chalk.red('ER'));
        } else if (message.getType() === Message.Success) {
            status = String(chalk.green('OK'));
        } else if (message.getType() === Message.InProgress) {
            status = String(chalk.blue('->'));
        }
        console.log(chalk.gray(timeString) + ' [' + status + '] ' + '[' + chalk.magenta(message.getOperation()) + '] ' + message.getMessage());
    };
    return Logger;
})();

function addZero(num) {
    if (num < 10) {
        return '0' + String(num);
    } else {
        return String(num);
    }
}

module.exports = Logger;
