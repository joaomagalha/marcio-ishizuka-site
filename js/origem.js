// Origem da venda no link da Hotmart. Criado em 14/10/2026.
//
// Por quê: na leitura do perpétuo (08 a 13/10) a única venda apareceu na
// Hotmart como "Origem: Não identificada", e não dava pra saber se veio do
// anúncio, do Instagram, da live ou do grupo. A Hotmart lê dois parâmetros do
// link de checkout e mostra no relatório de vendas:
//   src = coluna "Origem" (e filtro "Origem (SRC)")
//   sck = "Origem de Checkout"
// Este arquivo descobre de onde a pessoa chegou e cola os dois em todo botão
// de compra (a[href*="pay.hotmart.com"]). Detalhe e leitura que motivou:
// clientes/marcio/2026-10-13-leitura-perpetuo.md no vault.
//
// De onde vem a origem, em ordem:
//   1. utm_source / utm_campaign / utm_content no endereço (o anúncio manda:
//      utm_source=meta&utm_campaign=perpetuo&utm_content=<peça>)
//   2. src / sck já no endereço (link pronto mandado no grupo, por exemplo)
//   3. site de onde veio (Instagram, Facebook, Google, YouTube, WhatsApp)
//   4. fbclid sem utm e sem site de origem = "meta-sem-utm" (pode ser orgânico)
//   5. nada disso = "site" (digitou o endereço ou abriu de app que não conta)
// A origem fica no sessionStorage da aba: quem entra pelo anúncio, vai em
// /equipamentos e volta pra home continua contando como anúncio. Se na mesma
// aba chegar de novo por outro canal marcado, vale a chegada mais recente.
//
// Falhar fechado no sentido certo: qualquer erro aqui deixa o link como está
// (o de sempre, com ?off=od2wvm81), então a compra nunca quebra. O off e
// qualquer outro parâmetro do link são preservados; só src e sck são escritos.
// O pixel.js acha os botões pelo mesmo seletor e continua medindo o clique.

(function () {
  var CHAVE = 'nf_origem';
  var LINK = 'a[href*="pay.hotmart.com"]';

  // Regra da Hotmart (Central de Ajuda, artigo 216441797, lido 14/10/2026):
  // até 30 caracteres e o _ é PROIBIDO no valor (reservado pro sistema).
  // Fica só letra, número e hífen.
  function limpo(v) {
    if (!v) return '';
    return String(v).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30)
      .replace(/-+$/, '');
  }

  function pelaReferencia() {
    var host = '';
    try { host = new URL(document.referrer).hostname; } catch (e) { return ''; }
    // o próprio site (com ou sem www) não é origem: é navegação interna
    if (!host || host === location.hostname || /(^|\.)ninjadafoto\.com\.br$/.test(host)) return '';
    // app Android manda android-app://com.instagram.android: casar pelo nome
    if (/instagram/.test(host)) return 'instagram';
    if (/facebook|(^|\.)fb\.(com|me)$/.test(host)) return 'facebook';
    if (/youtube|(^|\.)youtu\.be$/.test(host)) return 'youtube';
    if (/whatsapp|(^|\.)wa\.me$/.test(host)) return 'whatsapp';
    if (/google/.test(host)) return 'google';
    return limpo(host.replace(/^www\./, ''));
  }

  function daChegada() {
    var p = new URLSearchParams(location.search);
    var src = limpo(p.get('utm_source')) || limpo(p.get('src'));
    var sck = limpo([p.get('utm_campaign'), p.get('utm_content')].filter(Boolean).join('-')) || limpo(p.get('sck'));
    // fbclid sozinho NÃO prova anúncio: o Instagram e o Facebook põem fbclid
    // até em link da bio e de story. Anúncio de verdade vem com utm_source.
    if (!src) src = pelaReferencia();
    if (!src && p.get('fbclid')) src = 'meta-sem-utm';
    if (!src && sck) src = 'site';     // link com só ?sck= (grupo): guarda o sck
    return src ? { src: src, sck: sck } : null;
  }

  function lerSalva() {
    try { return JSON.parse(sessionStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; }
  }

  function salvar(o) {
    try { sessionStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {}
  }

  function origem() {
    var nova = daChegada();
    if (nova) { salvar(nova); return nova; }   // chegada marcada vale mais que a da aba
    var velha = lerSalva();
    if (velha && velha.src) return velha;
    var direto = { src: 'site', sck: '' };
    salvar(direto);
    return direto;
  }

  function aplicar() {
    var o = origem();
    document.querySelectorAll(LINK).forEach(function (a) {
      try {
        var u = new URL(a.href);
        u.searchParams.set('src', o.src);
        if (o.sck) u.searchParams.set('sck', o.sck); else u.searchParams.delete('sck');
        a.href = u.toString();
      } catch (e) {}
    });
  }

  try { aplicar(); } catch (e) {}
})();
