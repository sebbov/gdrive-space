export interface Folder {
    name: string;
    fileId: string;
    size: number;
    subfolders: Folder[];
}
