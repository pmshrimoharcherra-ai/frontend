/**
 * Student Status Utilities
 * Standardizes transferred student detection and pending field verification across PM SHRI School Portal.
 */

export const isTransferredStudent = (student) => {
  if (!student) return false;
  const status = String(student.status || '').trim().toLowerCase();
  if (status === 'transferred') return true;
  const father = String(student.father || '').trim().toLowerCase();
  if (father === 't/c' || father === 'tc' || father === 'transfer certificate') return true;
  const notes = String(student.notes || '').trim().toLowerCase();
  if (notes.includes('transferred') || notes.includes('tc issued') || notes.includes('transfer certificate')) return true;
  return false;
};

export const isFieldPending = (val) => {
  if (val === null || val === undefined) return true;
  const str = String(val).trim();
  if (str === '' || str === '—' || str === '-' || str === 'N/A' || str === 'NA' || str === 'null' || str === 'undefined') return true;
  const lower = str.toLowerCase();
  return lower === 'pending' || lower === 'not found' || lower === 'not available' || lower === 'unrecorded' || lower === 'none';
};
