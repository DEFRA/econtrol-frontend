import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Header,
  Radios,
  SkipLink
} from 'govuk-frontend'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Header)
createAll(Radios)
createAll(SkipLink)

var textarea = document.getElementById('permitReferences')
var countEl = document.getElementById('permitCount')

function countPermits() {
  var value = textarea.value || ''
  var refs = value.split(/[\n,]+/).map(function (r) { return r.replace(/\./g, '').trim().toUpperCase() }).filter(Boolean)
  return new Set(refs).size
}

function updateCount() {
  if (!countEl) return
  var n = countPermits()
  countEl.textContent = n > 0 ? 'You have entered ' + n + ' permit reference' + (n === 1 ? '' : 's') : ''
}

textarea.addEventListener('input', updateCount)
textarea.addEventListener('paste', function (e) {
  e.preventDefault()
  var pasted = (e.clipboardData || window.clipboardData).getData('text')
  var refs = pasted.split(/[\s,]+/).map(function (r) { return r.trim() }).filter(Boolean)
  var formatted = refs.join('\n')
  if (formatted.length > 0 && formatted.slice(-1) !== '\n') {
    formatted += '\n'
  }
  var start = textarea.selectionStart
  var end = textarea.selectionEnd
  var value = textarea.value
  var before = value.substring(0, start)
  var after = value.substring(end)
  textarea.value = before + formatted + after
  var newPos = before.length + formatted.length
  textarea.selectionStart = textarea.selectionEnd = newPos
  updateCount()
})

updateCount()
