var Tool = (function () {
    function Tool(shell) {
        this.shell = shell;
    }
    Tool.prototype.exec = function (command, arguments) {
        return this.shell.exec(command, arguments);
    };
    return Tool;
})();

module.exports = Tool;
