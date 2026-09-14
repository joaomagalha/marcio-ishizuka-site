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

(function () {
  var CHAVE = 'nf_consent';

  function ler() {
    try {
      return localStorage.getItem(CHAVE);
    } catch (e) {
      return null;
    }
  }

  function salvar(valor) {
    try {
      localStorage.setItem(CHAVE, valor);
    } catch (e) {}
  }

  function revogarPixel() {
    if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
  }

  // Microsoft Clarity (projeto yfi5c6jgfa). Hoje o painel dele está com os
  // cookies DESATIVADOS, então ele já roda sem cookie e estas chamadas são
  // inofensivas. Ficam aqui prontas pro dia em que os cookies forem ligados no
  // painel (Settings > Setup > Cookies), e aí o consentimento passa a valer
  // pros dois lados sem precisar mexer em código.
  function avisarClarity(aceitou) {
    if (typeof window.clarity !== 'function') return;
    var v = aceitou ? 'granted' : 'denied';
    window.clarity('consentv2', { ad_Storage: v, analytics_Storage: v });
  }

  function montarBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML =
      '<p class="cookie-consent__txt">A gente usa cookies pra medir os anúncios e entender de onde vêm as visitas. ' +
      'Você pode recusar a qualquer momento. Detalhes na <a href="/privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="cookie-consent__acoes">' +
      '<button type="button" class="cookie-consent__btn cookie-consent__btn--no" data-consent="denied">Recusar</button>' +
      '<button type="button" class="cookie-consent__btn cookie-consent__btn--yes" data-consent="granted">Entendi</button>' +
      '</div>';

    el.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('[data-consent]');
      if (!alvo) return;
      var escolha = alvo.getAttribute('data-consent');
      salvar(escolha);
      if (escolha === 'denied') {
        revogarPixel();
        avisarClarity(false);
      } else {
        avisarClarity(true);
      }
      el.remove();
    });

    document.body.appendChild(el);
  }

  function iniciar() {
    var escolha = ler();

    if (escolha === 'denied') {
      revogarPixel();
      avisarClarity(false);
      return;
    }

    if (escolha === 'granted') {
      avisarClarity(true);
      return;
    }

    avisarClarity(true);
    montarBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
