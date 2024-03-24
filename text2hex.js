const fs = require('fs');

// 定义要转换为 ASCII 码的字符串数组
const inputStrings = [
    "The secret message is: when using a stream cipher, never use the key more than once ",
];

// 将字符串转换为 ASCII 码
function stringToAscii(str) {
    let ascii = '';
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        ascii += charCode.toString(16).toUpperCase().padStart(2, '0');
    }
    return ascii;
}

// 将每个输入字符串转换为 ASCII 码
const asciiArray = inputStrings.map(stringToAscii);

// 写入到文件
fs.writeFile('hex.txt', asciiArray.join(' '), (err) => {
    if (err) {
        console.error('写入文件时出错：', err);
        return;
    }
    console.log('ASCII 码已写入到 hex.txt 文件。');
});
