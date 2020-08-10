const fs = require('fs');

const errorsLogFileName = 'resources.errors.log';
// clean errors log
fs.writeFileSync(errorsLogFileName, '');
const errorsStream = fs.createWriteStream(errorsLogFileName, { flags: 'a' });

module.exports.logMediaErrors = ({ errors, id, title, featuredMedia }) => {
  if (errors.isUsingCdnImages) {
    const errorMessage = `cannot download media from google cdn for blogpost id:${id} title: ${title.rendered} \n`;
    errorsStream.write(errorMessage);
    console.info(errorMessage);
  }
  if (errors.hasBlocklistedImage) {
    const errorMessage = `cannot download non existing image for blogpost id:${id} title: ${title.rendered} \n`;
    errorsStream.write(errorMessage);
    console.info(errorMessage);
  }

  if (!featuredMedia) {
    const errorMessage = `missing featured media for blogpost id:${id} title: ${title.rendered} \n`;
    errorsStream.write(errorMessage);
    console.info(errorMessage);
  }
};
