const axios = require('axios');
const he = require('he');

const { htmlToBlocks, missingImagesBlocklist } = require('./parseBody');
const { logMediaErrors } = require('./errors');

const ITEMS_PER_PAGE = 100;
let wpApiUrl;

const getAllWordpressPages = async (resourceEndpoint) => {
  const count = await axios.get(resourceEndpoint).then((response) => {
    return response.headers['x-wp-totalpages'];
  });

  const promiseArray = [];

  for (let i = 0; i < count; i++) {
    const endpoint = `${resourceEndpoint}&page=${i + 1}`;
    promiseArray.push(axios.get(endpoint));
  }
  const responseArrays = await Promise.all(promiseArray);
  // flatten the array of arrays
  return [].concat.apply(
    [],
    responseArrays.map(({ data }) => data),
  );
};

const getWpMedia = async () => {
  const mediaEndpoint = `${wpApiUrl}/media?per_page=${ITEMS_PER_PAGE}`;

  return getAllWordpressPages(mediaEndpoint).then((data) => data.map(({ id, guid }) => ({ id, url: guid.rendered })));
};

const getUsers = async () => {
  const usersEndpoint = `${wpApiUrl}/users?per_page=${ITEMS_PER_PAGE}`;
  const users = await getAllWordpressPages(usersEndpoint);

  return users.map(({ id, name, slug, description, avatar_urls }) => {
    return {
      _id: `author-${id}`,
      _type: 'author',
      name,
      slug: { current: slug },
      description,
      image: avatar_urls
        ? {
            _type: 'mainImage',
            _sanityAsset: 'image@' + avatar_urls['96'],
          }
        : undefined,
    };
  });
};

const getCategories = async () => {
  const categoriesEndpoint = `${wpApiUrl}/categories?per_page=${ITEMS_PER_PAGE}`;
  const categories = await getAllWordpressPages(categoriesEndpoint);

  return categories.map(({ id, name }) => {
    return {
      _id: `category-${id}`,
      _type: 'category',
      title: name,
    };
  });
};

const getPosts = async (wpMedia) => {
  const postsEndpoint = `${wpApiUrl}/posts?per_page=${ITEMS_PER_PAGE}`;
  const posts = await getAllWordpressPages(postsEndpoint);

  return posts.map(({ id, title, slug, categories, author, featured_media, date, content, excerpt }) => {
    const featuredMedia = wpMedia.find(({ id }) => id == featured_media);
    const isFeaturedMediaValid = featuredMedia && !missingImagesBlocklist.includes(featuredMedia.url);
    const { blocks: parsedBody, errors } = htmlToBlocks(content.rendered);
    const { blocks: parsedExcerpt } = htmlToBlocks(excerpt.rendered);

    logMediaErrors({ errors, id, title, featuredMedia });

    return {
      _id: `post-${id}`,
      _type: 'post',
      title: he.decode(title.rendered),
      slug: {
        current: slug,
      },
      publishedAt: date,
      categories: categories.map((id) => {
        return {
          _type: 'reference',
          _ref: `category-${id}`,
        };
      }),
      authors: [
        {
          _type: 'authorReference',
          author: {
            _type: 'reference',
            _ref: `author-${author}`,
          },
        },
      ],
      mainImage: isFeaturedMediaValid
        ? {
            type: 'mainImage',
            _sanityAsset: `image@${featuredMedia.url}`,
          }
        : undefined,
      excerpt: parsedExcerpt,
      body: parsedBody,
    };
  });
};

module.exports.getWordpressData = async (baseUrl) => {
  wpApiUrl = `${baseUrl}/wp-json/wp/v2`;
  const wpMedia = await getWpMedia(wpApiUrl);
  const [users, categories, blogPosts] = await Promise.all([getUsers(), getCategories(), getPosts(wpMedia)]);

  return [...users, ...categories, ...blogPosts];
};
