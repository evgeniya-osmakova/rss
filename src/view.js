import i18next from 'i18next';
import onChange from 'on-change';
import * as _ from 'lodash';

const render = (document, form, feedback, submitButton, feeds, state, input) => {
  const createPostElem = (title, url) => {
    const postName = document.createTextNode(title);
    const aEl = document.createElement('a');
    aEl.append(postName);
    aEl.id = _.uniqueId();
    aEl.href = url;
    const divEl = document.createElement('div');
    divEl.append(aEl);
    return divEl;
  };

  const buildFeeds = () => {
    const { newFeedTitle } = state.data;
    const { id, posts } = state.data.feeds[newFeedTitle];
    const feedName = document.createTextNode(newFeedTitle);
    const h2El = document.createElement('h2');
    h2El.id = id;
    h2El.append(feedName);
    const aElements = posts.map(({ title: postTitle, url }) => createPostElem(postTitle, url));
    feeds.prepend(h2El);
    h2El.after(...aElements);
  };

  const updateFeeds = () => {
    const { feedTitle, lastNewPostIndex } = state.data.updatedFeedData;
    const { posts, id } = state.data.feeds[feedTitle];
    const newPosts = posts.slice(0, lastNewPostIndex).reverse();
    const feed = document.getElementById(id);
    newPosts.forEach(({ title, url }) => {
      const postEl = createPostElem(title, url);
      feed.after(postEl);
    });
  };

  const { isValid } = state.form;
  if (!isValid) {
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
    const { error } = state.form;
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = error;
    form.elements.url.classList.add('is-invalid');
  } else {
    const { state: innerState } = state.data;
    switch (innerState) {
      case ('sending'):
        submitButton.setAttribute('disabled', true);
        input.setAttribute('readonly', true);
        feedback.classList.remove('text-danger');
        form.elements.url.classList.remove('is-invalid');
        feedback.classList.add('text-success');
        // eslint-disable-next-line no-param-reassign
        feedback.textContent = i18next.t('messages.loading');
        break;
      case ('loaded'):
        input.removeAttribute('readonly');
        submitButton.removeAttribute('disabled');
        feedback.classList.remove('text-danger');
        feedback.classList.add('text-success');
        form.elements.url.classList.remove('is-invalid');
        // eslint-disable-next-line no-param-reassign
        feedback.textContent = i18next.t('messages.loaded');
        form.reset();
        buildFeeds();
        break;
      case ('updated'):
        updateFeeds();
        break;
      default:
        submitButton.removeAttribute('disabled');
        input.removeAttribute('readonly');
    }
  }
};

const watch = (state, document, form, feedback, submitButton, feeds, input) => {
  const watchedState = onChange(state, () => render(document, form, feedback, submitButton,
    feeds, watchedState, input));
  return watchedState;
};

export default watch;
