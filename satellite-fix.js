(()=>{
'use strict';
/* Satellite tile stability layer. Keeps the normal map underneath until imagery loads,
   uses the ArcGIS services host, supports zooming, and falls back cleanly on tile errors. */
function install(){
  if(!window.L || window.__rainGuardSatelliteFix)return;
  window.__rainGuardSatelliteFix=true;
  const original=L.tileLayer;
  L.tileLayer=function(url,options={}){
    if(typeof url==='string' && url.includes('server.arcgisonline.com/ArcGIS/rest/services/World_Imagery')){
      url=url.replace('server.arcgisonline.com','services.arcgisonline.com');
      options=Object.assign({maxZoom:19,maxNativeZoom:18,crossOrigin:true,keepBuffer:3},options);
      const layer=original.call(this,url,options);
      let failed=0;
      layer.on('tileerror',()=>{
        failed++;
        if(failed>=3){
          try{layer.remove();}catch{}
          window.dispatchEvent(new CustomEvent('rainguard:satellite-error'));
        }
      });
      return layer;
    }
    return original.call(this,url,options);
  };
  window.addEventListener('rainguard:satellite-error',()=>{
    const app=document.getElementById('windyApp');
    const msg=document.createElement('div');
    msg.className='windy-satellite-error';
    msg.textContent='Satellite imagery unavailable — standard map restored';
    app?.appendChild(msg);
    setTimeout(()=>msg.remove(),3000);
  });
}
const t=setInterval(()=>{if(window.L){clearInterval(t);install()}},50);
})();
