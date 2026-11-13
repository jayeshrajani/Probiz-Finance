#!/usr/bin/env python3
"""One-off patch: add required (*) labels and optional hints to duplicated ITR job form in loanoffers.js files."""

import pathlib

MARKER_START = '<h4 className="font-semibold mt-4">1. Basic Information</h4>'
MARKER_END = '{/* -------- Submit ITR Button -------- */}'

# Lines without leading indent — script applies file's indent to each non-empty line.
BODY_LINES = [
    '<h4 className="font-semibold mt-4">1. Basic Information</h4>',
    '<p className="text-xs text-gray-500 mt-1">Fields marked with <span className="text-red-600 font-semibold">*</span> are required.</p>',
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Full Name (as per PAN) <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="Full Name (as per PAN)"',
    '      value={itrFullName} onChange={(e) => setItrFullName(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">PAN <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="PAN (e.g. ABCDE1234F)"',
    '      value={itrPan} onChange={(e) => setItrPan(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Date of birth <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input type="date" className="border p-2 w-full"',
    '      value={itrDob} onChange={(e) => setItrDob(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Mobile <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="10-digit mobile number"',
    '      value={itrMobile} onChange={(e) => setItrMobile(e.target.value)} />',
    '  </div>',
    '  <div className="md:col-span-2">',
    '    <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="Email"',
    '      value={itrEmail} onChange={(e) => setItrEmail(e.target.value)} />',
    '  </div>',
    '</div>',
    '',
    '{/* ----- 2. Salary Income ----- */}',
    '<h4 className="font-semibold mt-6">2. Salary Income <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>',
    '<div className="space-y-3 mt-2">',
    '  <input className="border p-2 w-full" placeholder="Annual Gross Salary (₹)"',
    '    value={itrAnnualGrossSalary} onChange={(e) => setItrAnnualGrossSalary(e.target.value)} />',
    '',
    '  <input className="border p-2 w-full" placeholder="TDS as per Form 16 (₹)"',
    '    value={itrTdsForm16} onChange={(e) => setItrTdsForm16(e.target.value)} />',
    '</div>',
    '',
    '{/* ----- 3. Other Income ----- */}',
    '<h4 className="font-semibold mt-6">3. Other Income <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>',
    '<div className="space-y-3 mt-2">',
    '  <input className="border p-2 w-full" placeholder="Savings Account Interest (₹)"',
    '    value={itrSavingsInterest} onChange={(e) => setItrSavingsInterest(e.target.value)} />',
    '',
    '  <input className="border p-2 w-full" placeholder="Other Income (Dividend, FD Interest, etc.)"',
    '    value={itrOtherIncome} onChange={(e) => setItrOtherIncome(e.target.value)} />',
    '',
    '  <input className="border p-2 w-full" placeholder="Other Income Description"',
    '    value={itrOtherIncomeDescription} onChange={(e) => setItrOtherIncomeDescription(e.target.value)} />',
    '</div>',
    '',
    '{/* ----- 4. Total Deductions ----- */}',
    '<h4 className="font-semibold mt-6">4. Total Deductions <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>',
    '<input className="border p-2 w-full" placeholder="Eligible Deductions (80C, 80D, 80G etc.)"',
    '  value={itrEligibleDeductions} onChange={(e) => setItrEligibleDeductions(e.target.value)} />',
    '',
    '<input className="border p-2 w-full mt-3" placeholder="Deductions Description"',
    '  value={itrDeductionsDescription} onChange={(e) => setItrDeductionsDescription(e.target.value)} />',
    '',
    '{/* ----- 5. Tax Already Paid ----- */}',
    '<h4 className="font-semibold mt-6">5. Tax Already Paid <span className="text-gray-400 text-sm font-normal">(optional)</span></h4>',
    '<div className="space-y-3">',
    '  <input className="border p-2 w-full" placeholder="TDS as per Form 26AS (₹)"',
    '    value={itrTdsForm26AS} onChange={(e) => setItrTdsForm26AS(e.target.value)} />',
    '',
    '  <input className="border p-2 w-full" placeholder="Advance/Self Assessment Tax (₹)"',
    '    value={itrAdvanceTax} onChange={(e) => setItrAdvanceTax(e.target.value)} />',
    '</div>',
    '',
    '{/* ----- 6. Bank Details for Refund ----- */}',
    '<h4 className="font-semibold mt-6">6. Bank Details for Refund</h4>',
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Account number <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="Account Number"',
    '      value={itrAccountNumber} onChange={(e) => setItrAccountNumber(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">IFSC code <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="IFSC (e.g. HDFC0001234)"',
    '      value={itrIfscCode} onChange={(e) => setItrIfscCode(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Bank name <span className="text-red-600" aria-label="required">*</span></label>',
    '    <input className="border p-2 w-full" placeholder="Bank Name"',
    '      value={itrBankName} onChange={(e) => setItrBankName(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Account type <span className="text-red-600" aria-label="required">*</span></label>',
    '    <select className="border p-2 w-full"',
    '      value={itrAccountType} onChange={(e) => setItrAccountType(e.target.value)}>',
    '      <option value="">Select account type</option>',
    '      <option>Savings</option>',
    '      <option>Current</option>',
    '      <option>Fixed Deposit</option>',
    '      <option>Recurring Deposit</option>',
    '    </select>',
    '  </div>',
    '</div>',
    '',
    '{/* ----- 7. Declaration ----- */}',
    '<h4 className="font-semibold mt-6">7. Declaration (optional)</h4>',
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Place</label>',
    '    <input className="border p-2 w-full" placeholder="Place"',
    '      value={itrPlace} onChange={(e) => setItrPlace(e.target.value)} />',
    '  </div>',
    '  <div>',
    '    <label className="block text-sm text-gray-700 mb-1">Declaration date</label>',
    '    <input type="date" className="border p-2 w-full"',
    '      value={itrDeclarationDate} onChange={(e) => setItrDeclarationDate(e.target.value)} />',
    '  </div>',
    '  <div className="md:col-span-2">',
    '    <label className="block text-sm text-gray-700 mb-1">Signature (name as on record)</label>',
    '    <input className="border p-2 w-full" placeholder="Signature"',
    '      value={itrSignature} onChange={(e) => setItrSignature(e.target.value)} />',
    '  </div>',
    '</div>',
    '',
]


def apply_indent(indent: str, lines: list[str]) -> str:
    out = []
    for line in lines:
        if line.strip() == "":
            out.append("")
        else:
            out.append(indent + line)
    return "\n".join(out)


def patch_file(path: pathlib.Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if MARKER_START not in text or MARKER_END not in text:
        return False
    if "aria-label=\"required\"" in text and "Declaration date" in text:
        return False  # already patched

    idx = text.find(MARKER_START)
    line_start = text.rfind("\n", 0, idx) + 1
    indent = text[line_start:idx]

    end_idx = text.find(MARKER_END, idx)
    if end_idx == -1:
        return False

    new_block = apply_indent(indent, BODY_LINES)
    new_text = text[:line_start] + new_block + "\n\n" + indent + text[end_idx:]
    path.write_text(new_text, encoding="utf-8")
    return True


def main():
    root = pathlib.Path(__file__).resolve().parent.parent / "components"
    n = 0
    for path in sorted(root.glob("**/loanoffers.js")):
        if patch_file(path):
            print("patched", path.relative_to(root.parent))
            n += 1
    print("done,", n, "files")


if __name__ == "__main__":
    main()
