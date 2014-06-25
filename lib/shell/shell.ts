import vow = require('vow');

interface Shell {
    exec(command: String, args?: String[]): vow.Promise;
    execCommandLine(commandLine: String): vow.Promise;
    escape(val: string): string;
}

export = Shell
