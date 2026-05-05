import { mapStatusLabel, isValidPermitNumber, isExportNotImport } from './utils.js'

describe("mapStatusLabel()", () => {
  it.each`
    input                   | output
    ${"Returned - Used"}    | ${"Endorsed"}
    ${"Returned - Unused"}  | ${"Invalid"}
    ${"other status"}       | ${"other status"}
  `("returns $output for $input", ({ input, output }) => {
    expect(mapStatusLabel(input)).toBe(output)
  })
})

describe("isValidPermitNumber()", () => {
  it.each`
    input                 | output
    ${"00GBEXP012345"}    | ${true}
    ${"00GBIMP012345"}    | ${true}
    ${"XXGBEXP012345"}    | ${false}
    ${"00XXEXP012345"}    | ${false}
    ${"00GBXXX012345"}    | ${false}
    ${"00GBXXX01234"}     | ${false}
    ${"00GBXXX0123456"}   | ${false}
  `("returnss $output for $input", ({ input, output }) => {
    expect(isValidPermitNumber(input)).toBe(output)
  })
})

describe("isExportNotImport()", () => {
  it.each`
    input              | output
    ${"____EXP_____"} | ${true}
    ${"____IMP_____"} | ${false}
    ${"nonsense"}     | ${false}
  `("returns $output for $input", ({ input, output }) => {
    expect(isExportNotImport(input)).toBe(output)
  })
})
