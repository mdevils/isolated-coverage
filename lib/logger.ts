import chalk = require('chalk');
import Message = require('./message');

class Logger {
    log(message: Message) {
        var date = new Date();
        var timeString = addZero(date.getHours()) +
            ':' + addZero(date.getMinutes()) +
            ':' + addZero(date.getSeconds()) +
            '.' + date.getMilliseconds();
        var status = '';
        if (message.getType() === Message.Error) {
            status = String(chalk.red('ER'));
        } else if (message.getType() === Message.Success) {
            status = String(chalk.green('OK'));
        } else if (message.getType() === Message.InProgress) {
            status = String(chalk.blue('->'));
        }
        console.log(
            chalk.gray(timeString) +
            ' [' +
            status +
            '] ' +
            '[' +
            chalk.magenta(message.getOperation()) +
            '] ' +
            message.getMessage()
        );
    }
}

function addZero(num: number) {
    if (num < 10) {
        return '0' + String(num);
    } else {
        return String(num);
    }
}


export = Logger
