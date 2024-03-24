const fs = require('fs');
const crypto = require('crypto');

function generateKey(length) {
  return crypto.randomBytes(length);
}

function oneTimePadEncrypt(plaintext, key) {
  let ciphertext = '';
  for (let i = 0; i < plaintext.length; i++) {
    const charCode = plaintext.charCodeAt(i) ^ key[i];
    ciphertext += String.fromCharCode(charCode);
  }
  return ciphertext;
}

fs.readFile('plain.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const plaintext = data.trim();
  const key = generateKey(plaintext.length);

  const ciphertext = oneTimePadEncrypt(plaintext, key);

  console.log('Plaintext:', plaintext);
  console.log('Key:', key.toString('hex'));
  console.log('Ciphertext:', ciphertext);

  fs.writeFile('cipher.txt', ciphertext, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    console.log('Ciphertext written to cipher.txt');
  });
});
