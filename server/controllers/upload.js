const fs = require('fs');

module.exports = (file) => {
    return new Promise((resolve, reject) => {
        const img = file.data_url;
        // strip off the data: url prefix to get just the base64-encoded bytes
        const data = img.replace(/^data:image\/\w+;base64,/, "");
        const buf = Buffer.from(data, 'base64');
        const date = new Date();
        const fileName = 'images/' + date.getTime() + '.png';
        console.log(fileName)
        fs.writeFile(fileName, buf, (err) => reject(err));
        const fileUrl = 'http://localhost:4000/' + fileName;
        resolve(fileUrl);
    });
};
  