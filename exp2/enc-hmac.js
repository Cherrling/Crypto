const fs = require('fs');
const crypto = require('crypto');
const { program } = require('commander');

program
    .option('-k,--key <key>', 'Key file', 'key.json')
    .option('-i,--in <in>', 'File to enc', "plain.bmp")
    .option('-o,--out <out>', 'Output file', "dec.bmp")
    .parse(process.argv);

// 读取 BMP 文件
fs.readFile(program.opts().in, (err, data) => {
    // fs.readFile('input_image.bmp', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 解析 BMP 文件
    const bmpData = parseBMP(data);

    // 提取像素数据并转换为十六进制字符串
    const pixelDataHex = extractPixelDataHex(bmpData, 32); // 选择每像素 32 位的数据
// console.log(bmpData.imageData.toString('hex'));
// console.log(pixelDataHex.toString());
    // 使用 AES CBC 加密
    const encryptedData = encryptAES(pixelDataHex);

    // console.log(encryptedData.encryptedData.toString('hex'));
    // 将加密后的数据写入新的 BMP 文件
    writeEncryptedDataToFile(bmpData,encryptedData);
});

// 解析 BMP 文件
function parseBMP(data) {
    const fileSize = data.readUInt32LE(2); // 读取文件头的大小
    const imageDataOffset = data.readUInt32LE(10); // 图像数据偏移量

    // 提取图像宽度和高度
    const width = data.readUInt32LE(18);
    const height = data.readUInt32LE(22);
    console.log(width+' '+height);
    return {
        fileSize,
        imageDataOffset,
        width,
        height,
        headerData: data.slice(0,54),
        imageData: data.slice(imageDataOffset)
    };
}

// 提取像素数据并转换为十六进制字符串
function extractPixelDataHex(bmpData, bitsPerPixel) {
    const bytesPerPixel = bitsPerPixel / 8;
    const imageData = bmpData.imageData;
    const pixelDataHex = [];

    for (let i = 0; i < bmpData.height; i++) {
        for (let j = 0; j < bmpData.width; j++) {
            const offset = i * bmpData.width * bytesPerPixel + j * bytesPerPixel;
            const pixel = imageData.slice(offset, offset + bytesPerPixel);
            const pixelHex = pixel.toString('hex');
            pixelDataHex.push(pixelHex);
        }
    }
    console.log(pixelDataHex.length);
    return pixelDataHex;
}
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
// 使用 AES CBC 加密
function encryptAES(data) {
 const { key, iv } = readkey(program.opts().key)

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encryptedData = cipher.update(data.join(''), 'hex', 'hex');
    encryptedData += cipher.final('hex');

    const secretKey="12312312387867867867868678653453"

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(encryptedData.toString('hex'));
    const hmacResult = hmac.digest();
    return {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        hmacResult,
        encryptedData
    };
}

// 将加密后的数据写入新的 BMP 文件
function writeEncryptedDataToFile(bmpData,encryptedData) {
    const { key, iv,hmacResult, encryptedData: data } = encryptedData;

    const bmpHeader = bmpData.headerData.slice(0, 14);
    const bmpInfoHeader = bmpData.headerData.slice(14, 54);

    bmpHeader.writeUInt32LE(bmpData.fileSize + 32, 2); // 文件大小
    // const imageDataOffset = data.readUInt32LE(10); // 图像数据偏移量
    bmpHeader.writeUInt32LE(54+32,10)
    const hmac=Buffer.from(hmacResult)
    console.log(hmacResult.toString('hex'));

    // 创建新的 BMP 文件
    const encryptedImageData = Buffer.from(data, 'hex');
    const encryptedFileData = Buffer.concat([bmpHeader, bmpInfoHeader,hmac, encryptedImageData]);

    fs.writeFile(program.opts().out, encryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Encrypted image file saved as '+program.opts().out);
        console.log('Encryption Key:', key);
        console.log('Initialization Vector:', iv);
    });
}
