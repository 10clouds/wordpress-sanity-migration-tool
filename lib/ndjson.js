const ndjson = require('ndjson');
const fs = require('fs');

const serialize = ndjson.serialize();

const chunk = (array, chunkSize) => {
  var chunkedArray = [];
  for (var i = 0, len = array.length; i < len; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
};

module.exports.saveDataAsNdJson = (dataArray, chunkSize = 50) => {
  const chunkedData = chunk(dataArray, chunkSize);

  chunkedData.forEach((data, index) => {
    const fileName = `wordpress-data-${index}.ndjson`;

    // clean file if it's not the first run
    fs.writeFileSync(fileName, '');
    const stream = fs.createWriteStream(fileName, { flags: 'a' });
    const serialize = ndjson.serialize();

    serialize.on('data', function (line) {
      stream.write(line);
    });
    data.forEach((element) => {
      serialize.write(element);
    });
    serialize.end();
  });
};
