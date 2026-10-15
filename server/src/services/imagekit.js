import ImageKit from 'imagekit';

let imagekit = null;

if (
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}

export const uploadToImageKit = async (buffer, fileName, folder = '/cars') => {
  if (!imagekit) {
    // Mock for test environment
    return {
      url: `https://mock.imagekit.io/${folder}/${fileName}`,
      fileId: 'mock-file-id',
    };
  }
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: buffer.toString('base64'),
        fileName,
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

export default imagekit;