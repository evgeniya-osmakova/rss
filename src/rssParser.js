import i18next from 'i18next';

const parseRSS = (data) => {
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
  const postsData = [...posts].reduceRight((acc, post) => {
    const postTitle = post.querySelector('title').textContent;
    const url = new URL(post.querySelector('link').textContent);
    const link = url.pathname;
    return [...acc, { title: postTitle, link }];
  }, []);
  return { title, posts: postsData };
};

export default parseRSS;
