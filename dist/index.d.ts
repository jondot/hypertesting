export declare type CreateAppAsyncFn = () => Promise<{
    app: any;
    closeApp: () => void;
}>;
export interface RequestInfo {
    id: string;
    path: string;
    method: string;
    desc: string;
    body?: any;
    headers?: any;
    query?: any;
}
export interface ResultInfo {
    header?: any;
    status?: number;
    text?: string;
    req: {
        data?: any;
        headers?: any;
        method: string;
        url: string;
    };
}
export interface HypertestDefinedOpts {
    scrubResult: (result: ResultInfo) => ResultInfo;
    formatTitle: (testfile: string, currentRequest: RequestInfo) => string;
    serializer: (value: ResultInfo, serialize: Function, indent: Function) => string;
    announce: (currentRequest: RequestInfo) => void;
    expect: any;
}
export interface HypertestOpts {
    scrubResult?: (result: ResultInfo) => ResultInfo;
    formatTitle?: (testfile: string, currentRequest: RequestInfo) => string;
    serializer?: (value: ResultInfo, serialize: Function, indent: Function) => string;
    announce?: (currentRequest: RequestInfo) => void;
    expect?: any;
}
declare const defaultScrubber: (result: ResultInfo) => ResultInfo;
declare const defaultOpts: HypertestDefinedOpts;
declare const hypertest: (createApp: CreateAppAsyncFn, opts?: HypertestOpts) => (folder: string) => Promise<void>;
export { defaultOpts, defaultScrubber };
export default hypertest;
