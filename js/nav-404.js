// GitHub Pages serves 404.html at the missing URL itself, so under a deep
// path such as /thresherium/a/b every relative asset would resolve into the
// wrong folder. Compute the site root and hand control to the app there,
// before anything else loads. Kept in its own file: no inline script under CSP.
(function () {
  var host = location.hostname;
  var root = "/";
  if (/\.github\.io$/i.test(host)) {
    // Project site: the first path segment is the repository name.
    var seg = location.pathname.split("/")[1];
    if (seg) root = "/" + seg + "/";
  }
  location.replace(root + "#/404");
})();
