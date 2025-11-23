let totalGanho = 0;
let totalGasto = 0;

function adicionarGasto() {
    const descricao = document.getElementById("descricao").value;
    const valor = Number(document.getElementById("valor").value);

    if (!descricao || !valor) {
        alert("Preencha a descrição e o valor!");
        return;
    }

    // Adicionar gasto na lista
    const lista = document.getElementById("lista-gastos");
    const item = document.createElement("li");
    item.innerText = `${descricao} - R$ ${valor.toFixed(2)}`;
    lista.appendChild(item);

    // Atualizar somatório
    totalGasto += valor;
    atualizarResumo();

    // Limpar inputs
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
}

function adicionarGanho(valor) {
    totalGanho += valor;
    atualizarResumo();
}

function atualizarResumo() {
    const saldo = totalGanho - totalGasto;

    document.getElementById("total-gasto").innerText = `R$ ${totalGasto.toFixed(2)}`;
    document.getElementById("total-ganho").innerText = `R$ ${totalGanho.toFixed(2)}`;
    document.getElementById("saldo-restante").innerText = `R$ ${saldo.toFixed(2)}`;
}