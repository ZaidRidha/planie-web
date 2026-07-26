// Adds a hair space before terminal full stops in headings, so periods
// don't visually hug the preceding word. Idempotent (hair space is \s).
(function () {
  function fix() {
    var heads = document.querySelectorAll('h1,h2,h3,h4');
    for (var i = 0; i < heads.length; i++) {
      var w = document.createTreeWalker(heads[i], NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = w.nextNode())) {
        var t = n.nodeValue;
        var nt = t.replace(/([^\s.])\.(?=$|\s)/g, '$1\u200A.');
        if (nt !== t) n.nodeValue = nt;
      }
    }
  }
  function start() { fix(); setInterval(fix, 600); }
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
