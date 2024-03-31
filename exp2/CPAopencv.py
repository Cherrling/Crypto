import cv2
import numpy as np
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from Crypto.Cipher import AES
import os
import secrets

def generate_aes_key(key_length):
    return secrets.token_bytes(key_length)

# 生成一个16字节（即128位）的随机AES密钥
aes_key = generate_aes_key(16)
print("随机生成的AES密钥:", aes_key)

def pad(data):
    # 使用PKCS7填充方案填充数据以匹配加密算法的块大小
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(data)
    padded_data += padder.finalize()
    return padded_data

def unpad(padded_data):
    # 使用PKCS7填充方案去除填充
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data)
    data += unpadder.finalize()
    return data



def encrypt_image(image_path, key):
    # 读取图像
    image = cv2.imread(image_path)
    # 输出图像大小
    rowOrig, columnOrig, depthOrig = image.shape
    print(image.shape)

    # 将图像转换为字节
    image_data = image.tobytes()
    print("imageOrigBytes:"+str(len(image_data)))
    # 填充图像数据以匹配加密算法的块大小
    padded_image_data = pad(image_data)
    #生成随机的初始向量
    iv = secrets.token_bytes(16)

    # 使用AES算法和CBC模式创建加密器
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    # 加密填充后的图像数据
    encrypted_image_data = encryptor.update(padded_image_data) + encryptor.finalize()
    void = columnOrig * depthOrig - 16 - len(padded_image_data)+len(image_data)
    ivCiphertextVoid=iv + encrypted_image_data + bytes(void)
    # 从字节流中恢复图像
    encrypted_image = np.frombuffer(ivCiphertextVoid, dtype=image.dtype).reshape(rowOrig + 1, columnOrig, depthOrig)
    cv2.imwrite("encrypted_image.bmp", encrypted_image)
    encrypted_image_path = "encrypted_image.bmp"
    return encrypted_image_path

def decrypt_image(encrypted_image_path, key):
    encrypted_image_data = cv2.imread("encrypted_image.bmp")
    with open(encrypted_image_path, 'rb') as f:
        #读取初始向量和加密后的图像数据
        iv = f.read(16)
    rowEncrypted, columnOrig, depthOrig = encrypted_image_data.shape
    rowOrig = rowEncrypted - 1
    # np矩阵转字节
    encryptedBytes = encrypted_image_data.tobytes()
    imageOrigBytesSize = rowOrig * columnOrig * depthOrig
    # 确定填充的字节数
    paddedSize = (imageOrigBytesSize // AES.block_size + 1) * AES.block_size - imageOrigBytesSize
    # 确定图像的密文
    encrypted = encryptedBytes[16: 16 + imageOrigBytesSize + paddedSize]
    # 解密
    cipher = AES.new(key, AES.MODE_CBC, iv) if AES.MODE_CBC == AES.MODE_CBC else AES.new(key, AES.MODE_ECB)
    decryptedImageBytesPadded = cipher.decrypt(encrypted)
    # 去除填充的数据
    decrypted_image_data = unpad(decryptedImageBytesPadded)
    # 把字节转化成图像
    decrypted_image = np.frombuffer(decrypted_image_data, encrypted_image_data.dtype).reshape(rowOrig, columnOrig, depthOrig)
    cv2.imwrite("decrypted_image.bmp", decrypted_image)
    decrypted_image_path = "decrypted_image.bmp"
    return decrypted_image_path

image_path = 'input_image.bmp'

# 加密图像
encrypted_image_path = encrypt_image(image_path, aes_key)
print(f"图像已加密并保存至: {encrypted_image_path}")

# 解密加密后的图像
decrypted_image_path = decrypt_image(encrypted_image_path, aes_key)
print(f"图像已解密并保存至: {decrypted_image_path}")

# 打开解密后的图像以进行验证
decrypted_image = cv2.imread(decrypted_image_path)
cv2.imshow('Decrypted Image', decrypted_image)
cv2.waitKey()
