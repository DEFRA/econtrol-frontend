export const mapStatusLabel = (statusLabel) => ({
  "Returned - Used": "Endorsed",
  "Returned - Unused": "Invalid"
})[statusLabel] || statusLabel

export function isValidPermitNumber(permitNumber) {
  return RegExp("^[0-9]{2}GB(IMP|EXP)[A-Z0-9]{6}$").test(permitNumber)
}

export function isExportNotImport(validPermitNumber) {
  return validPermitNumber.slice(4, 7) === "EXP"
}
