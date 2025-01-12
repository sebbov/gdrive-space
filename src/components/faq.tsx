const FAQ = ({ goTo }: { goTo: (options: { path?: string; fragment?: string }) => void }) => (
    <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>

        <div className="space-y-4">
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">What is Galaxy Drive Space?</h3>
                <p className="text-gray-300 mb-4">
                    Galaxy Drive Space is a web application that allows you to easily explore your Google Drive folders and gain insights into your storage usage directly within your browser.
                    A typical use case is to identify and clean up unused or duplicate files to free up valuable storage space.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">Is Galaxy Drive Space safe?</h3>
                <p className="text-gray-300 mb-4">
                    Yes, Galaxy Drive Space prioritizes your data security. All data processing and storage related to your Google Drive interaction occur entirely within your web browser.
                    Galaxy Drive Space itself does not store any of your file data or personal information. See our <a href="#" onClick={() => goTo({ path: "/privacy" })} className="underline">privacy policy</a> for more details.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">How do I use Galaxy Drive Space?</h3>
                <ul className="list-disc pl-4 mb-4">
                    <li className="text-gray-300 mb-1">
                        Connect to Google Drive: Authorize Galaxy Drive Space to access your Google Drive account.
                    </li>
                    <li className="text-gray-300 mb-1">
                        Galaxy Drive Space will then start a scan of all file information in your Drive. This process may take a few minutes, especially for large drives.
                    </li>
                    <li className="text-gray-300 mb-1">
                        Explore your folders and visualize how your storage space is being used.
                    </li>
                    <li className="text-gray-300 mb-1">
                        For more detailed information about specific files or folders, click on them to view details within the Google Drive UI.
                    </li>
                    <li className="text-gray-300 mb-1">
                        To perform another scan, simply reload the Galaxy Drive Space page and click Start.
                    </li>
                    <li className="text-gray-300 mb-1">
                        When you are finished exploring, revoke access to Galaxy Drive Space within the application, or in your Google Account settings.
                    </li>
                </ul>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">Can I access my files within Galaxy Drive Space?</h3>
                <p className="text-gray-300 mb-4">
                    No, Galaxy Drive Space is primarily a folder storage exploration tool.
                    For accessing files, Galaxy Drive Space links to the Google Drive UI where you can open files, trash files, etc.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">I cleaned up files in a folder, but my storage usage in Galaxy Drive Space hasn't changed.</h3>
                <p className="text-gray-300 mb-4">
                    Storage used by the folder is only released once you empty your <a href="https://drive.google.com/drive/u/0/trash" className="text-blue-400 underline">Google Drive trash</a>.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">How does Galaxy Drive Space compare to other solutions?</h3>
                <p className="text-gray-300 mb-4">
                    Galaxy Drive Space runs entirely within your web browser, eliminating the need to install any software or sync your Drive storage to your local computer. It is also free. Functionality is relatively basic though.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">Does Galaxy Drive Space support other cloud storage services like Dropbox, OneDrive, or iCloud?</h3>
                <p className="text-gray-300 mb-4">
                    No. But this sounds feasible. See also next question.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">I'd like Galaxy Drive Space to do something it doesn't currently support.</h3>
                <p className="text-gray-300 mb-4">
                    If you have a feature request or suggestion, please contact us at <a href="mailto:info@gdrive.space" className="text-blue-400 underline">info@gdrive.space</a>. However, we will not be expanding the range of data Galaxy Drive Space reads from your Drive (i.e., more than just metadata) or where that data is handled (i.e., more than just in browser memory).  This is because we prioritize careful security practices to ensure your data is always protected.

                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-1">Is Galaxy Drive Space free?</h3>
                <p className="text-gray-300 mb-4">
                    Yes, Galaxy Drive Space is completely free to use. Enjoy! If it is useful to you and you want to thank us, a donation to keep the site up is appreciated - <a href="https://ko-fi.com/unimplementedllc" className="text-blue-400 underline">https://ko-fi.com/unimplementedllc</a>.
                </p>
            </div>
        </div>

    </div>
);

export default FAQ;
