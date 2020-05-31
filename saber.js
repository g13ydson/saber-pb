function redireciona_turma(){
  // se novo registro começa com #numéro então redireciona
  // para a turma especifica
  // exemplo:
  // #1238787 qualquer coisa

  chrome.storage.sync.get({
    //favoriteColor : 'red',
    //likesColor : true,
    registros: '',
  }, function(itens) {
    let linhas = itens.registros.split('\n')
    let primeira_linha = linhas[0];
    if (primeira_linha.startsWith('#')){
      let inicio = primeira_linha.replace(/\t/g, " ").split(' ')[0];
      let codigo = inicio.substring(1);
      console.log(`Código lido:  '${codigo}'`);
      if (codigo=='' || isNaN(codigo)){
        // Se depois de # não vier número, não faz nada
        // fica semelhante a uma mensagem
        //alert(primeira_linha);
      }else{
        if (!window.location.pathname.includes(codigo)){
          console.log(`Redireciona para http://www.saber.pb.gov.br/platform/teachings/${codigo}`);
          window.location.href = `http://www.saber.pb.gov.br/platform/teachings/${codigo}`;
        }else{
          // apaga primeira linha (após redirecionado)
          linhas.shift();

          let novo_registros = linhas.join("\n");
          //console.log(`novo_registros: ${novo_registros}.`)
          chrome.storage.sync.set({
            registros: novo_registros,
          }, function() {
            // Update status to let user know options were saved.
            console.log(`Registro removido: ${primeira_linha}.`)
          });
        }
      }


    }
  });
}

redireciona_turma();

// Adicionar tecla de atalho ao link "Novo registro de aula" ALT+N
// Procura por link ".*/new"
// Exemplo:
// <a class="btn btn-new btn-success pull-right" href="/platform/teachings/320557/class_logs/new"><i class="icon-file-alt"></i>
// Novo registro de aula
// </a>
// http://www.saber.pb.gov.br/platform/teachings/320557/class_logs
// Adicionar tecla de atalho ALT+n para criar novos elementos
var links = document.getElementsByTagName('a');
for(i=0; i<links.length; i++){
    if (links[i].href.endsWith("/new")){
        links[i].accessKey='n';
        links[i].title='Tecla de atalho adicionada: ALT+n';
    }
}

// Adicionando tecla de atalho ALT+f ao botão de quantidade de aulas seguidas
var botaoClasses = document.getElementById("classes")
if(botaoClasses != null){
	console.log('Tecla ALT+A adicionada ao botão de número de aulas seguidas!')
	botaoClasses.accessKey='a';
	botaoClasses.title='Tecla de atalho adicionada: ALT+a. Valor padrão pode ser alterado nas opções da extensão.';
}


// Adicionar tecla de atalho ALT+s para salvar
var botoes = document.getElementsByTagName('button');
for(i=0; i<botoes.length; i++){
    b = botoes[i]
    if (b.textContent.endsWith("Salvar")){
        b.accessKey='s';
        b.title='Tecla de atalho adicionada: ALT+s';
    }
    if (b.textContent.includes("Adicionar")){
        b.accessKey='n';
        b.title='Tecla de atalho adicionada: ALT+n';
    }
}


var breadcrumbs = document.querySelector("body > div.breadcrumbs > div");
var colagem = document.createElement("textarea");
colagem.id = "colagem";
colagem.cols = "100";
colagem.rows = "4";
colagem.placeholder = "Cole aqui as colunas copiadas do Excel, depois pressione TAB e ALT+s para salvar"

var baixar_planilha_link = document.createElement("a");
baixar_planilha_link.setAttribute('class', 'btn btn-info');
baixar_planilha_link.setAttribute('title', 'Baixar planilha para facilitar edição');
var icone = document.createElement("i");
icone.setAttribute('class', 'icon-download-alt');
baixar_planilha_link.appendChild(icone);

var plugin_link = document.createElement("a");
plugin_link.setAttribute('class', 'btn btn-info');
plugin_link.setAttribute('title', 'Avaliar/Comentar plugin');
plugin_link.setAttribute('href', 'https://chrome.google.com/webstore/detail/saber-pb/pfnoopdjbdpgegpkihfmlofngfdkjfem');
var icone = document.createElement("i");
icone.setAttribute('class', 'icon-comments-alt');
plugin_link.appendChild(icone);


/*
Links das planilhas:
https://github.com/edusantana/saber-pb/raw/master/frequencias.xlsx
https://github.com/edusantana/saber-pb/raw/master/aulas-conteudos.xlsx
https://github.com/edusantana/saber-pb/raw/master/avaliacoes.xlsx
*/

/* =========== PAINEL  ==================*/
// Saves options to chrome.storage
function save_options() {
  console.log("Salvando registros");
  var registros= document.getElementById('registros').value.trim();

  chrome.storage.sync.set({
    'registros': registros,
  }, function() {
    // Update status to let user know options were saved.
    document.querySelector('#alerta').innerHTML='<div class="alert alert-success">Salvo</div>'
  });
}

function save_aulas_seguidas(){
  console.log("Salvando Nº aulas seguidas");
  var numeroDeAulas=document.getElementById('classes').value;
  chrome.storage.sync.set({
    aulas_seguidas: numeroDeAulas,
  }, function() {
    // Update status to let user know options were saved.
    document.querySelector('#alerta').innerHTML=`<div class="alert alert-success">${numeroDeAulas} foi salvo como valor padrão para a caixa de Número de aulas seguidas.</div>`
  });
}

/**
* Salva array de registros
*/
function salva_registros(registros){
  document.querySelector("#registros").value = registros.join("\n");
  save_options();
}

function string_para_ordenar(r){
  return `r.children[3].textContent.trim() r.children[2].textContent.trim() r.children[1].textContent.trim()`
}

function criarComentariosDeTurmas(){

  var registros = Array.from(document.querySelectorAll("table tbody tr"));
  //registros.sort((a, b) => string_para_ordenar(a).localeCompare(string_para_ordenar(b), 'pt', { sensitivity: 'base' }));
  var planilha = []

  // Registros de aula class_logs
  for (r of registros) {
    let turma = r.children[3].textContent.trim();
    let disciplina = r.children[2].textContent.trim();
    let escola = r.children[1].textContent.trim();
    let link = r.children[9].querySelector('a').href
    // http://www.saber.pb.gov.br/platform/teachings/1238787/class_logs
    let turma_id = link.split('/')[5]
    planilha.push(`# ${turma_id} ${turma} < ${disciplina} < ${escola}`)
  }
  // ordena as turmas ignorando case
  planilha.unshift("# Todas as turmas")
  salva_registros(planilha);
}

function pegar_registros(){
  console.log("Pegando registros");

  //#body > tbody > tr
  var registros = Array.from(document.querySelectorAll("table tbody tr"));
  var planilha = []

  // Registros de aula class_logs
  for (r of registros.reverse()) {
    let data = r.children[0].textContent.trim();
    let n_aulas = r.children[3].textContent.trim();
    let conteudo = r.children[5].textContent.trim().replace(/\n/g, "/");
    let metodologia = r.children[6].textContent.trim().replace(/\n/g, "/");
    var linha = [data,n_aulas,conteudo,metodologia].join("\t");
    console.log(linha);
    planilha.push(linha)
  }

  salva_registros(planilha);
}

function criaPainel(){

  // remove breadcrumbs
  document.querySelector('body > div.breadcrumbs > div > ul').remove()

  var painel = document.createElement('div');
  Object.assign(painel, {
    className: 'container',
    id: 'extensao-saber-pb'
  });

  let pegar_registros = window.location.pathname.endsWith("class_logs")?        `<li><a id="pegar-registros" href="#" accesskey="c"><u>C</u>opiar registros</a></li><li class="divider"></li>`: ""
  let numeroDeAulas   = window.location.pathname.endsWith("class_frequencies")? `<li><a id="salva-n-aulas" href="#">Nº de aulas seguidas</a></li><li class="divider"></li>`: ""
  let comentariosDeTurmas = isPaginaMinhasAulas()? `<li><a id="comentarios" href="#" accesskey="c"><u>C</u>riar comentários</a></li><li class="divider"></li>`: ""

  painel.innerHTML = `
    <div class="row">
      <div class="span10">
        <textarea class="span10" id="registros" name="registros" rows="4" title="Área de transferência"></textarea>
      </div>
      <div class="span2 text-left" id="acoes">
        <div class="btn-group">
          <button id="bSalvar" class="btn btn-primary" accesskey="s"><u>S</u>alvar</button>
          <button class="btn btn-primary dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>
            <ul class="dropdown-menu">
              ${pegar_registros}
              ${numeroDeAulas}
              ${comentariosDeTurmas}
              <li><a href="https://github.com/edusantana/saber-pb/raw/master/aulas-conteudos.xlsx">Planilha de aulas</a></li>
              <li><a href="https://github.com/edusantana/saber-pb/raw/master/avaliacoes.xlsx">Planilha de avaliações</a></li>
              <li class="divider"></li>
              <li><a href="https://www.youtube.com/watch?v=R_0gQxTHqbg&list=PL9kH1vkGoNugNdtEla-YHZWE0SRxGKIcN">Vídeos</a></li>
              <li><a href="https://github.com/edusantana/saber-pb/issues/new">Sugerir melhoria</a></li>
              <li><a href="https://edusantana.github.io/saber-pb#suporte">Suporte</a></li>
              <li><a href="https://edusantana.github.io/saber-pb">Ajuda</a></li>
            </ul>
        </div>
      </div>
    </div>
    <div class="row" id="alerta">
    </div>`;

  // Adicionar no breadcrumbs
  document.querySelector('div.breadcrumbs > div').appendChild(painel)

}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		//favoriteColor : 'red',
		//likesColor : true,
		registros: '',
	}, function(items) {
		document.getElementById('registros').value = items.registros;
	});
}

function isPaginaMinhasAulas(){
  // http://www.saber.pb.gov.br/platform/teachings
  return window.location.pathname.endsWith("teachings");
}

if (window.location.pathname.endsWith("class_logs")
		|| window.location.pathname.endsWith("class_frequencies")
		|| window.location.pathname.endsWith("class_ratings")
    || isPaginaMinhasAulas()
		) {
	criaPainel();

  document.querySelector('#bSalvar').addEventListener("click", save_options);

  if (document.querySelector('#salva-n-aulas')){
    document.querySelector('#salva-n-aulas').addEventListener("click", save_aulas_seguidas);
  }
  if (document.querySelector('#pegar-registros')){
    document.querySelector('#pegar-registros').addEventListener("click", pegar_registros);
  }
  if (document.querySelector('#comentarios')){
    document.querySelector('#comentarios').addEventListener("click", criarComentariosDeTurmas);
  }

  restore_options();
  chrome.storage.onChanged.addListener(function(changes, namespace) {
      for (key in changes) {
      	if (key == "registros"){
      		restore_options();
      	}
      }
    });
}

/* =========== PAINEL FIM  ==================*/

/* =========== REGISTRO DE FREQUÊNCIA  ==================*/
function atualizaRegistroDeFrequencia(){
    console.log('Valor mudou!')
    // dia: class_frequency[day]

    var valor_colado = document.getElementById('colagem').value;
    var valores = valor_colado.split("\t");

    console.log('Valores:' + valores);

    // document.getElementById('class_frequency_day').value = '21/12/2017'
    if (valores.length > 0){
        document.getElementById('class_frequency_day').value = valores[0];
    }
    if (valores.length > 1){
        document.getElementById('class_frequency_justification').value = valores[1];
    }
    if (valores.length > 2){
        // 0 : Presente
        // 1 : Ausente
        // 2 : Não registrado
        var registro_padrao = parseInt(valores[2]);

        // Coloca um valor padrão para todos os registros dos alunos
        registros = document.querySelectorAll('input[type="radio"]');
        for (var i = 0; i < registros.length; i += 3) {
          document.querySelectorAll('input[type="radio"]')[i + registro_padrao].checked = true
        }

    }
    return;
}

/**
 * Auto selecina a opção 'Não registrado' para os alunos com problemas
 * @returns
 */
function corrigeOsNaoRegistrados(){
	console.log("Verificando por erros...")
	var frequencias = document.getElementsByClassName('students-frequencies')
    var erros = frequencias[0].getElementsByClassName("alert alert-error clearfix")
    if (erros!=null){

    	for(i=0; i<erros.length; i++){
    		console.log("Corrigindo erro: " + i)
    		// Seleciona automaticamente "Não registrado"
    		erros[i].parentElement.parentElement.getElementsByTagName("input")[4].checked = true

    		var aviso = document.createTextNode("Selecionando 'Não registrado' automaticamente para você. (Extensão saber-pb)");
    		erros[i].parentElement.appendChild(aviso);
    	}
    }

}

if (window.location.pathname.includes("class_frequencies")){
    if (window.location.pathname.includes("/new") || window.location.pathname.includes("/edit")){
        console.log('Adicionando input de registro de frequência')
        colagem.addEventListener("change", atualizaRegistroDeFrequencia);
        breadcrumbs.appendChild(colagem); //appendChild
        colagem.focus();
        if(window.location.pathname.includes("/new")){
        	atualizaColagemAPartirDoPrimeiroRegistroDaSerie()
        }
        baixar_planilha_link.setAttribute('href', 'https://github.com/edusantana/saber-pb/raw/master/frequencias.xlsx');
        breadcrumbs.appendChild(baixar_planilha_link);
        breadcrumbs.appendChild(plugin_link);
    } else {
        console.log('Auto-seleção da caixa Número de aulas seguidas');
        var numeroDeAulas = document.querySelector("#classes");
        if (numeroDeAulas!=null){
          console.log('Focando em aulas seguidas...');
          atualizaNumeroDeAulasEmSequencia(numeroDeAulas)
        	numeroDeAulas.focus();
          console.log('Número de aulas seguidas focada');
        }else{
        	// Corrigindo erros
        	corrigeOsNaoRegistrados();
        }
    }
}
/* =======================================================*/

/* ============= REGISTRO DE AULA ========================*/
/**
 * Ler das configurações se tem dias sem aulas
 * fix, o ideal seria async para ler de opções
 * me odeio por esse código.
 * @param dia
 * @returns
 */
function temImpedimentoParaAData(dia, dias_sem_aulas){
	var temImpedimento = false;
	for(j=0; j<dias_sem_aulas.length; j++){
		if (dia.includes(dias_sem_aulas[j].substr(0,10))){
			temImpedimento = true;
			break;
		}
	}
	return temImpedimento;
}

/**
 * Ler datas sem aulas de opções da extensão
 * @returns
 */
function realcaDiasSemAulasNaTabela(){

  chrome.storage.sync.get('feriados', function(data) {
	if (data.feriados!=null){
	  	var dias_sem_aulas = data.feriados.split("\n");
	  	//console.log("Configuração de dias sem aulas: '" + dias_sem_aulas+"'");

	  	if (dias_sem_aulas.length == 1){
	  		if (dias_sem_aulas[0] == ""){
	  			dias_sem_aulas = []
	  		}
	  	}

	  	if (dias_sem_aulas.length >= 1){

	  	  	if (document.getElementsByTagName("tbody").length > 0){
	  	  		//console.log("Configuração de dias sem aulas: '" + dias_sem_aulas+"'");
	  	  		let tbody = document.getElementsByTagName("tbody")[0];

	  	  	    for(i=0; i<tbody.children.length; i++){
	  	  	    	let tr = tbody.children[i]
	  	  	    	let dia = tr.firstElementChild.textContent; // data

	  	  	    	if(temImpedimentoParaAData(dia, dias_sem_aulas)){
	  	  	    		// dia sem aula
	  	  	    		// realça problema na linha
	  	  	    		tr.className = tr.className + " alert alert-error"
	  	  	    		tr.title = "Esta data foi configurada como sem aula por você, verifique as opções da extensão."
	  	  	    		console.log("Identificado atividade em data configurada como sem aula: " + dia);
	  	  	    	}
	  	  	    }
	  	  	}else{
	  	  		// Não tem registros cadastrados.
	  	  	}

	  	}else{
	  		// não tem dias impeditivos cadastrados
	  	}

	}

  });
}


if (window.location.pathname.endsWith("class_logs")
		|| window.location.pathname.endsWith("class_frequencies")
		|| window.location.pathname.endsWith("occurrences")
		|| window.location.pathname.endsWith("class_ratings")
		) {
	realcaDiasSemAulasNaTabela();
}

function tipoDaPagina() {
  return "class_logs";
}


function atualizaRegistroDeAula(){
    console.log('Valor mudou!')
    // dia: class_frequency[day]

    var valor_colado = document.getElementById('colagem').value;
    var valores = valor_colado.split("\t");

    console.log('Valores:' + valores);

    if (valores.length > 0){
        document.getElementById('class_log_day').value = valores[0];
    }
    if (valores.length > 1){
        document.getElementById('class_log_classes').value = valores[1];
    }
    if (valores.length > 2){
        document.getElementById('class_log_content').value = valores[2];
    }
    if (valores.length > 3){
        document.getElementById('class_log_methodology').value = valores[3];
    }
    return;
}

if (window.location.pathname.includes("class_logs") &&
        (window.location.pathname.includes("/new") || window.location.pathname.includes("/edit"))){
    console.log('Adicionando input de registro de aula')
    colagem.addEventListener("change", atualizaRegistroDeAula);
    breadcrumbs.appendChild(colagem); //appendChild
    if(window.location.pathname.includes("/new")){
    	atualizaColagemAPartirDoPrimeiroRegistroDaSerie()
    }
    colagem.focus();
    baixar_planilha_link.setAttribute('href', 'https://github.com/edusantana/saber-pb/raw/master/aulas-conteudos.xlsx');
    breadcrumbs.appendChild(baixar_planilha_link);
    breadcrumbs.appendChild(plugin_link);

    // TODO: atualização valor padrão de aulas seguidas

}
/* =======================================================*/

/* ============== NOVA AVALIAÇÃO ===========================*/

function atualizaRegistroDeaAvaliacao(){
    console.log('Valor mudou!')
    // dia: class_frequency[day]

    var valor_colado = document.getElementById('colagem').value;
    var valores = valor_colado.split("\t");

    console.log('Valores:' + valores);

    if (valores.length > 0){
      document.getElementById('class_rating_bimester').selectedIndex = parseInt(valores[0])-1;
    }
    if (valores.length > 1){
      document.getElementById('class_rating_day').value = valores[1];
    }
    if (valores.length > 2){
      document.getElementById('class_rating_kind').selectedIndex = parseInt(valores[2])-1;
    }
    if (valores.length > 3){
        document.getElementById('class_rating_class_rating_type_id').selectedIndex = parseInt(valores[3])-1;
    }
    if (valores.length > 4){
      document.getElementById('class_rating_course_topic').value = valores[4];
    }
    if (valores.length > 5)
{
      inputs = document.getElementsByClassName('students-ratings')[0].getElementsByTagName('input')
      // Nota padrão
      for(i=0; i<inputs.length; i++){
        input = inputs[i]
        if (input.type.endsWith("text")){
          input.value = valores[5]
        }
      }
    }

    return;
}

var legenda = document.getElementsByClassName("legend")[0]
var notas_ext_div = document.createElement("div");
var notas = document.createElement("textarea");
notas.id = "notasTextArea";
notas.placeholder = "Cole aqui as novas notas copiadas do Excel, depois pressione TAB para atualizá-las."
notas.rows = "4";
notas.style="width:100%;"
var nomes = document.createElement("textarea");
nomes.rows = "4";
nomes.title = "Copie essas notas e cole no Excel. Click, CTRL+A, CTRL+C. Abra o excel e CTRL+V."
nomes.disabled = true;
nomes.style="width:100%;"

function criarCamposNotas(){
	//notas.addEventListener("change", atualizaNotas);

	var span_notas = document.createElement("div");
	var nomes_div  = document.createElement("div");
	span_notas.className = "span3"
	span_notas.appendChild(notas);
	span_notas.disabled = false;
	nomes_div.cnlassName = "span3";
	nomes_div.appendChild(nomes);
	notas.className = "input-block-level"

	var estudantes_notas = document.getElementsByClassName('students-ratings')[0]
	var aondeIncluir = document.getElementsByClassName('students-ratings')[0].previousElementSibling
	var divExterno= document.createElement("div");
	divExterno.id="DivParaNotas"
	//estudantes_notas.appendChild(divExterno);
	estudantes_notas.insertBefore(divExterno, estudantes_notas.childNodes[0]);
	//aondeIncluir.insertBefore(divExterno, aondeIncluir)
	divExterno.insertAdjacentHTML('beforeend', '<div class="row-fluid"><div id="idnotas_ext_div" class="row"><div class="col span8" id="nomesTextDiv"></div><div class="col span4" id="notasTextDiv"></div> </div></div>');

	//nomes.attr("disabled","disabled");

	document.getElementById("nomesTextDiv").appendChild(nomes);
	document.getElementById("notasTextDiv").appendChild(notas);

	var estudantes_notas = document.getElementsByClassName('students-ratings')[0]
	var alunos = estudantes_notas.getElementsByClassName('span8')
	var notas4= estudantes_notas.getElementsByClassName('span4')

	for(i=1; i<alunos.length; i++){
		var aluno = alunos[i].textContent.trim()
		var nota = notas4[i].children[0].value

		//console.log(aluno + '\t' + nota);
		nomes.value += aluno + '\t' + nota + "\n";
	}
	//console.log('Notas dos alunos: \n' +nomes.value );


    var inputs = document.getElementsByClassName('students-ratings')[0].getElementsByTagName('input')
    console.log('Notas:');
    // Nota padrão
    for(i=0; i<inputs.length; i++){
      input = inputs[i]
      if (input.type.endsWith("text")){
        //input.value = valores[5]
        //console.log(input.value);
      }
    }

    notas.addEventListener("change", atualizaNotas);

}


function atualizaNotas(){
	console.log('O campo Notas mudou!');
	var valor_colado = document.getElementById('notasTextArea').value;
    var valores = valor_colado.split("\n");
    vi = 0;

    var inputs = document.getElementsByClassName('students-ratings')[0].getElementsByTagName('input')
    console.log('Notas:');
    // Nota padrão
    for(i=0; (i<inputs.length); i++){
      input = inputs[i]
      if (input.type.endsWith("text")){
    	nome_nota= valores[vi].split("\t");
		if (nome_nota[1] === ("10")){
			input.value = "10,0";
		}else{
			input.value = nome_nota[1];
		}
        vi++;
        //console.log(input.value);
      }
    }

}

if (window.location.pathname.includes("class_ratings") &&
        (window.location.pathname.includes("/new") || window.location.pathname.includes("/edit"))){
    console.log('Adicionando input de avaliação')
    colagem.addEventListener("change", atualizaRegistroDeaAvaliacao);

    breadcrumbs.appendChild(colagem); //appendChild
    criarCamposNotas();
    baixar_planilha_link.setAttribute('href', 'https://github.com/edusantana/saber-pb/raw/master/avaliacoes.xlsx');
    breadcrumbs.appendChild(baixar_planilha_link);
    breadcrumbs.appendChild(plugin_link);
    colagem.focus();

    if(window.location.pathname.includes("/new")){
    	atualizaColagemAPartirDoPrimeiroRegistroDaSerie();
    }

}
/* =======================================================*/


function atualizaColagemAPartirDoPrimeiroRegistroDaSerie(){
	chrome.storage.sync.get({
		registros: ''
	}, function(items) {
	    //var valor_colado = document.getElementById('colagem').value;
	    //var valores = valor_colado.split("\t");

		console.log("Registros atuais: " + items.registros)
	    if (items.registros != ''){
	    	let registros = items.registros.split("\n");
	    	console.log("Quantidade de registros: " + registros.length);
	    	let registro = registros.shift();
        console.log("Dados para o novo registro: " + registro);
        colagem.value = registro;
        // Remove apenas registros que não começam com #
        if (!registro.startsWith('#')){
          colagem.dispatchEvent(new Event('change'));
          var registrosAtualizado = registros.join("\n");

          chrome.storage.sync.set({
            registros: registrosAtualizado
          }, function() {
            console.log("Registros atualizados");
            console.log("Atualizando registros com: " + registrosAtualizado);
          });
        }

	    }
	});
}

/*
* Atualiza o valor da caixa com o número de aulas padrão
*/
function atualizaNumeroDeAulasEmSequencia(caixa){
  console.log("Iniciando atualizaNumeroDeAulasEmSequencia...");

  chrome.storage.sync.get({
    aulas_seguidas: '1'
  }, function(items) {
    //console.log("Registros atuais: " + items)
    caixa.value = items.aulas_seguidas;
  });


}
