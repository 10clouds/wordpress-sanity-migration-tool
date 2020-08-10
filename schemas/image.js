const imageHotspot = {
  name: 'sanity.imageHotspot',
  type: 'object',
  fields: [
    {
      name: 'x',
      type: 'number',
    },
    {
      name: 'y',
      type: 'number',
    },
    {
      name: 'height',
      type: 'number',
    },
    {
      name: 'width',
      type: 'number',
    },
  ],
};

const imageCrop = {
  name: 'sanity.imageCrop',
  type: 'object',
  fields: [
    {
      name: 'top',
      type: 'number',
    },
    {
      name: 'left',
      type: 'number',
    },
    {
      name: 'right',
      type: 'number',
    },
    {
      name: 'bottom',
      type: 'number',
    },
  ],
};

const enhancedImage = {
  title: 'Image',
  name: 'enhancedImage',
  type: 'image',
  preview: {
    select: {
      title: 'caption',
      subtitle: 'alt',
      media: 'asset',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: `[caption] ${title}`,
        subtitle: `[alt] ${subtitle}`,
        media: media,
      };
    },
  },
  fields: [
    {
      title: 'Alternative Text',
      name: 'alt',
      type: 'string',
      options: {
        isHighlighted: true,
      },
    },
    {
      name: 'caption',
      type: 'string',
      title: 'Caption',
      options: {
        isHighlighted: true,
      },
    },
  ],
};

module.exports = {
  imageCrop,
  imageHotspot,
  enhancedImage,
};
