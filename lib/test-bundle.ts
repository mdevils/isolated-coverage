class TestBundle {
    constructor(private testFile: string, private sources: string[]) {}

    getTestFile(): string {
        return this.testFile;
    }

    getSources(): string[] {
        return this.sources;
    }

    getBase(): string {
        return this.getTestFile().replace(/\.test\.js$/, '');
    }
}

export = TestBundle;
