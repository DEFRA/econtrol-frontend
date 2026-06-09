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


const textarea = /** @type {HTMLTextAreaElement | null} */(document.getElementById("permitReferences"))
const countEl = document.getElementById("permitCount")
const applyMrnRefEl = document.getElementById("applyReferenceLink");

function countPermits() {
  if (!textarea) return 0;
  const value = textarea.value
  const permitRefs = value.split(/[\n,]+/).map(function (r) { return r.replace(/\./g, '').trim().toUpperCase() }).filter(Boolean)
  return new Set(permitRefs).size
}

function updateCount() {
  if (!countEl) return
  const n = countPermits()
  countEl.textContent = n > 0 ? `You have entered ${n} permit number${(n === 1 ? "" : "s")}.` : "";
}

if (applyMrnRefEl != null) {
  applyMrnRefEl.addEventListener('click', (e) => {
    e.preventDefault();
    const mrnInputEl = document.getElementById("mrnReference");
    const applyHintEl = document.getElementById("mrnReference-apply-hint");
    if (mrnInputEl && applyHintEl) {
      fetch('/set-mrn', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mrn: mrnInputEl.value ? mrnInputEl.value.trim() : "" })
      }).then(r => {
        if (r.ok) {
          applyHintEl.textContent = "Applied to all permits";
        } else {
          applyHintEl.textContent = "Applying MRN to all permits failed"
        }
      });
    }
  })
}

if (textarea != null) {
  textarea.addEventListener('input', updateCount)
  textarea.addEventListener('paste', (e) => {
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
