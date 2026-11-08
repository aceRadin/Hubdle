(function(){
 var games=[
  {name:'Musical',path:'jogos/musicle/index.html',cardClass:'gcard-musical',streaks:[{id:'musicle',label:''}]},
  {name:'Wording',path:'jogos/wording/index.html',cardClass:'gcard-wording',streaks:[{id:'word',label:''}]},
  {name:'Bits',path:'jogos/bits/index.html',cardClass:'gcard-bits',streaks:[{id:'bits',label:''}]},
  {name:'Streakal',path:'jogos/streakal/index.html',cardClass:'gcard-streakal',streaks:[{id:'streakal',label:''}]},
  {name:'LoLdle',path:'jogos/loldle/index.html',cardClass:'gcard-loldle',streaks:[{id:'loldle',label:''}]}
 ];
 var grid=document.getElementById('landingGrid');
 games.forEach(function(g){
   var a=document.createElement('a');
   a.className='gcard '+g.cardClass;
   a.href=g.path;
   var top=document.createElement('div');top.className='gtop';
   var name=document.createElement('span');name.className='gname';name.textContent=g.name;top.appendChild(name);
   a.appendChild(top);
   if(g.streaks?.length!==0){var wrap=document.createElement('div');wrap.className='gstreaks';
     (g.streaks||[{id:g.name.toLowerCase(),label:''}]).forEach(function(s){var n=HUBA.currentStreak(s.id),st=document.createElement('div');st.className='gstreak';st.dataset.streakId=s.id;st.innerHTML='<strong></strong><span class="gstreak-fire" aria-hidden="true">🔥</span>';st.querySelector('strong').textContent=n;wrap.appendChild(st)});
     a.appendChild(wrap);
   }
   grid.appendChild(a);
 });
 function updateGlobalStreak(){document.getElementById('globalStreak').textContent=HUBA.currentStreak('huba');document.querySelectorAll('[data-streak-id]').forEach(function(st){var n=HUBA.currentStreak(st.dataset.streakId);st.querySelector('strong').textContent=n})}
 updateGlobalStreak();window.addEventListener('pageshow',updateGlobalStreak);window.addEventListener('storage',updateGlobalStreak);document.addEventListener('huba:streak',updateGlobalStreak);
})();
