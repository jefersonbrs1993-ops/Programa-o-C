const btnRecord = document.getElementById('btnRecord');
const status = document.getElementById('recordStatus');
const descricaoInput = document.getElementById('descricao');
const valorInput = document.getElementById('valor');
const tipoSelect = document.getElementById('tipo');
const btnSave = document.getElementById('btnSave');
const btnExport = document.getElementById('btnExport');
const tbody = document.querySelector('#table tbody');
const totalGastosEl = document.getElementById('totalGastos');
const totalGanhosEl = document.getElementById('totalGanhos');
const saldoEl = document.getElementById('saldo');

let registros = JSON.parse(localStorage.getItem('gastos_registros_v1') || '[]');

// Renderizar tabela e totais
function render(){
  tbody.innerHTML = '';
  let totalGastos = 0;
  let totalGanhos = 0;

  registros.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.data}</td>
      <td>${r.descricao}</td>
      <td>${parseFloat(r.valor).toFixed(2)}</td>
      <td>${r.tipo}</td>
      <td><button data-idx="${idx}" class="del">Excluir</button></td>
    `;
    tbody.appendChild(tr);

    if(r.tipo === 'Gasto') totalGastos += Number(r.valor);
    else totalGanhos += Number(r.valor);
  });

  totalGastosEl.textContent = totalGastos.toFixed(2);
  totalGanhosEl.textContent = totalGanhos.toFixed(2);
  saldoEl.textContent = (totalGanhos - totalGastos).toFixed(2);

  localStorage.setItem('gastos_registros_v1', JSON.stringify(registros));
}

// Excluir item
tbody.addEventListener('click', (e)=>{
  if(e.target.classList.contains('del')){
    const i = Number(e.target.dataset.idx);
    registros.splice(i,1);
    render();
  }
});

// Salvar item manualmente
btnSave.addEventListener('click', ()=>{
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const tipo = tipoSelect.value;

  if(!descricao || !valor || isNaN(valor)){
    alert('Preencha a descrição e o valor corretamente.');
    return;
  }

  const data = new Date().toLocaleString('pt-BR');
  registros.push({data, descricao, valor: Number(valor).toFixed(2), tipo});

  descricaoInput.value=''; 
  valorInput.value='';
  render();
});

// Exportar para CSV
btnExport.addEventListener('click', ()=>{
  if(registros.length === 0){
    alert('Nenhum registro para exportar.');
    return;
  }

  const header = ['Data','Descrição','Valor','Tipo'];
  const rows = registros.map(r => [r.data, r.descricao.replace(/"/g,'""'), r.valor, r.tipo]);

  let csv = header.join(',') + '\n' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');

  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url; 
  a.download = 'gastos.csv';
  document.body.appendChild(a);
  a.click();

  setTimeout(()=>{ 
    URL.revokeObjectURL(url); 
    a.remove(); 
  }, 500);
});

// Verifica reconhecimento de voz
function suportaSpeech(){
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

if(!suportaSpeech()){
  status.textContent = 'Seu navegador não suporta voz. Use Google Chrome.';
} else {
  const Recon = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new Recon();

  rec.lang = 'pt-BR';
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  btnRecord.addEventListener('click', ()=>{
    try {
      rec.start();
      status.textContent = '🎧 Ouvindo... fale claramente';
      btnRecord.disabled = true;
    } catch(err){
      status.textContent = 'Erro ao iniciar gravação.';
    }
  });

  rec.addEventListener('result', (e)=>{
    const text = e.results[0][0].transcript;
    status.textContent = 'Você disse: ' + text;

    // Extrai número (valor)
    const numMatch = text.match(/\d+[\.,]?\d*/);
    if(numMatch){
      valorInput.value = numMatch[0].replace(',', '.');
    }

    // Define tipo
    if(/recebi|ganhei|entrada|recebido/.test(text.toLowerCase())){
      tipoSelect.value = 'Ganho';
    } else {
      tipoSelect.value = 'Gasto';
    }

    // Extrai descrição
    let desc = text.replace(/\d+[\.,]?\d*/g, '')
                   .replace(/reais?|gastei|paguei|com|na|no|de|por/gi,'')
                   .trim();

    descricaoInput.value = desc || text;
    btnRecord.disabled = false;
  });

  rec.addEventListener('end', ()=>{
    btnRecord.disabled = false;
    status.textContent = 'Pronto';
  });
}

render();