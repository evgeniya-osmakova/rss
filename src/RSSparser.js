import i18next from 'i18next';

const rssParser = (data, url) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(data, 'text/xml');
  if (!document.querySelector('channel')) {
    throw new Error(i18next.t('messages.noRSSLink'));
  }
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error(document.querySelector('div').textContent);
  }
  const title = document.querySelector('title').innerHTML;
  const posts = document.getElementsByTagName('item');
  const postsData = [...posts].map((post) => {
    const postTitle = post.querySelector('title').innerHTML;
    const postDescription = post.querySelector('description').textContent;
    const postURL = post.querySelector('link').innerHTML;
    return { title: postTitle, description: postDescription, url: postURL };
  });
  return { title, posts: postsData, url };
};

export default rssParser;
