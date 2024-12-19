import PQueue from 'p-queue';
import { Folder } from './defs.ts';
import { gapi } from 'gapi-script';

export const walkDrive = async (
    setData: (folder: Folder) => void,
): Promise<void> => {
    const updateStateEvery = 100;
    const concurrency = 10;
    const pageSize = 1000;

    const queue = new PQueue({ concurrency: concurrency });
    const rootFolder: Folder = { name: 'root', size: 0, subfolders: [] };
    let processedEntries = 0;

    const processFolder = async (folderId: string, folder: Folder) => {
        let nextPageToken: string | undefined = undefined;
        do {
            const response = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'nextPageToken, files(id, name, mimeType, size)',
                pageSize: pageSize,
                pageToken: nextPageToken,
            });

            nextPageToken = response.result.nextPageToken;
            const files = response.result.files || [];
            files
                .filter((file) => file.mimeType === 'application/vnd.google-apps.folder')
                .map((file) => queue.add(async () => {
                    const newFolder: Folder = { name: file.name || '', size: 0, subfolders: [] };
                    folder.subfolders.push(newFolder);
                    await processFolder(file.id || '', newFolder);
                }));

            const fileSizes: number[] = files
                .filter((file) => file.size)
                .map((file) => parseInt(file.size!, 10) || 0);
            folder.size += fileSizes.reduce((a: number, b: number) => a + b, 0);

            processedEntries += files.length;
            if (processedEntries >= updateStateEvery) {
                setData({ ...rootFolder });  // Shallow copy to ensure a state change is registered.
                await new Promise(resolve => setTimeout(resolve, 1000));
                processedEntries = 0;
            }
        } while (nextPageToken);
    };

    queue.add(async () => await processFolder('root', rootFolder));
    await queue.onIdle();
    setData(rootFolder);
};
