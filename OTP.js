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

  console.log('明文:', plaintext);
  console.log('密钥:', key.toString('hex'));
  console.log('密文:', ciphertext);

  fs.writeFile('cipher.txt', ciphertext, (err) => {
    if (err) {
      console.error('写入失败', err);
      return;
    }
  });
});
