const fs = require('fs');
const crypto = require('crypto');
const { error } = require('console');

// 读取加密的 BMP 文件
// let enfile='hmac_encrypted_image.bmp'
let enfile = 'hmac_attacked_image.bmp'
fs.readFile(enfile, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 解密 BMP 文件
    const decryptedData = decryptBMP(data);

    // 将解密后的数据写入新的 BMP 文件
    writeDecryptedDataToFile(decryptedData);
});

// 解密 BMP 文件
function decryptBMP(data) {
    // 从文件中提取加密数据
    const encryptedImageData = data.slice(54 + 32); // 从偏移量 54 处开始，跳过文件头和信息头
    const encryptedDataHex = encryptedImageData.toString('hex');


    // 计算HMAC
    const secretKey = "12312312387867867867868678653453"
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(encryptedImageData.toString('hex'));
    const hmacResult = hmac.digest('hex');

    const orihmac = data.slice(54, 54 + 32).toString('hex')

    console.log(hmacResult);
    console.log(orihmac);
    if (orihmac == hmacResult) {
        console.log('yes');
    } else {
        console.log('no');
        throw new Error('HMAC不匹配')
    }

    // 使用之前的密钥和初始化向量
    const key = Buffer.from('8cf95a93ddb860ff6155fbe502ca1f798cf95a93ddb860ff6155fbe502ca1f79', 'hex'); // 将密钥替换为加密时使用的密钥
    const iv = Buffer.from('98c49563bcd639013600bb4215161249', 'hex'); // 将初始化向量替换为加密时使用的初始化向量

    // 使用 AES CBC 解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decryptedData = decipher.update(encryptedDataHex, 'hex', 'hex');
    decryptedData += decipher.final('hex');

    return {
        headData: data.slice(0, 54),
        pixelData: Buffer.from(decryptedData, 'hex')
    };
}

// 将解密后的数据写入新的 BMP 文件
function writeDecryptedDataToFile(decryptedData) {
    // 读取原始 BMP 文件头和信息头
    const bmpHeader = decryptedData.headData.slice(0, 14);
    const bmpInfoHeader = decryptedData.headData.slice(14, 54);

    // 创建新的 BMP 文件
    const decryptedImageData = decryptedData.pixelData;
    const decryptedFileData = Buffer.concat([bmpHeader, bmpInfoHeader, decryptedImageData]);

    fs.writeFile('hmac_decrypted_image.bmp', decryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Decrypted image file saved as hmac_decrypted_image.bmp');
    });
}
