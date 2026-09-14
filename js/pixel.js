// Meta Pixel — eventos de conversão. Criado em 14/09/2026.
//
// O snippet base (fbevents.js + init + PageView) fica inline no <head> do
// index.html. Este arquivo cuida dos eventos de conversão.
//
// Pixel ID: 579964108858174 ("Pixel de Conta SutdioMi", do BM Studio Marcio
// ishizuka). É o MESMO do site semente, de propósito: os dois sites alimentam
// o mesmo público, e é esse público que vai sustentar a campanha de
// remarketing (ver clientes/marcio/plano-campanha-quente-remarketing.md).
//
// DOIS EVENTOS, e o segundo ainda não tem onde disparar:
//
// 1. Lead — clique em CTA que leva pro grupo de WhatsApp. É o que existe hoje.
// 2. InitiateCheckout — clique em qualquer link pro checkout da Hotmart. Ainda
//    NÃO existe link desses nesta página. Está escrito desde já porque este
//    site vai virar a página de vendas, e assim no dia em que o botão de
//    compra entrar, a medição já funciona sem ninguém lembrar de voltar aqui.
//
// Dedup: cada evento dispara no máximo 1x por sessão (sessionStorage). Sem
// isso, 3 cliques no mesmo botão viram 3 conversões, o que infla a métrica e
// atrapalha a otimização da campanha.
//
// Consentimento: opt-out. Mede por padrão, para só com recusa explícita
// ('nf_consent' = 'denied' no localStorage, gravado por js/consent.js).

(function () {
  var CTA_WHATSAPP = 'a[href^="https://chat.whatsapp.com/"]';
  var CTA_CHECKOUT = 'a[href*="pay.hotmart.com"]';

  function podeMedir() {
    try {
      return localStorage.getItem('nf_consent') !== 'denied';
    } catch (e) {
      // localStorage bloqueado (aba anônima, bloqueio de site data): mede,
      // porque o padrão do site é opt-out e não houve recusa registrada.
      return true;
    }
  }

  function jaDisparou(flag) {
    try {
      return sessionStorage.getItem(flag) === '1';
    } catch (e) {
      return false;
    }
  }

  function marcar(flag) {
    try {
      sessionStorage.setItem(flag, '1');
    } catch (e) {}
  }

  function disparar(evento, flag, dados) {
    if (!podeMedir()) return;
    if (jaDisparou(flag)) return;
    if (typeof window.fbq !== 'function') return;
    window.fbq('track', evento, dados);
    marcar(flag);
  }

  document.querySelectorAll(CTA_WHATSAPP).forEach(function (botao) {
    botao.addEventListener('click', function () {
      disparar('Lead', 'nf_lead_enviado', {
        content_name: 'Grupo WhatsApp Ninja Facil'
      });
    });
  });

  document.querySelectorAll(CTA_CHECKOUT).forEach(function (botao) {
    botao.addEventListener('click', function () {
      disparar('InitiateCheckout', 'nf_checkout_enviado', {
        content_name: 'Ninja Facil',
        value: 199.0,
        currency: 'BRL'
      });
    });
  });
})();
