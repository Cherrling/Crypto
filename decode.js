const fs = require('fs');

function xorHexStrings(hex1, hex2) {
    // 确保两个字符串的长度相同
    const maxLength = Math.max(hex1.length, hex2.length);
    hex1 = hex1.padStart(maxLength, '0');
    hex2 = hex2.padStart(maxLength, '0');

    let result = '';
    // 每两个字符为一组进行异或操作
    for (let i = 0; i < maxLength; i += 2) {
        const byte1 = parseInt(hex1.substr(i, 2), 16);
        const byte2 = parseInt(hex2.substr(i, 2), 16);
        const xorResult = (byte1 ^ byte2).toString(16).padStart(2, '0');
        result += xorResult;
    }
    return result;
}

// 将十六进制字符串转换为 ASCII 字符串
function hexToAscii(hexString) {
    let asciiString = '';
    // 每两个字符为一组进行处理
    for (let i = 0; i < hexString.length; i += 2) {
        // 获取当前两个字符并转换为十进制数值
        const hexCharCode = parseInt(hexString.substr(i, 2), 16);
        // 将十进制数值转换为 ASCII 字符并拼接到结果字符串中
        asciiString += String.fromCharCode(hexCharCode);
    }
    return asciiString;
}

// 示例用法
const hexString1 = '32510ba9babebbbefd001547a810e67149caee11d945cd7fc81a05e9f85aac650e9052ba6a8cd8257bf14d13e6f0a803b54fde9e77472dbff89d71b57bddef121336cb85ccb8f3315f4b52e301d16e9f52f904';
const hexString2 = '461900a9e9fbf8ebb854000aed4300300e8fee588a00cd08800000e9ad0900000000000000d88a0000000050afa0e046e70000d0321100edf8c822f07b89a757137d8edcccf5bc631a4b06ab409f6ed01c0000';

const xorResult = xorHexStrings(hexString1, hexString2);

// 将异或结果转换为 ASCII 字符串
const asciiText = hexToAscii(xorResult);

// 将 ASCII 字符串写入文件
fs.writeFile('decode.txt', asciiText, 'utf8', (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
    console.log('XOR result has been saved to decode.txt');
});


