import vow = require('vow');
import Shell = require('./shell/shell');
import Message = require('./message');

class Tool {
    constructor(public shell: Shell) {}

    exec(command: string, arguments: string[]): vow.Promise {
        return this.shell.exec(command, arguments);
    }
}

export = Tool
