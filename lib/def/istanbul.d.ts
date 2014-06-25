declare module 'istanbul' {
    class Instrumenter {
        coverState: Object;
        instrumentSync(data: string, filename: string);
    }
}
