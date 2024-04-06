const fs = require('fs');
const crypto = require('crypto');
const { program } = require('commander');

program
    .option('-k,--key <key>', 'Key file', 'key.json')
    .option('-i,--in <in>', 'File to enc', "plain.bmp")
    .option('-o,--out <out>', 'Output file', "enc.bmp")
    .parse(process.argv);



// 生成 RSA 密钥对
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // RSA 密钥长度
    publicKeyEncoding: {
        type: 'pkcs1', // 公钥编码格式
        format: 'pem'  // 输出格式为 PEM
    },
    privateKeyEncoding: {
        type: 'pkcs1', // 私钥编码格式
        format: 'pem'  // 输出格式为 PEM
    }
});

// 将公钥保存到文件
fs.writeFileSync('public.pem', publicKey);
console.log('Public key saved to public.pem');

// 将私钥保存到文件
fs.writeFileSync('private.pem', privateKey);
console.log('Private key saved to private.pem');



function generateAESKeyAndIV() {
    const aesKey = crypto.randomBytes(16); // 16 bytes for AES-128
    const iv = crypto.randomBytes(16); // 16 bytes for AES-128
    return { aesKey, iv };
}





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
    const pixelDataHex = extractPixelDataHex(bmpData, 32);
    // 使用 AES CBC 加密
    const encryptedData = encryptAES(pixelDataHex);


    writeEncryptedDataToFile(bmpData, encryptedData);
});





// 解析 BMP 文件
function parseBMP(data) {
    const headerSize = data.readUInt32LE(14); // 读取文件头的大小
    const imageDataOffset = data.readUInt32LE(10); // 图像数据偏移量

    // 提取图像宽度和高度
    const width = data.readUInt32LE(18);
    const height = data.readUInt32LE(22);
    console.log(width + ' ' + height);
    return {
        headerSize,
        imageDataOffset,
        width,
        height,
        headerData: data.slice(0, 54),
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

    const data = fs.readFileSync(kfile, 'utf8');

    const jsonData = JSON.parse(data)

    const key = Buffer.from(jsonData.key, 'hex');
    const iv = Buffer.from(jsonData.iv, 'hex');
    return { key, iv }
}



// 使用 AES CBC 加密
function encryptAES(data) {
    const { aesKey: key, iv: iv } = generateAESKeyAndIV()
    console.log(key);
    console.log(iv);
    const encryptedaes = crypto.publicEncrypt(publicKey, Buffer.from(JSON.stringify({ key, iv }), 'utf8'));
    fs.writeFileSync("aeskey.pem", encryptedaes.toString('base64'));

    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

    let encryptedData = cipher.update(data.join(''), 'hex', 'hex');
    encryptedData += cipher.final('hex');

    return {
        key: key.toString('hex'),
        iv: iv.toString('hex'),
        encryptedData
    };
}

// 将加密后的数据写入新的 BMP 文件
function writeEncryptedDataToFile(bmpData, encryptedData) {
    const { key, iv, encryptedData: data } = encryptedData;

    const bmpHeader = bmpData.headerData.slice(0, 14);
    const bmpInfoHeader = bmpData.headerData.slice(14, 54);


    // 创建新的 BMP 文件
    const encryptedImageData = Buffer.from(data, 'hex');
    const encryptedFileData = Buffer.concat([bmpHeader, bmpInfoHeader, encryptedImageData]);

    fs.writeFile(program.opts().out, encryptedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Encrypted image file saved as :' + program.opts().out);
        console.log('Encryption Key:', key);
        console.log('Initialization Vector:', iv);
    });
}
