const crypto = require('crypto');

// 输入的十六进制字符串
const hexString = '68656c6c6f20776f71231231231231231326c64'; // 'hello world'的十六进制表示

// 将十六进制字符串转换为Buffer
const buffer = Buffer.from(hexString, 'hex');

// 密钥
const secretKey = 'mySecretKey';

// 计算HMAC
const hmac = crypto.createHmac('sha256', secretKey);
hmac.update(buffer);
const hmacResult = hmac.digest('hex');

console.log('HMAC:', hmacResult);