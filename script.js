// script.js
// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  themeToggle.innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  themeToggle.innerText = '☀️';
}

// Elemente
const waterEl = document.getElementById('water');
const curEl   = document.getElementById('currentAmount');
const tgtEl   = document.getElementById('targetAmount');
const addBtn  = document.getElementById('addWater');
const histEl  = document.getElementById('history');
const tgtIn   = document.getElementById('targetInput');
const saveBtn = document.getElementById('setTarget');
const resetBtn= document.getElementById('resetButton');
const remToggle = document.getElementById('reminderToggle');
const streakEl = document.getElementById('streakCount');
const opts = document.querySelectorAll('.container-option');

// Daten laden oder defaults
let currentAmount = parseFloat(localStorage.getItem('currentAmount')) || 0;
let targetAmount  = parseFloat(localStorage.getItem('targetAmount'))  || 2.0;
let selectedAmount= parseFloat(localStorage.getItem('selectedAmount'))|| 0.2;
let streakCount   = parseInt(localStorage.getItem('streakCount'))   || 0;

// Initial UI
tgtEl.innerText = targetAmount.toFixed(1);
tgtIn.value     = targetAmount;
streakEl.innerText = streakCount;
opts.forEach(o => {
  if (parseFloat(o.dataset.amount) === selectedAmount) o.classList.add('active');
});
if (localStorage.getItem('history')) histEl.innerHTML = localStorage.getItem('history');
updateWaterDisplay();

// Container Auswahl
opts.forEach(opt => opt.addEventListener('click', () => {
  opts.forEach(o=>o.classList.remove('active'));
  opt.classList.add('active');
  selectedAmount = parseFloat(opt.dataset.amount);
  localStorage.setItem('selectedAmount', selectedAmount);
}));

// Ziel speichern
saveBtn.addEventListener('click', () => {
  const v = parseFloat(tgtIn.value);
  if (v>=0.5 && v<=5) {
    targetAmount = v;
    tgtEl.innerText = v.toFixed(1);
    localStorage.setItem('targetAmount', v);
    updateWaterDisplay();
    saveBtn.innerText = '✓ Gespeichert';
    setTimeout(()=> saveBtn.innerText='Speichern',1500);
  }
});

// Wasser hinzufügen
addBtn.addEventListener('click', () => {
  currentAmount = Math.min(targetAmount, currentAmount + selectedAmount);
  updateWaterDisplay();
  addToHistory(selectedAmount);
  checkAchievements();
  localStorage.setItem('currentAmount', currentAmount);
  localStorage.setItem('history', histEl.innerHTML);
});

// Reset
resetBtn.addEventListener('click', () => {
  if (confirm('Tag wirklich zurücksetzen?')) {
    const last = localStorage.getItem('lastResetDate');
    const today = new Date().toDateString();
    if (last && last!==today) {
      streakCount++;
      streakEl.innerText = streakCount;
      localStorage.setItem('streakCount', streakCount);
      if (streakCount>=7) document.querySelector('.badge:nth-child(4)').classList.add('earned');
    }
    localStorage.setItem('lastResetDate', today);
    currentAmount = 0;
    updateWaterDisplay();
    localStorage.setItem('currentAmount',0);
  }
});

// Erinnerungen
remToggle.checked = localStorage.getItem('remindersEnabled')==='true';
remToggle.addEventListener('change', ()=> {
  localStorage.setItem('remindersEnabled', remToggle.checked);
  if (remToggle.checked && Notification.permission!=='granted')
    Notification.requestPermission();
});
function remind() {
  if (remToggle.checked && Notification.permission==='granted' && currentAmount<targetAmount) {
    new Notification('Zeit für Wasser! 💧',{
      body:`${((currentAmount/targetAmount)*100).toFixed(0)} % erreicht.`
    });
  }
  setTimeout(remind, 60*60*1000);
}
if (remToggle.checked) remind();

// Hilfsfunktionen
function updateWaterDisplay() {
  const pct = (currentAmount/targetAmount)*100;
  waterEl.style.height = `${pct}%`;
  curEl.innerText = currentAmount.toFixed(1);
}

function addToHistory(amt) {
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' +
            now.getMinutes().toString().padStart(2,'0') + ' Uhr';
  let icon='🥤';
  if (amt===0.3) icon='🥛';
  if (amt===0.5) icon='🍶';
  if (amt===1)   icon='🍾';
  const div=document.createElement('div');
  div.className='history-item';
  div.innerHTML = `<span>${t} – ${Math.round(amt*1000)}ml</span><span>${icon}</span>`;
  histEl.prepend(div);
}

function checkAchievements() {
  if (currentAmount>=targetAmount) {
    // tägliches Badge
    document.querySelector('.badge:nth-child(2)').classList.add('earned');
    showCongrats();
  }
  const total = parseFloat(localStorage.getItem('totalConsumed')||0) + selectedAmount;
  localStorage.setItem('totalConsumed', total);
  if (total>=10) document.querySelector('.badge:nth-child(3)').classList.add('earned');
}

function showCongrats() {
  // einfacher Popup
  alert('🎉 Glückwunsch! Tagesziel erreicht!');
}
