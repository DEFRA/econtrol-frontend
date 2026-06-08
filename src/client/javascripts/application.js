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


const textarea = /** @type {HTMLTextAreaElement | null} */(document.getElementById('permitReferences'))
const countEl = document.getElementById("permitCount")

function countPermits() {
  const value = textarea?.value || ''
  const permitRefs = value.split(/[\n,]+/).map(function (r) { return r.replace(/\./g, '').trim().toUpperCase() }).filter(Boolean)
  return new Set(permitRefs).size
}

function updateCount() {
  if (!countEl) return
  const n = countPermits()
  countEl.textContent = n > 0 ? `You have entered ${n} permit number${(n === 1 ? "" : "s")}.` : "";
}

if (textarea != null) {
  textarea.addEventListener('input', updateCount)
  textarea.addEventListener('paste', function (e) {
    e.preventDefault()
    const pastedText = (e?.clipboardData?.getData("text") || "")
    const refs = pastedText.split(/[\s,]+/).map((r) => r.trim()).filter(Boolean)
    const formatted = refs.length > 0 ? `${refs.join('\n')}\n` : "";
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    const before = value.substring(0, start)
    const after = value.substring(end)
    textarea.value = before + formatted + after
    const newPos = before.length + formatted.length
    textarea.selectionStart = textarea.selectionEnd = newPos
    updateCount()
  })
}

updateCount()
