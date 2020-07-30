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
  const feedTitle = document.querySelector('title').textContent;
  const posts = document.getElementsByTagName('item');
  const postsData = [...posts].map((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postURL = post.querySelector('link').textContent.split('?')[0];
    // .split('?')[0] нужно, чтобы посты не дублировались. При загрузке rss, например,
    // c https://news.yandex.ru/Moscow/index.rss в ответ при обновлении начинают приходить повторные посты,
    // отличающиеся окончанием url после знака '?'.
    // Я проверяю посты на дубли по комбинации url+заголовок (проверка только по заголовку
    // мне кажется ненадёжной), поэтому без split получается путаница
    return { postTitle, postURL };
  });
  return { feedTitle, posts: postsData };
};

export default parseRSS;
