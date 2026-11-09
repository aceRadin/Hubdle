/* Link de apoio compartilhado pela home e pelos jogos. */
(function(){
'use strict';
var config=window.HUBA_APOIO||{};
var url=[config.buymeacoffee,config.patreon].find(function(value){
 return typeof value==='string' && /^https:\/\/[^\s]+$/i.test(value);
});
if(!url)return;

var footer=document.createElement('footer');
footer.className='huba-support-footer';
var link=document.createElement('a');
link.href=url;
link.target='_blank';
link.rel='noopener noreferrer';

var heart=document.createElement('span');
heart.setAttribute('aria-hidden','true');
heart.textContent='♡';
link.append(heart,' Apoiar o Hubdle');
footer.appendChild(link);
document.querySelector('main').appendChild(footer);
})();
