console.log('lmaaaaaaaaaao: 0');
var first = true;
var list = [];
chrome.runtime.sendMessage({ action: "getData" }, (response) => {
  console.log('lmaaaaaaaaaao: 1: ', response.list);
  list = response.list;
});

var checkedChannels = new Map();
var pendingNodes = new Set();
var processingTimeout = null;


function updateButtons(name, checked) {
  document.querySelectorAll('.check-button[data-name="' + name + '"]').forEach(button => {
    button.dataset.checked = checked ? "true" : "false";
    button.style.background = checked ? 'green' : 'lightgray';
  });
}

function handleNewElement() {
  if (pendingNodes.size === 0) return;
  observer.disconnect(); // Stop observing temporarily
  pendingNodes.forEach(element => {
    if (element.hasAttribute("data-handled")) return; // Skip already handled elements
    element.setAttribute("data-handled", "true"); // Mark as handled
    var elements = document.querySelectorAll('yt-formatted-string:has(a[href])');
    elements.forEach(function(element) {
        if (element.hasAttribute("data-handled")) return; // Skip if already handled
        element.setAttribute("data-handled", "true"); // Mark as handled

        var childElement = element.querySelector('a');
        if (childElement) {
        var innerHTML = childElement.innerHTML.toLowerCase();
        var parentItem = element.closest('ytd-video-renderer');

        if (list.includes(innerHTML)) {
            element.style.backgroundColor = 'red';
            if (parentItem) parentItem.style.display = 'none';
            console.log('hiding: ', parentItem);
        } else {
            if (!element.querySelector('.check-button')) {
            var button = document.createElement('button');
            button.className = 'check-button';
            button.innerText = '✔';
            button.dataset.name = innerHTML;
            button.style.marginLeft = '5px';
            button.style.padding = '2px 6px';
            button.style.background = 'lightgray';
            button.style.border = '1px solid gray';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';

            button.addEventListener('click', function(event) {
                event.stopPropagation();
                event.preventDefault();

                let isChecked = button.dataset.checked === "true";
                if (isChecked) {
                checkedChannels.delete(innerHTML);
                if (parentItem) parentItem.style.display = ''; // Reset visibility
                } else {
                checkedChannels.set(innerHTML, childElement.href);
                if (parentItem) parentItem.style.display = 'none';
                console.log('hiding: ', parentItem);
                }
                updateButtons(innerHTML, !isChecked);
            });

            element.appendChild(button);

            if (checkedChannels.has(innerHTML)) {
                updateButtons(innerHTML, true);
                if (parentItem) parentItem.style.display = 'none';
                console.log('hiding: ', parentItem);
            }
            }
        }
        }
    });
  });
  pendingNodes.clear();
  observer.observe(document, observerConfig); // Restart observing
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadCSV") {
    if (checkedChannels.size > 0) {
      let csvContent = "data:text/csv;charset=utf-8," + 
        "Name,URL\n" + 
        Array.from(checkedChannels.entries()).map(([name, url]) => `${name},${url}`).join("\n");

      let encodedUri = encodeURI(csvContent);
      let link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "channels.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      sendResponse({ status: "downloaded" });
    } else {
      sendResponse({ status: "noSelection" });
    }
  }
});

// Create a MutationObserver instance
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) { // Only check added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            pendingNodes.add(node);
        }
      });
    }
  });
  if (!processingTimeout) {
    processingTimeout = setTimeout(() => {
      processNewElements();
      processingTimeout = null;
    }, 100);
  }
});

// Configure the observer to watch for changes in the entire document
const observerConfig = {
  childList: true, 
  subtree: true,   
};

observer.observe(document, observerConfig);
