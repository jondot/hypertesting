import { ScrubEntry } from '../scrubber';
declare const integration: (createServer: Function, scrubPaths: (string | ScrubEntry)[], fixturePath: string) => (desc: string, fn: Function) => void;
export default integration;
