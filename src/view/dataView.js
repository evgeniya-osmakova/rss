import onChange from 'on-change';

const renderData = (path, value, document, feedsElem) => {
  const createPostElem = ({
    postId,
    postTitle,
    postURL,
    feedId,
  }) => {
    const postName = document.createTextNode(postTitle);
    const aEl = document.createElement('a');
    aEl.append(postName);
    aEl.href = postURL;
    const divEl = document.createElement('div');
    divEl.id = postId;
    divEl.append(aEl);
    const feed = document.getElementById(feedId);
    feed.after(divEl);
  };

  const buildFeeds = ({ feedId, feedTitle }) => {
    const feedName = document.createTextNode(feedTitle);
    const h2El = document.createElement('h2');
    h2El.id = feedId;
    h2El.append(feedName);
    feedsElem.prepend(h2El);
  };

  const mapping = {
    feeds: (feed) => buildFeeds(feed),
    posts: (post) => createPostElem(post),
  };

  mapping[path](value[0]);
};

const watchData = (state, document, feeds) => onChange(state, (path,
  value) => renderData(path, value, document, feeds));

export default watchData;
