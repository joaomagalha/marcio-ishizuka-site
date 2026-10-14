// Banner de cookies (LGPD) — criado em 14/09/2026, já nasce em opt-out.
//
// POR QUE ESTE ARQUIVO EXISTE: até 14/09 este site não tinha Pixel, banner nem
// política de privacidade, e por isso rodava o Clarity em modo sem cookie. Com
// a decisão de transformar ele na página de vendas do Ninja Fácil, entrou o
// Meta Pixel, e com Pixel vem cookie (_fbp), que exige aviso e política.
//
// COMO FUNCIONA (opt-out): o Pixel entra LIGADO. O banner informa o uso e
// oferece a recusa. Quem recusa dispara fbq('consent','revoke') e para de ser
// medido daquele ponto em diante.
//
// O padrão é opt-out porque no site semente o opt-in mediu só 14,3% (231
// cliques de anúncio viraram 33 visualizações registradas), e sem público não
// existe remarketing. Decisão do João em 14/09/2026, mesma do outro site.
//
// A escolha fica em localStorage ('nf_consent' = 'granted' | 'denied') e vale
// pras próximas visitas: o banner não reaparece.
//
// ATENÇÃO, quem for mexer: a revogação de quem JÁ recusou acontece de forma
// SÍNCRONA no <head> do index.html, antes do fbq('init'). Este arquivo carrega
// com defer e rodaria tarde demais pra impedir o primeiro PageView.
//
// 14/10/2026 (item 2 da lista de ataque, guia de cookies da ANPD de 2022):
// os botões "Recusar", "Gerenciar" e "Aceitar" têm o mesmo formato e destaque
// (p. 22 e 33 do guia), o "Gerenciar" abre as categorias (medição de visitas e
// anúncios, cada uma com chave própria), e o link "Cookies" do rodapé reabre
// as categorias pra mudar a escolha depois (window.nfCookies.abrir). O Pixel
// CONTINUA opt-out, por decisão do João em 14/10/2026: começa ligado e só para
// quando a pessoa recusa ou desliga "Anúncios".
//
// Chaves no localStorage:
//   nf_consent         = 'granted' | 'denied'  -> anúncios (Meta Pixel). O <head>
//                        do index.html e o js/pixel.js leem esta chave.
//   nf_consent_medicao = 'granted' | 'denied'  -> medição de visitas (Clarity).
//                        Sem ela (quem escolheu antes de 14/10), vale nf_consent.


(function () {
  var CHAVE = 'nf_consent';
  var CHAVE_MEDICAO = 'nf_consent_medicao';

  function ler(chave) {
    try {
      return localStorage.getItem(chave);
    } catch (e) {
      return null;
    }
  }

  function salvar(chave, valor) {
    try {
      localStorage.setItem(chave, valor);
    } catch (e) {}
  }

  function pixel(ligado) {
    if (typeof window.fbq === 'function') window.fbq('consent', ligado ? 'grant' : 'revoke');
  }

  // Microsoft Clarity (projeto yfi5c6jgfa): consentimento separado pra
  // medição (analytics) e anúncios (ad), na API consentv2.
  function avisarClarity(medicao, anuncios) {
    if (typeof window.clarity !== 'function') return;
    window.clarity('consentv2', {
      analytics_Storage: medicao ? 'granted' : 'denied',
      ad_Storage: anuncios ? 'granted' : 'denied'
    });
  }

  // Estado atual. Sem escolha salva, os dois começam ligados (opt-out).
  function estado() {
    var anuncios = ler(CHAVE) !== 'denied';
    var med = ler(CHAVE_MEDICAO);
    var medicao = med ? med !== 'denied' : anuncios;
    return { medicao: medicao, anuncios: anuncios };
  }

  function aplicar(medicao, anuncios) {
    salvar(CHAVE, anuncios ? 'granted' : 'denied');
    salvar(CHAVE_MEDICAO, medicao ? 'granted' : 'denied');
    pixel(anuncios);
    avisarClarity(medicao, anuncios);
  }

  var POLITICA = 'Detalhes na <a href="/privacidade.html">Política de Privacidade</a>.';

  function nivel1() {
    return '<p class="cookie-consent__txt">A gente usa cookies pra medir os anúncios e as visitas. ' + POLITICA + '</p>' +
      '<div class="cookie-consent__acoes">' +
      '<button type="button" class="cookie-consent__btn" data-acao="recusar">Recusar</button>' +
      '<button type="button" class="cookie-consent__btn" data-acao="gerenciar">Gerenciar</button>' +
      '<button type="button" class="cookie-consent__btn" data-acao="aceitar">Aceitar</button>' +
      '</div>';
  }

  function nivel2() {
    var e = estado();
    return '<p class="cookie-consent__txt"><b>Escolha os cookies.</b> ' + POLITICA + '</p>' +
      '<ul class="cookie-consent__cats">' +
      '<li><span><b>Necessários</b> guardam esta escolha. Sempre ligados.</span></li>' +
      '<li><label><input type="checkbox" data-cat="medicao"' + (e.medicao ? ' checked' : '') + '> <span><b>Medição de visitas</b> (Microsoft Clarity): como a página é usada.</span></label></li>' +
      '<li><label><input type="checkbox" data-cat="anuncios"' + (e.anuncios ? ' checked' : '') + '> <span><b>Anúncios</b> (Meta): resultado dos anúncios no Instagram e no Facebook.</span></label></li>' +
      '</ul>' +
      '<div class="cookie-consent__acoes">' +
      '<button type="button" class="cookie-consent__btn" data-acao="recusar">Recusar tudo</button>' +
      '<button type="button" class="cookie-consent__btn" data-acao="salvar">Salvar escolha</button>' +
      '</div>';
  }

  var aberto = null;

  function montar(conteudo) {
    if (aberto) aberto.remove();
    var el = document.createElement('div');
    el.className = 'cookie-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML = conteudo;

    el.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('[data-acao]');
      if (!alvo) return;
      var acao = alvo.getAttribute('data-acao');
      if (acao === 'gerenciar') {
        el.innerHTML = nivel2();
        el.classList.add('is-gerenciar');
        return;
      }
      if (acao === 'aceitar') aplicar(true, true);
      else if (acao === 'recusar') aplicar(false, false);
      else if (acao === 'salvar') {
        aplicar(
          !!el.querySelector('[data-cat="medicao"]:checked'),
          !!el.querySelector('[data-cat="anuncios"]:checked')
        );
      }
      el.remove();
      aberto = null;
    });

    document.body.appendChild(el);
    aberto = el;
    return el;
  }

  // Link "Cookies" do rodapé: reabre as categorias pra mudar a escolha.
  window.nfCookies = {
    abrir: function () {
      var el = montar(nivel2());
      el.classList.add('is-gerenciar');
    }
  };
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('[data-cookies-abrir]');
    if (!a) return;
    ev.preventDefault();
    window.nfCookies.abrir();
  });

  function iniciar() {
    var e = estado();
    var escolheu = ler(CHAVE) !== null;
    if (!e.anuncios) pixel(false);
    avisarClarity(e.medicao, e.anuncios);
    if (!escolheu) montar(nivel1());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
