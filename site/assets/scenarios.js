/* Scenario index filters (audience, goal, level) over the server-rendered list. */
(function () {
  var list = document.getElementById('slist'); if (!list) return;
  var aud = document.getElementById('saud'), goal = document.getElementById('sgoal'), level = document.getElementById('slevel'), count = document.getElementById('scount');
  var items = Array.from(list.children);
  Array.from(new Set(items.map(function (li) { return li.getAttribute('data-aud'); }))).sort().forEach(function (a) { var o = document.createElement('option'); o.value = a; o.textContent = a.replace(/_/g, ' '); aud.append(o); });
  function apply() {
    var n = 0;
    items.forEach(function (li) {
      var ok = (!aud.value || li.getAttribute('data-aud') === aud.value) && (!goal.value || li.getAttribute('data-goal').split(' ').indexOf(goal.value) >= 0) && (!level.value || li.getAttribute('data-level') === level.value);
      li.hidden = !ok; if (ok) n++;
    });
    count.textContent = n + ' / ' + items.length;
  }
  [aud, goal, level].forEach(function (el) { el.addEventListener('change', apply); }); apply();
})();
