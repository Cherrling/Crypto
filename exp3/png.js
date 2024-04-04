const fs = require('fs');
const PNG = require('pngjs').PNG;
const crypto = require('crypto');
const { program } = require('commander');
// 将数字转换为两位的十六进制字符串
function toHex(num) {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}
// 读取PNG图片并解析像素值
function parsePNG(filePath) {
    let enctext = ""
    fs.createReadStream(filePath)
        .pipe(new PNG())
        .on('parsed', function () {
            let hexString = '';

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const idx = (this.width * y + x) << 2;
                    const rgba = {
                        r: this.data[idx],
                        g: this.data[idx + 1],
                        b: this.data[idx + 2],
                        a: this.data[idx + 3]
                    };
                    const hex = toHex(rgba.r) + toHex(rgba.g) + toHex(rgba.b) + toHex(rgba.a);
                    hexString += hex;
                }
            }
            enctext = hexString
            // console.log(enctext);

            const ivhex = enctext.slice(0, 32)

            enctext = enctext.slice(32, -1912 * 8)

            const keyhex = "3c63655e71473b74515d557233505061"
            const key = Buffer.from(keyhex, 'hex');
            const iv = Buffer.from(ivhex, 'hex');
            // 使用 AES CBC 解密
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(enctext, 'hex', 'hex');
            decrypted += decipher.final('hex');
            createnewpng(decrypted)
            // console.log(decrypted);
        });
    // return enctext
}
// 从hex字符串解析颜色值
function parseColor(hex) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = parseInt(hex.slice(6, 8), 16);
    return [r, g, b, a];
}
function createnewpng(hex) {


    // 创建1920x1080的PNG图像
    const width = 1920;
    const height = 1080;
    const img = new PNG({ width, height });

    // 从hex字符串读取像素数据并写入图像
    const hexString = hex; // 替换为实际的hex字符串
    let index = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = parseColor(hexString.slice(index, index + 8));
            index += 8;
            const idx = (width * y + x) << 2;
            img.data[idx] = color[0]; // Red channel
            img.data[idx + 1] = color[1]; // Green channel
            img.data[idx + 2] = color[2]; // Blue channel
            img.data[idx + 3] = color[3]; // Alpha channel
        }
    }

    // 写入PNG图像到文件
    const outputStream = fs.createWriteStream('output.png');
    img.pack().pipe(outputStream);
    outputStream.on('finish', () => console.log('PNG image created.'));

}

// 调用函数并传入PNG图片路径
const pngFilePath = 'enc1.png';
parsePNG(pngFilePath);


// // 使用 AES CBC 解密
// const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);

// let decryptedData = decipher.update(enctext, 'hex', 'hex');
// decryptedData += decipher.final('hex');

// console.log(decryptedData);