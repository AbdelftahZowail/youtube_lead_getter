# YouTube Leads Getter - Chrome Extension

This Chrome extension enhances the YouTube search results page to streamline the process of identifying and collecting potential channel leads, particularly for topics like real estate, marketing, etc. It allows users to:

1.  **Filter Existing Leads:** Automatically hide channels already present in a stored "exclusion list".
2.  **Select New Leads:** Manually select channels directly from the search results page.
3.  **Export Selected Leads:** Download a CSV file (`channels.csv`) containing the names and URLs of the manually selected channels.
4.  **Manage Exclusion List:** Add new channel names to the persistent exclusion list directly through the extension.

This tool is designed to complement lead analysis workflows, such as the one provided by the [youtube_leads_categorization](https://github.com/AbdelftahZowail/youtube_leads_categorization) project, by providing a clean input CSV.

## Features

*   **Exclusion Filtering:** Automatically hides video results from channels whose names (case-insensitive) are found in a persistent exclusion list stored using `chrome.storage.sync`. Hidden channels are marked visually (red background on the name).
*   **Manual Selection:** Adds a checkmark (`✔`) button next to each channel name in the search results (for channels not on the exclusion list).
*   **Visual Feedback & Hiding:** Clicking the checkmark selects the channel (button turns green), adds it to a temporary list for download, and hides the corresponding video result to declutter the view. Clicking again deselects it (button turns gray) and unhides the video.
*   **CSV Export:** Clicking the extension's browser action icon downloads a `channels.csv` file containing the `Name` and `URL` of all currently selected channels.
*   **Exclusion List Update:** If the browser action icon is clicked *when no channels are manually selected*, it prompts the user to paste a list of new channel names (one per line) to add to the persistent exclusion list. It then triggers a download of the *entire updated* exclusion list as `output.txt`.
*   **Dynamic Content Handling:** Uses `MutationObserver` to handle channels appearing in dynamically loaded YouTube search results (infinite scroll).

## How It Works

1.  **Content Script (`content.js`):**
    *   Runs on `youtube.com` pages.
    *   On page load/update, requests the current exclusion list from `background.js`.
    *   Uses `MutationObserver` to detect new video elements appearing on the page.
    *   For each channel link found:
        *   Checks if the channel name is in the exclusion list. If yes, hides the video result.
        *   If not excluded, adds a checkmark (`✔`) button next to the channel name.
        *   Handles button clicks to add/remove channels from the temporary `checkedChannels` list and toggles visibility.
    *   Listens for a message from `background.js` to trigger the CSV download process.
2.  **Background Script (`background.js`):**
    *   Listens for the browser action (extension icon) click.
    *   Sends a message to the active tab's `content.js` to initiate the download process.
    *   If `content.js` reports no channels were selected, it prompts the user to add new names to the exclusion list.
    *   Manages the persistent exclusion list using `chrome.storage.sync` (adds new names, retrieves the list for `content.js`).
    *   Handles the download trigger for the updated exclusion list (`output.txt`).
    *   Listens for messages from `content.js` requesting the exclusion list data.
3.  **Manifest (`manifest.json`):**
    *   Defines the extension's permissions (`storage` for the exclusion list, `downloads` for CSV/TXT export), background script, content script, and browser action icon.

## Installation

Since this extension is not on the Chrome Web Store, you need to load it manually:

1.  **Download:** Download the extension files (`manifest.json`, `background.js`, `content.js`, `Untitled.png`, etc.) and place them together in a single folder (e.g., `youtube-lead-helper`).
2.  **Open Chrome Extensions:** Open Google Chrome, type `chrome://extensions` in the address bar, and press Enter.
3.  **Enable Developer Mode:** Toggle the "Developer mode" switch in the top-right corner **on**.
4.  **Load Unpacked:** Click the "Load unpacked" button that appears.
5.  **Select Folder:** Navigate to and select the folder where you saved the extension files (e.g., `youtube-lead-helper`).
6.  **Done:** The extension should now appear in your list of extensions and its icon should be visible in your browser toolbar.

## Usage

1.  **Navigate to YouTube:** Go to `youtube.com` and perform a search (e.g., "real estate investing channels").
2.  **Automatic Filtering:** As results load, channels on your exclusion list will have their videos automatically hidden, and their names (if briefly visible) might flash red.
3.  **Select New Leads:** For channels you want to add as leads:
    *   Click the gray checkmark (`✔`) button next to the channel name.
    *   The button will turn green, and the video result will be hidden. The channel is now added to the temporary selection list.
    *   To deselect, find the video again (you might need to temporarily disable the extension or modify the script if hiding is too aggressive) or manage the selection before download. *(Note: Currently, un-hiding requires manual intervention or script modification after selection)*
4.  **Download Selected Leads:**
    *   Once you have selected the desired channels, click the extension's icon in your Chrome toolbar.
    *   A `channels.csv` file containing the `Name` and `URL` of the selected channels will be downloaded.
5.  **Add to Exclusion List:**
    *   Make sure **no channels are currently selected** (all checkmarks you clicked are gray or the channels are already excluded).
    *   Click the extension's icon in your Chrome toolbar.
    *   A prompt will appear asking for strings (channel names).
    *   Paste the channel names you want to add to the exclusion list, with each name on a new line.
    *   Click "OK".
    *   The names will be added to the persistent exclusion list in `chrome.storage.sync`.
    *   A file `output.txt` containing the *entire updated* exclusion list will be downloaded (useful for backup or verification).
    *   Reload the YouTube page or perform a new search to see the filtering applied to the newly added channels.

## Files Overview

*   `manifest.json`: Configures the Chrome extension (permissions, scripts, icons).
*   `background.js`: Handles storage, downloads, browser action logic, and communication.
*   `content.js`: Interacts with the YouTube page DOM, filters results, adds buttons, and collects selections.
*   `Untitled.png`: Icon displayed in the Chrome toolbar.
