const fs = require('fs');
const { program } = require('commander');
program
    .option('-i,--in <in>', 'File to dec', "hmac_encrypted_image.bmp")
    .option('-o,--out <out>', 'Output file', "hmac_attacked_image.bmp")
    .parse(process.argv);


// 读取加密的 BMP 文件
fs.readFile(program.opts().in, (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // 解密 BMP 文件
    const attackedData = attackBMP(data,5000);

    // 将解密后的数据写入新的 BMP 文件
    writeattackedDataToFile(attackedData);
});

// 解密 BMP 文件
function attackBMP(data,num) {
    // 从文件中提取加密数据
    const oriImageData = data.slice(54+32); // 从偏移量 54 处开始，跳过文件头和信息头
    const oriDataHex = oriImageData.toString('hex');

    // 将十六进制字符串转换为 Buffer
    const buffer = Buffer.from(oriDataHex, 'hex');

    // 随机选择要更改的字节索引
    const bytesToChange = new Set();
    while (bytesToChange.size < num) {
        bytesToChange.add(Math.floor(Math.random() * buffer.length));
    }

    // 随机更改选定的字节
    for (const byteIndex of bytesToChange) {
        buffer[byteIndex] = Math.floor(Math.random() * 256); // 0 到 255 之间的随机数
    }

    // 将修改后的 Buffer 转换回十六进制字符串
    const randomizedHexString = buffer.toString('hex');


    return {
        headData:data.slice(0,54+32),
        pixelData:buffer
    };
}


// 将解密后的数据写入新的 BMP 文件
function writeattackedDataToFile(attackedData) {
    // 读取原始 BMP 文件头和信息头
    const bmpHeader = attackedData.headData.slice(0, 14);
    const bmpInfoHeader = attackedData.headData.slice(14, 54);
    const hmac = attackedData.headData.slice(54, 54+32);

    // 创建新的 BMP 文件
    const attackedImageData = attackedData.pixelData;
    const attackedFileData = Buffer.concat([bmpHeader,bmpInfoHeader, hmac, attackedImageData]);

    fs.writeFile(program.opts().out, attackedFileData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('attacked image file saved as '+program.opts().out);
    });
}
