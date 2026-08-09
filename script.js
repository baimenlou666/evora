const phoneImages = Array.from({length:43},(_,i)=>i+1).filter(n=>n!==22);
const characterImages = Array.from({length:6},(_,i)=>i+1);
function pick(list){return list[Math.floor(Math.random()*list.length)]}
function showPhone(){
  const img=new Image(); img.alt="A random picture from mothpanic's phone";
  img.src="assets/images/rim/"+pick(phoneImages)+".jpeg";
  img.onerror=()=>{img.src="https://eggmothsoup.neocities.org/rim/"+pick(phoneImages)+".jpeg"};
  document.querySelector("#ranimg").replaceChildren(img);
}
function showCharacter(){
  const img=new Image(); img.alt="A random character that mothpanic enjoys";
  img.src="assets/images/rch/"+pick(characterImages)+".jpg";
  img.onerror=()=>{img.src="https://eggmothsoup.neocities.org/rch/"+pick(characterImages)+".jpg"};
  document.querySelector("#rancha").replaceChildren(img);
}
document.querySelector('[data-random="phone"]').addEventListener("click",showPhone);
document.querySelector('[data-random="character"]').addEventListener("click",showCharacter);
showPhone();showCharacter();
