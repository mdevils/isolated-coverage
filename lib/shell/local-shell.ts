import vow = require('vow');
import child_process = require('child_process');
import Shell = require('./shell');
import Message = require('../message');

class LocalShell implements Shell {
    private directory: string;

    constructor(directory?: string) {
        this.directory = directory;
    }

    exec(command: string, args?: string[]): vow.Promise {
        args = args || [];
        return this.execCommandLine(command + ' ' + args.map(this.escape).join(' '))
    }

    execCommandLine(commandLine: string): vow.Promise {
        var defer = new vow.Deferred();
        var localExecCommand;
        if (this.directory) {
            localExecCommand = 'cd ' + this.escape(this.directory) + ' && ' + commandLine;
        } else {
            localExecCommand = commandLine;
        }
        process.nextTick(() => {
            defer.notify(new Message('shell', commandLine, Message.InProgress));
        });
        child_process.exec(localExecCommand, (error, stdout, stderr) => {
            if (error) {
                defer.notify(new Message('shell', commandLine, Message.Error));
                console.log(String(stdout) + '\n' + String(stderr));
                defer.reject(new Error(
                    String(stdout) + '\n' + String(stderr)
                ));
            } else {
                defer.notify(new Message('shell', commandLine, Message.Success));
                defer.resolve(stdout.toString().trim());
            }
        });
        return defer.promise();
    }

    escape(val:string): string {
        return '\'' + val.replace(/\'/g, "'\\''") + '\'';
    }
}

export = LocalShell
