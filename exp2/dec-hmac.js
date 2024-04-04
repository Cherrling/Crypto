const fs = require('fs');
const crypto = require('crypto');
const { error } = require('console');
const { program } = require('commander');
program
    .option('-k,--key <key>', 'Key file', 'key.json')
    .option('-i,--in <in>', 'File to dec', "encrypted_image.bmp")
    .option('-o,--out <out>', 'Output file', "decrypted_image.bmp")
    .parse(process.argv);

// 读取加密的 BMP 文件
// let enfile='hmac_encrypted_image.bmp'
// let enfile = 'hmac_attacked_image.bmp'
let enfile=program.opts().in

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
function readkey(kfile) {
    // 读取文件


    // 同步读取文件内容
    const data = fs.readFileSync(kfile, 'utf8');

    // 解析JSON数据
    const jsonData = JSON.parse(data);



    // console.log(jsonData);

    const key = Buffer.from(jsonData.key, 'hex'); // 将密钥替换为加密时使用的密钥
    const iv = Buffer.from(jsonData.iv, 'hex'); // 将初始化向量替换为加密时使用的初始化向量
   return { key, iv }
}
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
        return {
            success:0,
            headData: null,
            pixelData: null
        };
    }
    const { key, iv } = readkey(program.opts().key)

    // 使用 AES CBC 解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decryptedData = decipher.update(encryptedDataHex, 'hex', 'hex');
    decryptedData += decipher.final('hex');

    return {
        success:1,
        headData: data.slice(0, 54),
        pixelData: Buffer.from(decryptedData, 'hex')
    };
}

// 将解密后的数据写入新的 BMP 文件
function writeDecryptedDataToFile(decryptedData) {
    if (decryptedData.success==0) {
        console.log('HMAC不匹配');
        console.log('解密失败');
        return
        
    }
    // 读取原始 BMP 文件头和信息头
    const bmpHeader = decryptedData.headData.slice(0, 14);
    const bmpInfoHeader = decryptedData.headData.slice(14, 54);

    // 创建新的 BMP 文件
    const decryptedImageData = decryptedData.pixelData;
    const decryptedFileData = Buffer.concat([bmpHeader, bmpInfoHeader, decryptedImageData]);

    fs.writeFile(program.opts().out, decryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Decrypted image file saved as '+program.opts().out);
    });
}
