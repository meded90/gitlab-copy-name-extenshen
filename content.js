(() => {
  if (!location.hostname.includes('gitlab')) {
    return;
  }

  if (!location.pathname.includes('/issues/')) {
    return;
  }

  const originalIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 20 20" height="24" viewBox="0 0 20 20" width="24">
      <rect fill="none" height="20" width="20"/>
      <path d="M15.5,2h-8C6.67,2,6,2.67,6,3.5v10C6,14.33,6.67,15,7.5,15h8c0.83,0,1.5-0.67,1.5-1.5v-10C17,2.67,16.33,2,15.5,2z
               M15.5,13.5h-8v-10h8V13.5z M3,12v-1.5h1.5V12H3z M3,15v-1.5h1.5V15H3z M9,16.5h1.5V18H9V16.5z M3,7.5h1.5V9H3V7.5z
               M7.5,18H6v-1.5h1.5V18z M4.5,18C3.67,18,3,17.33,3,16.5h1.5V18z M4.5,6H3c0-0.83,0.67-1.5,1.5-1.5V6z
               M13.49,16.5c0,0.83-0.67,1.5-1.5,1.5h0v-1.5L13.49,16.5L13.49,16.5z"/>
    </svg>
  `;

  const successIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="24" width="24" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M9 16.17l-3.17-3.17-1.41 1.41L9 19l10-10-1.41-1.41z"/>
    </svg>
  `;

  // Функция ожидания появления элемента
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Element not found: " + selector)), timeout);

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearTimeout(timer);
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  async function init() {
    try {
      const issueTitle = await waitForElement('[data-testid="issue-title"]');
      const issueActions = document.querySelector(".detail-page-header-actions");
      const taskId = document.querySelector(".breadcrumb .gl-breadcrumb-item:last-child span");

      if (!issueActions || !taskId) return;

      const copyButton = document.createElement("button");
      copyButton.innerHTML = originalIcon;
      copyButton.className = 'js-copy-button btn js-issuable-edit !gl-hidden md:!gl-block btn-default btn-md gl-button';

      function copyTask() {
        const taskContent = `${issueTitle.innerText} (${taskId.innerText})`;
        navigator.clipboard.writeText(taskContent).then(() => {
          copyButton.classList.add('btn-success');
          copyButton.innerHTML = successIcon;
          setTimeout(() => {
            copyButton.classList.remove('btn-success');
            copyButton.innerHTML = originalIcon;
          }, 1000);
        }).catch(err => console.error("Copy error", err));
      }

      copyButton.addEventListener("click", copyTask);

      document.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
          copyTask();
        }
      });

      issueActions.prepend(copyButton);

    } catch (error) {
      console.error(error.message);
    }
  }

  init();
})();
