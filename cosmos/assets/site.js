
// Quizzes: pick an answer, see whether it is right and why.
document.querySelectorAll('.quiz').forEach(function (quiz) {
  var total = +quiz.dataset.total, answered = 0, correct = 0;
  quiz.querySelectorAll('.question').forEach(function (q) {
    var answer = +q.dataset.answer, buttons = q.querySelectorAll('button');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        if (q.dataset.done) return;
        q.dataset.done = '1';
        var pick = +b.dataset.index;
        buttons[answer].classList.add('right');
        if (pick !== answer) b.classList.add('wrong'); else correct++;
        q.querySelector('.explanation').hidden = false;
        answered++;
        if (answered === total) {
          var score = Math.round(100 * correct / total);
          quiz.querySelector('.score').textContent = 'Score: ' + correct + ' of ' + total + ' (' + score + '%)' +
            (score >= 70 ? ' — you know this lesson.' : ' — read it again and have another go.');
        }
      });
    });
  });
});

// Worked problems: accept 4.25, 4,25, 5.6e11, 5.6×10^11 and 5.6 x 10¹¹.
function parseNumber(text) {
  var sup = {'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-'};
  var t = text.trim().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, function (c) { return sup[c]; })
              .replace(/−/g, '-').replace(/\s+/g, '');
  t = t.replace(/(?:×|x|\*)10\^?(-?\d+)/i, 'e$1');
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '');
  else t = t.replace(',', '.');
  return /^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t) ? parseFloat(t) : NaN;
}
document.querySelectorAll('.problem').forEach(function (p) {
  var answer = parseFloat(p.dataset.answer), tol = parseFloat(p.dataset.tolerance);
  var input = p.querySelector('input'), verdict = p.querySelector('.verdict');
  function check() {
    var value = parseNumber(input.value);
    verdict.className = 'verdict';
    if (isNaN(value)) { verdict.textContent = 'Type a number, like 4.25 or 5.6e11.'; return; }
    var ok = Math.abs(value - answer) <= tol * Math.abs(answer);
    verdict.classList.add(ok ? 'right' : 'wrong');
    if (ok) verdict.textContent = 'Correct.';
    else if (value !== 0 && Math.abs(Math.log10(Math.abs(value / answer)) % 1) < 0.02 &&
             Math.abs(Math.log10(Math.abs(value / answer))) > 0.5)
      verdict.textContent = 'Right digits, wrong power of ten.';
    else if (Math.abs(value + answer) <= tol * Math.abs(answer)) verdict.textContent = 'Check the sign.';
    else verdict.textContent = 'Not yet — try a hint.';
  }
  p.querySelector('button').addEventListener('click', check);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
});
