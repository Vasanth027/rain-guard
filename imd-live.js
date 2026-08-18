/* RainGuard: browser-safe IMD/RMC layer. */
(function () {
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const textFrom = (v, keys) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    if (Array.isArray(v)) { for (const x of v) { const f = textFrom(x, keys); if (f) return f; } return ''; }
    if (typeof v === 'object') {
      for (const k of keys) if (v[k] != null && String(v[k]).trim()) return String(v[k]);
      for (const x of Object.values(v)) { const f = textFrom(x, keys); if (f) return f; }
    }
    return '';
  };
  const findLocationText = (value, label) => {
    const wanted = String(label || '').toLowerCase().split(',')[0].trim();
    if (!value || !wanted) return '';
    const walk = v => {
      if (Array.isArray(v)) { for (const x of v) { const f = walk(x); if (f) return f; } }
      else if (v && typeof v === 'object') {
        const blob = JSON.stringify(v).toLowerCase();
        if (blob.includes(wanted)) {
          const f = textFrom(v, ['warning','message','description','text','title','nowcast']);
          if (f) return f;
        }
        for (const x of Object.values(v)) { const f = walk(x); if (f) return f; }
      }
      return '';
    };
    return walk(value);
  };
  const updatedLabel = iso => {
    if (!iso) return 'Snapshot time unavailable';
    try { return `Updated ${new Date(iso).toLocaleString([], {year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:true})}`; }
    catch (_) { return 'Snapshot time unavailable'; }
  };
  window.loadImdData = async function (lat, lon, label) {
    const grid = document.getElementById('imdGrid');
    const warning = document.getElementById('imdWarning');
    const bfs = document.getElementById('bfsPanel');
    if (!grid || !warning) return;
    try {
      const response = await fetch(`./imd-data.json?v=${Date.now()}`, {cache:'no-store'});
      if (!response.ok) throw new Error('Snapshot unavailable');
      const data = await response.json();
      const status = data.status || {};
      const current = data.current && !data.current.error ? data.current : null;
      const nowcast = data.nowcast && !data.nowcast.error ? data.nowcast : null;
      const districtWarning = data.warning && !data.warning.error ? data.warning : null;
      const rssItems = Array.isArray(data.rss) ? data.rss : [];
      const currentText = current ? (textFrom(current,['temp','temperature','Temp','Temperature','weather','Weather','description','Description']) || 'Official feed available') : 'API unavailable';
      const nowcastText = findLocationText(nowcast,label) || (nowcast ? `Official feed active · ${Array.isArray(nowcast) ? nowcast.length : 1} bulletin(s)` : 'No local match');
      const warningText = findLocationText(districtWarning,label) || (districtWarning ? `Official warning feed active · ${Array.isArray(districtWarning) ? districtWarning.length : 1} bulletin(s)` : 'No local match');
      grid.innerHTML = `<div class="imd-item"><span>IMD Current</span><strong>${esc(currentText).slice(0,110)}</strong></div><div class="imd-item"><span>RMC Nowcast</span><strong>${esc(nowcastText).slice(0,110)}</strong></div><div class="imd-item"><span>District Warning</span><strong>${esc(warningText).slice(0,110)}</strong></div>`;
      const refreshed = status.rss === 'ok' || status.nowcast === 'rss-fallback' || status.warning === 'rss-fallback' || status.nowcast === 'ok' || status.warning === 'ok';
      warning.className = refreshed ? 'imd-warning green' : 'imd-warning yellow';
      warning.innerHTML = `${refreshed ? '🇮🇳' : '⚠️'} <strong>${refreshed ? 'Official IMD/RMC snapshot refreshed.' : 'IMD JSON APIs unavailable from refresh runner.'}</strong> · ${esc(updatedLabel(data.updated_at))}${rssItems.length ? ` · ${rssItems.length} RSS nowcast bulletins` : ''}`;
      if (bfs) bfs.innerHTML = '<div class="bfs-stat"><strong>~6 km</strong><span>Horizontal resolution</span></div><div class="bfs-stat"><strong>10 days</strong><span>Forecast range</span></div><div class="bfs-stat"><strong>00Z + 12Z</strong><span>Operational runs</span></div>';
    } catch (_) {
      grid.innerHTML = '<div class="imd-item"><span>IMD Current</span><strong>Snapshot unavailable</strong></div><div class="imd-item"><span>RMC Nowcast</span><strong>Snapshot unavailable</strong></div><div class="imd-item"><span>District Warning</span><strong>Snapshot unavailable</strong></div>';
      warning.className = 'imd-warning yellow';
      warning.textContent = 'Official IMD/RMC snapshot is temporarily unavailable. The next scheduled refresh will retry it.';
      if (bfs) bfs.innerHTML = '<div class="bfs-stat"><strong>~6 km</strong><span>Official Bharat FS model</span></div><div class="bfs-stat"><strong>10 days</strong><span>Forecast range</span></div><div class="bfs-stat"><strong>00Z + 12Z</strong><span>Operational runs</span></div>';
    }
  };
})();
