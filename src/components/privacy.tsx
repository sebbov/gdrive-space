const PrivacyPolicy = () => (
    <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

        <p className="text-gray-300 mb-4">
            This Privacy Policy explains how GDrive Space collects, uses, and discloses information about you when you use our web application.
            GDrive Space itself does not collect any personal information about you or your Google Drive files.

            Standard web servers, including the one used to host this app, automatically collect certain information from visitors.
            This is a common practice for any website and helps us understand how our website is being used and ensure its proper functioning.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-2">Server Logs</h2>
        <p className="text-gray-300 mb-4">
            These server logs may include your IP address, browser type, referring/exit pages, and platform.

            <span className="font-bold text-white m-1">This log data does not include any personal information about you, such as your name, email address, any information related to your Google Drive files, or activity within the GDrive Space app.</span>

            We use this information for website administration, troubleshooting, website analytics, and security purposes. We retain log data for 1 year.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-2">Data Storage and Security</h2>
        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Client-Side Only:</span> All data processing and storage related to your Google Drive interaction occur entirely within your web browser.
        </p>

        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Read-Only:</span> GDrive Space has no access to make changes to your Google Drive whatsoever.
        </p>

        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Metadata Only:</span> No Google Drive file contents are ever read. Only names, types and storage sizes of files are read.
        </p>

        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">No Data Persistence:</span> Data is not stored on our servers or any other location. It is temporary and will be deleted when you close your browser tab or reload the page.
        </p>

        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Browser Security:</span> The security of your data relies on the security of your web browser.
        </p>

        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Secure Communication:</span> All communication between your browser and Google's APIs for retrieving Drive metadata is encrypted using Secure Sockets Layer (SSL). SSL ensures that your data is transmitted securely and cannot be intercepted or tampered with by third parties.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-2">Access and Control</h2>
        <p className="text-gray-300 mb-4">
            <span className="font-bold text-white">Revoking Access:</span> You can revoke access to your Google Drive at any time by:
        </p>

        <ul className="list-disc pl-4 mb-4">
            <li className="text-gray-300 mb-1">
                <span className="font-bold text-white">In this app:</span> Click on the <span className="material-icons-outlined text-sm">logout</span> button (only displayed when signed in).
            </li>
            <li className="text-gray-300 mb-1">
                <span className="font-bold text-white">Disconnecting the app:</span> In your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google Account settings</a>, you can revoke access to GDrive Space.
            </li>
            <li className="text-gray-300">
                <span className="font-bold text-white">Clearing your browser data:</span> Clearing your browser's cookies and cache will effectively disconnect the app.
            </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-2">Changes to this Privacy Policy</h2>
        <p className="text-gray-300 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-2">Contact Us</h2>
        <p className="text-gray-300 mb-4">
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:info@gdrive.space" className="text-blue-400 underline">info@gdrive.space</a>.
        </p>

    </div>
);

export default PrivacyPolicy;
