class Message {
    constructor(private operation: string, private message: string, private type: number) {}
    public getOperation(): string {
        return this.operation;
    }
    public getType(): number {
        return this.type;
    }
    public getMessage(): string {
        return this.message;
    }

    public static InProgress = 1;
    public static Success = 2;
    public static Error = 3;
}

export = Message
