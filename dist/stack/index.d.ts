declare const _default: {
    fixture: (connection: any, file: string) => Promise<void>;
    integration: (createServer: Function, scrubPaths: (string | import("../scrubber").ScrubEntry)[], fixturePath: string) => (desc: string, fn: Function) => void;
};
export default _default;
