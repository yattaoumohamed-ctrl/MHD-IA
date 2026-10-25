const $ = id => document.getElementById(id);
const chat = $('chat'), form = $('composer'), input = $('message'), sendBtn = $('sendBtn'), statusEl = $('status');
let history = [];
let busy = false, voiceEnabled = false, installPrompt = null;

function textOf(response) {
  if (typeof response === 'string') return response;
  const msg = response?.message;
  if (typeof msg === 'string') return msg;
  if (typeof msg?.content === 'string') return msg.content;
  if (Array.isArray(msg?.content)) return msg.content.map(x => x.text || '').join('\n');
  if (typeof response?.text === 'string') return response.text;
  return JSON.stringify(response);
}
function addMessage(role, text, withTools=false) {
  $('welcome')?.remove();
  const wrap = document.createElement('div'); wrap.className = `message ${role}`;
  const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.textContent = role === 'user' ? 'Toi' : 'M';
  const bubble = document.createElement('div'); bubble.className = 'bubble'; bubble.textContent = text;
  if (withTools) {
    const tools = document.createElement('div'); tools.className='replytools';
    const copy = document.createElement('button'); copy.textContent='Copier'; copy.onclick=()=>navigator.clipboard?.writeText(text).then(()=>setStatus('Réponse copiée.')).catch(()=>setStatus('Copie non disponible.'));
    const read = document.createElement('button'); read.textContent='🔊 Lire'; read.onclick=()=>speak(text);
    tools.append(copy,read); bubble.appendChild(tools);
  }
  wrap.append(avatar,bubble); chat.appendChild(wrap); chat.scrollTop=chat.scrollHeight;
  return bubble;
}
function setStatus(s){ statusEl.textContent=s; }
function speak(text) {
  if (!('speechSynthesis' in window)) { setStatus('La lecture vocale n’est pas disponible dans ce navigateur.'); return; }
  speechSynthesis.cancel(); const utter = new SpeechSynthesisUtterance(text);
  utter.lang='fr-FR'; utter.rate=1; speechSynthesis.speak(utter);
}
async function send(text) {
  text = text.trim(); if (!text || busy) return;
  busy=true; sendBtn.disabled=true; input.disabled=true;
  addMessage('user',text); history.push({role:'user',content:text}); input.value=''; input.style.height='auto';
  const loading=addMessage('assistant','MHD AI réfléchit…');
  setStatus('Connexion au service IA…');
  try {
    if (!window.puter?.ai?.chat) throw new Error('Le service IA ne s’est pas chargé. Vérifie Internet puis recharge la page.');
    const model = $('model').value;
    const messages = [
      {role:'system', content:'Tu es MHD AI, un assistant intelligent, bienveillant et naturel qui parle français. Réponds clairement, comme un assistant humain mais sans prétendre être une personne. Pour les exercices scolaires, explique la méthode étape par étape et vérifie les calculs. Si tu n’es pas sûr d’une information, dis-le. Ne prétends pas avoir consulté Internet si tu ne l’as pas fait.'},
      ...history.slice(-16)
    ];
    const result = await puter.ai.chat(messages, {model});
    const answer = textOf(result) || 'Je n’ai pas reçu de réponse exploitable.';
    loading.textContent=answer;
    const tools=document.createElement('div'); tools.className='replytools';
    const copy=document.createElement('button'); copy.textContent='Copier'; copy.onclick=()=>navigator.clipboard?.writeText(answer).then(()=>setStatus('Réponse copiée.')).catch(()=>setStatus('Copie non disponible.'));
    const read=document.createElement('button'); read.textContent='🔊 Lire'; read.onclick=()=>speak(answer);
    tools.append(copy,read); loading.appendChild(tools);
    history.push({role:'assistant',content:answer});
    setStatus('Réponse reçue');
    if (voiceEnabled) speak(answer);
  } catch (e) {
    loading.textContent='Je n’ai pas pu répondre. '+(e?.message || 'Vérifie la connexion Internet et l’accès au service IA.');
    setStatus('Échec de la connexion');
  } finally { busy=false; sendBtn.disabled=false; input.disabled=false; input.focus(); chat.scrollTop=chat.scrollHeight; }
}
form.addEventListener('submit', e=>{e.preventDefault();send(input.value)});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,150)+'px'});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>send(b.textContent)));
$('newChatBtn').addEventListener('click',()=>{history=[];chat.innerHTML='';const w=document.createElement('section');w.className='welcome';w.id='welcome';w.innerHTML='<div class="hero-logo">M</div><h1>Nouvelle discussion</h1><p>Pose ta question à MHD AI.</p>';chat.appendChild(w);setStatus('Nouvelle discussion prête');input.focus()});
$('speakToggle').addEventListener('click',()=>{voiceEnabled=!voiceEnabled;$('speakToggle').textContent=voiceEnabled?'🔊 Voix activée':'🔇 Voix désactivée';setStatus(voiceEnabled?'Les nouvelles réponses seront lues à voix haute.':'Lecture automatique désactivée.')});
$('micBtn').addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setStatus('La dictée vocale n’est pas prise en charge ici. Essaie le micro du clavier Android.');return}const rec=new SR();rec.lang='fr-FR';rec.interimResults=false;rec.onstart=()=>setStatus('Je t’écoute…');rec.onresult=e=>{input.value=e.results[0][0].transcript;input.dispatchEvent(new Event('input'));setStatus('Message dicté. Tu peux le modifier puis envoyer.')};rec.onerror=()=>setStatus('La dictée vocale a échoué. Vérifie l’autorisation du micro.');rec.start()});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('installBtn').hidden=false});
$('installBtn').addEventListener('click',async()=>{if(!installPrompt){setStatus('Dans Chrome : menu ⋮ puis « Installer l’application » ou « Ajouter à l’écran d’accueil ».');return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('installBtn').hidden=true});
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
