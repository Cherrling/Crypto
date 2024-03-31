const fs = require('fs');
const crypto = require('crypto');

// 读取 BMP 文件
fs.readFile('plain2.bmp', (err, data) => {
    // fs.readFile('input_image.bmp', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 解析 BMP 文件
    const bmpData = parseBMP(data);

    // 提取像素数据并转换为十六进制字符串
    const pixelDataHex = extractPixelDataHex(bmpData, 32); // 选择每像素 24 位的数据
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
    const headerSize = data.readUInt32LE(14); // 读取文件头的大小
    const imageDataOffset = data.readUInt32LE(10); // 图像数据偏移量

    // 提取图像宽度和高度
    const width = data.readUInt32LE(18);
    const height = data.readUInt32LE(22);
    console.log(width+' '+height);
    return {
        headerSize,
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

// 使用 AES CBC 加密
function encryptAES(data) {
    const key = Buffer.from('8cf95a93ddb860ff6155fbe502ca1f798cf95a93ddb860ff6155fbe502ca1f79', 'hex'); // 将密钥替换为加密时使用的密钥
    const iv = Buffer.from('98c49563bcd639013600bb4215161249', 'hex'); // 将初始化向量替换为加密时使用的初始化向量

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encryptedData = cipher.update(data.join(''), 'hex', 'hex');
    encryptedData += cipher.final('hex');

    return {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        encryptedData
    };
}

// 将加密后的数据写入新的 BMP 文件
function writeEncryptedDataToFile(bmpData,encryptedData) {
    const { key, iv, encryptedData: data } = encryptedData;

    const bmpHeader = bmpData.headerData.slice(0, 14);
    const bmpInfoHeader = bmpData.headerData.slice(14, 54);


    // 创建新的 BMP 文件
    const encryptedImageData = Buffer.from(data, 'hex');
    const encryptedFileData = Buffer.concat([bmpHeader, bmpInfoHeader, encryptedImageData]);

    fs.writeFile('encrypted_image.bmp', encryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Encrypted image file saved as encrypted_image.bmp');
        console.log('Encryption Key:', key);
        console.log('Initialization Vector:', iv);
    });
}
