import i18next from 'i18next';
import * as _ from 'lodash';

const parseRSS = (data, url) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/xml');
  if (!document.querySelector('channel')) {
    throw new Error(i18next.t('messages.noRSSLink'));
  }
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error(document.querySelector('div').textContent);
  }
  const title = document.querySelector('title').textContent;
  const posts = document.getElementsByTagName('item');
  const postsData = [...posts].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postURL = post.querySelector('link').textContent;
    return {
      title: postTitle,
      description: postDescription,
      url: postURL,
    };
  });
  return {
    title,
    id: _.uniqueId(),
    posts: postsData,
    url,
  };
};

export default parseRSS;
