(function(){
  if (Auth.user()) { go(nextUrl() || 'index.html'); return; }

  $('#rf').onsubmit = e => {
    e.preventDefault();
    const v = V(), nm = $('#nm').value.trim(), em = $('#em').value.trim(), pw = $('#pw').value;
    v('nm', nm.length >= 3, 'Name must be at least 3 characters.');
    v('em', EMAIL.test(em), 'Enter a valid email address.');
    v('pw', pw.length >= 6 && /\d/.test(pw), 'Use 6+ characters including a number.');
    v('pc', $('#pc').value === pw, 'Passwords do not match.');
    if (!v.ok()) return;
    if (!Auth.register(nm, em, pw)) { $('#e_form').textContent = 'An account with this email already exists.'; return; }
    go(nextUrl() || 'index.html');
  };
})();