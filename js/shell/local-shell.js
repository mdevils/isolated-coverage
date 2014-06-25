var vow = require('vow');
var child_process = require('child_process');

var Message = require('../message');

var LocalShell = (function () {
    function LocalShell(directory) {
        this.directory = directory;
    }
    LocalShell.prototype.exec = function (command, args) {
        args = args || [];
        return this.execCommandLine(command + ' ' + args.map(this.escape).join(' '));
    };

    LocalShell.prototype.execCommandLine = function (commandLine) {
        var defer = new vow.Deferred();
        var localExecCommand;
        if (this.directory) {
            localExecCommand = 'cd ' + this.escape(this.directory) + ' && ' + commandLine;
        } else {
            localExecCommand = commandLine;
        }
        process.nextTick(function () {
            defer.notify(new Message('shell', commandLine, Message.InProgress));
        });
        child_process.exec(localExecCommand, function (error, stdout, stderr) {
            if (error) {
                defer.notify(new Message('shell', commandLine, Message.Error));
                console.log(String(stdout) + '\n' + String(stderr));
                defer.reject(new Error(String(stdout) + '\n' + String(stderr)));
            } else {
                defer.notify(new Message('shell', commandLine, Message.Success));
                defer.resolve(stdout.toString().trim());
            }
        });
        return defer.promise();
    };

    LocalShell.prototype.escape = function (val) {
        return '\'' + val.replace(/\'/g, "'\\''") + '\'';
    };
    return LocalShell;
})();

module.exports = LocalShell;
