const eventsData = [
    { day: 25, month: 3, yearOrig: 1908, title: 'Fundação do Galo', type: 'titulos', desc: 'O Clube Atlético Mineiro nasce para mudar a história do futebol.' },
    { day: 25, month: 2, yearOrig: 1987, title: 'Nascimento Betto Fernandes', type: 'torcida', desc: 'Aniversário do admin do Furacão Alvinegro e criador do projeto.' },
    { day: 19, month: 12, yearOrig: 1971, title: 'Campeão do Brasil', type: 'titulos', desc: 'Primeiro campeão do Campeonato Brasileiro.' },
    { day: 24, month: 7, yearOrig: 2013, title: 'Glória Eterna', type: 'titulos', desc: 'O Galo conquista a Copa Libertadores da América.' },
    { day: 30, month: 5, yearOrig: 2013, title: 'Milagre do Victor', type: 'jogos', desc: 'A defesa com o pé esquerdo que canonizou o nosso goleiro.' },
    { day: 7, month: 11, yearOrig: 1971, title: 'Gol de Dadá', type: 'gols', desc: 'Dadá Maravilha decide o clássico e para no ar.' },
    { day: 2, month: 12, yearOrig: 2021, title: 'Bicampeão Brasileiro', type: 'titulos', desc: 'O fim da espera de 50 anos com uma virada épica sobre o Bahia.' }
];

let userMemories = JSON.parse(localStorage.getItem('galendarioMemories')) || [];
let currentDate = new Date();
let currentFilter = 'todos';

function init() {
    popularSeletores();
    renderCalendar();
    setupMemoryForm();
}

function popularSeletores() {
    const sDia = document.getElementById('selectDia'), sMes = document.getElementById('selectMes'), sAno = document.getElementById('selectAno');
    for(let i=1; i<=31; i++) sDia.innerHTML += `<option value="${i}">${i}</option>`;
    ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].forEach((m, i) => sMes.innerHTML += `<option value="${i}">${m}</option>`);
    for(let i=new Date().getFullYear() + 5; i>=1900; i--) sAno.innerHTML += `<option value="${i}">${i}</option>`;
    sDia.value = currentDate.getDate(); sMes.value = currentDate.getMonth(); sAno.value = currentDate.getFullYear();
}

function irParaData() {
    currentDate = new Date(document.getElementById('selectAno').value, document.getElementById('selectMes').value, document.getElementById('selectDia').value);
    renderCalendar();
    showDetail(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`);
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    document.getElementById('monthDisplay').innerText = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate).toUpperCase();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div class="day empty"></div>`;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = eventsData.filter(e => e.day === d && e.month === (month + 1) && year >= e.yearOrig && (currentFilter === 'todos' || e.type === currentFilter));
        const dayMems = userMemories.filter(m => m.date === dateStr);

        let tags = dayEvents.map(e => `<span class="event-tag">${e.title}</span>`).join('');
        if(dayMems.length > 0) tags += `<span class="event-tag memory">⭐ Memórias</span>`;

        const isToday = new Date().toISOString().split('T')[0] === dateStr ? 'today' : '';
        grid.innerHTML += `<div class="day ${isToday}" onclick="showDetail('${dateStr}')"><span class="day-number">${d}</span>${tags}</div>`;
    }
}

function showDetail(date) {
    const p = date.split('-'), y = parseInt(p[0]), m = parseInt(p[1]), d = parseInt(p[2]);
    const content = document.getElementById('details-content');
    document.getElementById('memory-form').dataset.selectedDate = date;

    const dayEvents = eventsData.filter(e => e.day === d && e.month === m && y >= e.yearOrig);
    const mems = userMemories.filter(mem => mem.date === date);

    let html = `<h4>${d}/${m}/${y}</h4>`;
    if(dayEvents.length > 0) {
        dayEvents.forEach(e => {
            const anos = y - e.yearOrig;
            html += `<div style="margin-bottom:15px"><h5>🏆 ${e.title}</h5><p style="font-size:0.85rem"><i>Há ${anos} anos:</i> ${e.desc}</p></div>`;
        });
    }
    if(mems.length > 0) {
        html += `<hr><h6>MEMÓRIAS DA MASSA:</h6>`;
        mems.forEach((mem, idx) => {
            html += `<p style="font-size:0.75rem; border-bottom:1px solid #eee; padding-bottom:5px; cursor:pointer" onclick="deletarMemoria('${date}', ${idx})"><strong>🚫 ${mem.name}:</strong> ${mem.text}</p>`;
        });
    }
    if(dayEvents.length === 0 && mems.length === 0) html += `<p>Nenhum registro histórico neste dia. Seja o primeiro a marcar!</p>`;
    content.innerHTML = html;
}

function setupMemoryForm() {
    document.getElementById('memory-form').onsubmit = (e) => {
        e.preventDefault();
        const date = e.target.dataset.selectedDate;
        const texto = document.getElementById('userMemory').value.toLowerCase();
        const rivais = ["cruzeiro", "maria", "6x1", "raposa", "azul"];

        if(rivais.some(r => texto.includes(r))) return alert("🚫 Conteúdo inadequado para o Galendário!");
        if(!date) return alert("Selecione um dia no calendário primeiro!");

        userMemories.push({ date, name: document.getElementById('userName').value, text: document.getElementById('userMemory').value });
        localStorage.setItem('galendarioMemories', JSON.stringify(userMemories));
        
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#000', '#fff'] });
        renderCalendar(); showDetail(date); e.target.reset();
    };
}

function deletarMemoria(date, index) {
    if(prompt("Acesso Betto: Digite a senha para apagar:") === "1908") {
        userMemories = userMemories.filter(m => !(m.date === date && userMemories.indexOf(m) === index));
        localStorage.setItem('galendarioMemories', JSON.stringify(userMemories));
        renderCalendar(); showDetail(date);
    }
}

function filterEvents(c) { currentFilter = c; renderCalendar(); }
document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
window.onload = init;
