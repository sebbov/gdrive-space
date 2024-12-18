export interface Folder {
    name: string;
    subfolders: Folder[];
    size: number;
    filesSize: number;
    filesCount: number;
}
