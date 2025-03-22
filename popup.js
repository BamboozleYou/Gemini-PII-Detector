document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle");
  const statusText = document.getElementById("status");

  chrome.storage.local.get(["filterEnabled"], (result) => {
      let filterEnabled = result.filterEnabled !== false;
      statusText.textContent = filterEnabled ? "Active" : "Inactive";
      toggleButton.textContent = filterEnabled ? "Disable Filter" : "Enable Filter";
  });

  toggleButton.addEventListener("click", () => {
      chrome.storage.local.get(["filterEnabled"], (result) => {
          let filterEnabled = result.filterEnabled !== false;
          chrome.storage.local.set({ filterEnabled: !filterEnabled }, () => {
              statusText.textContent = !filterEnabled ? "Active" : "Inactive";
              toggleButton.textContent = !filterEnabled ? "Disable Filter" : "Enable Filter";
          });
      });
  });
});
