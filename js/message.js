var Message = (function () {
    function Message(operation, message, type) {
        this.operation = operation;
        this.message = message;
        this.type = type;
    }
    Message.prototype.getOperation = function () {
        return this.operation;
    };
    Message.prototype.getType = function () {
        return this.type;
    };
    Message.prototype.getMessage = function () {
        return this.message;
    };

    Message.InProgress = 1;
    Message.Success = 2;
    Message.Error = 3;
    return Message;
})();

module.exports = Message;
