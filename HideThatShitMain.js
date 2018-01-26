/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {

    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

}

/**
 * Hide all occurences of keyword from content
 *
 * @param {string} word The keyword to hide content
 */
function hideContent(word) {

  var script = "$(\"a[href^=\'http\']\").each(function(index) {"
                  +"var urlText = $(this).attr(\"href\");"
                  +"if(urlText.toLowerCase().indexOf(\""+word+"\") >= 0 ){"
                      +"$(this).addClass(\"hide-text\");"                      
                  +"}"
                +"});";

  //var script = "var firstHref = $(\"a[href^=\'http\']\").eq(0).attr(\"href\");";
  //script+= "console.log(firstHref);";

  chrome.tabs.executeScript({
    code: script
  });
}

/**
 * Gets the saved keyword .
 *
 * @param {string} url URL whose hide keyword is to be retreived
 * @param {function(string)} callback called with the hide keyword for
 *     the given url on success, or a falsy value if no keyword is retrieved.
 */
function getSavedHideKeyword(url, callback) {
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}

/**
 * Saves the given keyword for url.
 *
 * @param {string} url URL for which keyword is to be saved.
 * @param {string} keyword The keyword to be saved.
 */
function saveHideKeyword(url, word) {
  var items = {};
  items[url] = word;

  chrome.storage.sync.set(items);
}

// This extension loads the saved keyword for the current tab if one
// exists. The user can enter a new keyword for the
// current page.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var keyword = document.getElementById('keyword');

    // Load the saved keyword for this page and modify the input value if needed
    getSavedHideKeyword(url, (saveHideKeyword) => {
      if (saveHideKeyword) {
        hideContent(saveHideKeyword);
        keyword.value = saveHideKeyword;
      }
    });

    var hideBtn = document.getElementById('hideBtn');

    // Ensure the keyword is changed and saved when the input changes
    hideBtn.addEventListener('click', () => {
      hideContent(keyword.value);
      saveHideKeyword(url, keyword.value);
    });
  });
});
