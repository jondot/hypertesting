export interface ScrubEntry {
    path: string;
    regex: string;
    filler: string;
}
declare const scrubber: (paths: (string | ScrubEntry)[], filler?: string) => (obj: any) => any;
export default scrubber;
