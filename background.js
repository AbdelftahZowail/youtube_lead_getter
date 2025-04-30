chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, { action: "downloadCSV" }, (response) => {
    if (!response || response.status === "noSelection") {
      console.log("No checkboxes selected. Perform alternative actions here.");
      const inputString = prompt('Enter strings separated by new lines:');
      if (inputString) {
          const newStrings = inputString.split('\n').map(str => str.trim().toLowerCase()).filter(str => str !== '');
          addStringToList(newStrings);
      }
    }
  });
});

chrome.browserAction.onClicked.addListener(function (tab) {
});
function addStringToList(newStrings) {
  chrome.storage.sync.get({ strings: [] }, function (result) {
    chrome.storage.sync.set({ strings: result.strings.concat(newStrings) }, function () {});
    printList();
    const data = result.strings.concat(newStrings).join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: 'output.txt',
      saveAs: true
    });
  });
}
function removeStringFromList(newStrings) {
  chrome.storage.sync.get({ strings: [] }, function (result) {
    const currentStrings = result.strings;
    const updatedStrings = currentStrings.filter(item => !newStrings.includes(item));
    chrome.storage.sync.set({ strings: updatedStrings }, function () {});
    printList();
    const data = updatedStrings.join('\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: 'output.txt',
      saveAs: true
    });
  });
}

function printList() {
  chrome.storage.sync.get({ strings: [] }, function (result) {
    console.log('all: ', result);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getData") {
    var list = [];
    console.log('start....')
    chrome.storage.sync.get({ strings: [] }, function (result) {
        console.log('got list', result.strings)
        list = result.strings;
        console.log('returning....');
        sendResponse({list});    
    });
    return true;
  }
});