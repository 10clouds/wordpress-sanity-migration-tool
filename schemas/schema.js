const Schema = require('@sanity/schema').default;
const blogContentSchema = require('./blockContent');

// imageCrop and imageHotspot are required so that enhancedImage that extends image doesn't blow up
const { imageCrop, imageHotspot, enhancedImage } = require('./image');

// we mock a valid schema but really want to be able to find a field with blockContentType
const minimalValidSchemaWithBlockContent = {
  name: 'blogPost',
  type: 'object',
  fields: [blogContentSchema],
};

// find the blockContentType to use it for serialization
const blockContentType = Schema.compile({
  name: 'myBlog',
  types: [imageCrop, imageHotspot, enhancedImage, minimalValidSchemaWithBlockContent],
})
  .get('blogPost')
  .fields.find((field) => field.name === 'blockContent').type;

module.exports = { blockContentType };
