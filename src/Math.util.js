/*
Math functions for SpreadSheet
*/
export function SUM(...arr) {
  return arr.reduce((acc, item) => acc + parseFloat(item), 0);
}
export function POWER(key1, key2) {
  return key1 ** key2;
}
export function AVERAGE(...arr) {
  return arr.reduce((acc, item) => acc + parseFloat(item), 0) / arr.length;
}
