(() => {
  function toast(message, type = 'success') {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = message;
    el.className = `toast ${type} show`;
    clearTimeout(window.__rainGuardToastTimer);
    window.__rainGuardToastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  window.addEventListener('load', () => {
    const copy = document.getElementById('copyCoordinates');
    if (copy) copy.addEventListener('click', () => setTimeout(() => {
      const status = document.getElementById('status')?.textContent || '';
      if (status.includes('Coordinates copied')) toast('✓ Coordinates copied', 'success');
    }, 50));

    const notify = document.getElementById('notifyBtn');
    if (notify) notify.addEventListener('click', () => setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') toast('🔔 Rain alerts enabled', 'success');
    }, 100));
  });
})();
