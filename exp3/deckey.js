const fs = require('fs');
const crypto = require('crypto');

// 读取本地 PEM 格式的私钥
const privateKey = fs.readFileSync('private.pem', 'utf8');
console.log(privateKey);
// 待解密的文本
const encryptedText = 'MzhKNQx+U8ltsj5is29pSwu7yqdgoWPWIhgEwUTz3ywE84ue99Z7T/AISGOuyud6ET4E8xXFS/7wadzwYj3yL6dQrw+F9KFPJRNkTDQll0Re+3kkGt2+M68HJRvmIcJaD1/0PNTv9gek5PdL59TNq/VerwqXusAIIOdclwhb+U1EGJzJ0RS+8Wyp/+PU4J5P2mtFSak5SKNzDB8yg00uyhRBZGriQzw+QQRZanWJYs45UFYIP+9ZMUK3lOkf3b8CT+qGW/HcDFwG59hn59PUvN8UFER3PcOTIRD/+RBSKoi1Sdr7uxvQ3XTBvFJKlDMp1es4yzewmOgluBY2DtGV+aAbLzu5Sy6EfF7tJgid8V9T9ZQ8nqW9vtWkt6Y2okRhdkpX+E+y240gU1BEHOUNglM6oJ1b0nGiAL5cjUtX0IknEAsZR/U2ztsMQRzvy10xJpIgipKB52aNh6BnYzFH4DYndfehKh1NjVckcJOK+krTiUNwQMNhRYSZ8v1pZH6jR96TuDPib1KcJopjaGdf9zNa2bkdJ7NSWTe9j1jHMPJYjrP6XCefsixRTWp5dEz3KgzWEgGBHmIhz2SYYWLcy0SKb3ljYFUrY6tDwVRC+Srkk4GOeS09OvxT3r9E/JdaiA9BXuRjrV7LeCAW18AwbpZEaTHxjrVcoZ5sWpNasCI='; // 替换为实际的加密文本

// 使用私钥解密文本
const decryptedText = crypto.privateDecrypt(privateKey,
    Buffer.from(encryptedText, 'base64')
).toString();

console.log('Decrypted Text:');
console.log(decryptedText);
