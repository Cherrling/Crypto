const fs = require('fs');
const crypto = require('crypto');
const { program } = require('commander');
program
    .option('-k,--key <key>', 'Key file', 'key.json')
    .option('-i,--in <in>', 'File to dec', "plain.bmp")
    .option('-o,--out <out>', 'Output file', "dec.bmp")
    .parse(process.argv);

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

    const key = Buffer.from(jsonData.key, 'hex'); 
 return { key, iv }
}

// 解密 BMP 文件
function decryptBMP(data) {
    // 从文件中提取加密数据
    const encryptedImageData = data.slice(54); // 从偏移量 54 处开始，跳过文件头和信息头
    const encryptedDataHex = encryptedImageData.toString('hex');
 const { key, iv } = readkey(program.opts().key)

    // 使用 AES CBC 解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decryptedData = decipher.update(encryptedDataHex, 'hex', 'hex');
    decryptedData += decipher.final('hex');

    return {
        headData:data.slice(0,54),
        pixelData:Buffer.from(decryptedData, 'hex')
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

    fs.writeFile(program.opts().out, decryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Decrypted image file saved as :'+program.opts().out);
    });
}
