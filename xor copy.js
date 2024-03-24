const fs = require('fs');

// 十六进制文本数组
const hexTexts = [
    "3f561ba9adb4b6ebec54424ba317b564418fac0dd35f8c08d31a1fe9e24fe56808c213f17c81d9607cee021dafe1e001b21ade877a5e68bea88d61b93ac5ee0d562e8e9582f5ef375f0a4ae20ed86e935de81230b59b73fb4302cd95d770c65b40aaa065f2a5e33a5a0bb5dcaba43722130f042f8ec85b7c2070",
    "32510ba9a7b2bba9b8005d43a304b5714cc0bb0c8a34884dd91304b8ad40b62b07df44ba6e9d8a2368e51d04e0e7b207b70b9b8261112bacb6c866a232dfe257527dc29398f5f3251a0d47e503c66e935de81230b59b7afb5f41afa8d661cb",
    '315c4eeaa8b5f8aaf9174145bf43e1784b8fa00dc71d885a804e5ee9fa40b16349c146fb778cdf2d3aff021dfff5b403b510d0d0455468aeb98622b137dae857553ccd8883a7bc37520e06e515d22c954eba5025b8cc57ee59418ce7dc6bc41556bdb36bbca3e8774301fbcaa3b83b220809560987815f65286764703de0f3d524400a19b159610b11ef3e',
   // 添加更多的十六进制文本...
];

function createMatrix(rows, cols, val) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            // 这里可以为每个元素赋予初始值
            matrix[i][j] = val; // 初始值为 0，您可以根据需要修改
        }
    }
    return matrix;
}
var xor = createMatrix(11, 11, 0);


var results = [];


// 异或函数
function xorHex(hex1, hex2) {
    const buf1 = Buffer.from(hex1, 'hex');
    const buf2 = Buffer.from(hex2, 'hex');

    const resultBuf = Buffer.alloc(Math.max(buf1.length, buf2.length));
    for (let i = 0; i < resultBuf.length; i++) {
        resultBuf[i] = buf1[i] ^ buf2[i];
    }

    return resultBuf.toString('hex');
}

// 将异或结果输出到文件
function outputXorResults(results) {
    fs.writeFile('xor_results.txt', results.join('\n'), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('XOR results have been saved to xor_results.txt');
    });
}

function hexToAscii(hexString) {
    let asciiString = '';

    // 每两个字符为一组进行处理
    for (let i = 0; i < hexString.length; i += 2) {
        // 获取当前两个字符并转换为十进制数值
        const hexCharCode = parseInt(hexString.substr(i, 2), 16);
        const asciiChar = String.fromCharCode(hexCharCode);

        // 将十进制数值转换为 ASCII 字符并拼接到结果字符串中
        if (hexCharCode == 0) {
            asciiString += '+';
            continue;
        }
        if ((asciiChar >= 'A' && asciiChar <= 'Z') || (asciiChar >= 'a' && asciiChar <= 'z')) {
            asciiString += asciiChar;
        }
        else {
            asciiString += '-';
        }
    }

    return asciiString;
}

function verifyspace() {
    let res = createMatrix(11, 400, 1);
    // for (let i = 0; i < 11; i++) {
    //     for (let j = 0; j < 11; j++) {
    //         let hexString = xor[i][j]
    //         // console.log(hexString);
    //         for (let k = 0; k < hexString.length; k += 2) {
    //             // 获取当前两个字符并转换为十进制数值
    //             const hexCharCode = parseInt(hexString.substr(k, 2), 16);
    //             // console.log(hexCharCode);
    //             const asciiChar = String.fromCharCode(hexCharCode);
    //             // console.log(asciiChar);
    //             // 将十进制数值转换为 ASCII 字符并拼接到结果字符串中

    //             if (!((hexCharCode == 0) || (asciiChar >= 'A' && asciiChar <= 'Z') || (asciiChar >= 'a' && asciiChar <= 'z'))) {
    //                 res[i][k / 2] = 0;
    //             }
    //         }

    //     }
    // }
    let num = 0;
    for (let i = 0; i < 11; i++) {
        for (let k = 0; k < 166; k += 2) {
            num = 11;
            for (let j = 0; j < 11; j++) {
                let hexString = xor[i][j]
                // console.log(hexString);
                // 获取当前两个字符并转换为十进制数值
                const hexCharCode = parseInt(hexString.substr(k, 2), 16);
                // console.log(hexCharCode);
                const asciiChar = String.fromCharCode(hexCharCode);
                // console.log(asciiChar);
                // 将十进制数值转换为 ASCII 字符并拼接到结果字符串中

                if (!((hexCharCode == 0) || (asciiChar >= 'A' && asciiChar <= 'Z') || (asciiChar >= 'a' && asciiChar <= 'z'))) {
                    num--;
                }
            }
            if (num < 9) {

                res[i][k / 2] = 0;
            }

        }
    }



    return res;
}


// 计算并输出异或结果
function computeXorResults() {
    for (let i = 0; i < hexTexts.length; i++) {
        for (let j = 0; j < hexTexts.length; j++) {
            const xorResult = xorHex(hexTexts[i], hexTexts[j]);
            xor[i][j] = xorResult;
            // results.push(`${hexTexts[i]} \n XOR \n${hexTexts[j]}\n = \n${xorResult}\n ASCII \n ${hexToAscii(xorResult)}`);
            // results.push(`${i}:${j}    ${hexToAscii(xorResult)}`);
        }
        // results.push(``);
    }
    return results;
}

// 主函数
function main() {
    // const xorResults = computeXorResults();
    // outputXorResults(xorResults);


    computeXorResults();
    let res = verifyspace()
    // console.log(res);

    let key = Array(400).fill(-1)

    for (let i = 0; i < 400; i++) {
        let flag = 1
        for (let j = 0; j < 11; j++) {
            if (res[j][i] == 1) {
                let text = hexTexts[j]
                // console.log(text);
                flag = 0;
                if (i * 2 < text.length) {
                    // console.log(i);
                    if (key[i] == -1) {
                        key[i] = text.slice(i * 2, i * 2 + 2)
                    }
                }
            }

        }
        if (flag) {
            if (key[i] == -1) {
                key[i] = 0
            }
        }
    }
    console.log(key);

    let content = ''

    for (let i = 0; i < key.length; i++) {
        const r = key[i];
        if (r == 0) {
            content += "20"
        } else {
            content += key[i]
        }
    }

    results.push(content)
    outputXorResults(results)
}

// 执行主函数
main();
