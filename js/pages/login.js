(function(){
  const cu = Auth.user();
  if (cu) { go(nextUrl() || (cu.role === 'admin' ? 'admin/dashboard.html' : 'index.html')); return; }

  window.fill = (e, p) => { $('#em').value = e; $('#pw').value = p; };

  $('#lf').onsubmit = e => {
    e.preventDefault();
    const v = V(), em = $('#em').value.trim(), pw = $('#pw').value;
    v('em', EMAIL.test(em), 'Enter a valid email address.');
    v('pw', pw.length >= 6, 'Password must be at least 6 characters.');
    if (!v.ok()) return;
    const u = Auth.login(em, pw);
    if (!u) { $('#e_form').textContent = 'Incorrect email or password.'; return; }
    go(nextUrl() || (u.role === 'admin' ? 'admin/dashboard.html' : 'index.html'));
  };
})();