import PQueue from 'p-queue';
import { Folder } from './defs.ts';
import { gapi } from 'gapi-script';

export const walkDrive = async (
    setData: (folder: Folder) => void,
): Promise<void> => {
    const updateStateEveryMillis = 1000;
    const concurrency = 10;
    const pageSize = 1000;

    const queue = new PQueue({ concurrency: concurrency });
    const rootFolder: Folder = { name: 'root', size: 0, subfolders: [] };

    // Throttle state updates.  These trigger potentially expensive rendering. Garbage
    // collection has been observed not to keep up with the rate of memory allocations,
    // resulting in crashing tabs.
    const intervalId = window.setInterval(() => {
        setData({ ...rootFolder });  // Shallow copy to ensure a state change is registered.
    }, updateStateEveryMillis);

    const processFolder = async (folderId: string, folder: Folder) => {
        let nextPageToken: string | undefined = undefined;
        do {
            const response = await gapi.client.drive.files.list({
                q: `'${folderId}' in parents`,
                fields: 'nextPageToken, files(id, name, mimeType, quotaBytesUsed)',
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
                .filter((file) => file.quotaBytesUsed)
                .map((file) => parseInt(file.quotaBytesUsed!, 10) || 0);
            folder.size += fileSizes.reduce((a: number, b: number) => a + b, 0);
        } while (nextPageToken);
    };

    queue.add(async () => await processFolder('root', rootFolder));
    await queue.onIdle();
    clearInterval(intervalId);
    setData(rootFolder);
};
