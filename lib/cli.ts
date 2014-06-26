///<reference path='defs.d.ts' />

import Message = require('./message');
import Logger = require('./logger');
import IsolatedCoverage = require('./isolated-coverage');

var logger = new Logger();
var isolatedCoverage = new IsolatedCoverage();
var inputArguments = process.argv.slice(2);

while (inputArguments.length > 0) {
    var argName = inputArguments.shift();
    var argVal = inputArguments.shift();
    switch (argName) {
        case '-s':
        case '--source':
            isolatedCoverage.addSourcePath(argVal);
            break;
        case '-r':
        case '--run':
            isolatedCoverage.setRunCommand(argVal);
            break;
        case '-b':
        case '--build':
            isolatedCoverage.setBuildCommand(argVal);
            break;
        case '-t':
        case '--threads':
            isolatedCoverage.setThreadCount(parseInt(argVal));
            break;
        case '-i':
        case '--ignore':
            isolatedCoverage.addIgnore(argVal);
            break;
        case '-R':
        case '--reporter':
            isolatedCoverage.setReporter(argVal);
            break;
    }
}

isolatedCoverage
    .run()
    .progress((message: Message) => {
        logger.log(message);
    })
    .done();
