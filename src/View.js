import i18next from 'i18next';
import onChange from 'on-change';
import * as _ from 'lodash';

const render = (document, form, feedback, submitButton, feeds, state) => {
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
    const { title, id, posts } = state.data.newFeed;
    const feedName = document.createTextNode(title);
    const h2El = document.createElement('h2');
    h2El.id = id;
    h2El.append(feedName);
    const aElements = posts.map(({ title: postTitle, url }) => createPostElem(postTitle, url));
    feeds.prepend(h2El);
    h2El.after(...aElements);
  };

  const updateFeeds = () => {
    const { id, posts } = state.data.updatedFeed;
    const feed = document.getElementById(id);
    posts.forEach(({ title, url }) => {
      const postEl = createPostElem(title, url);
      feed.after(postEl);
    });
  };

  const { innerState } = state.form;
  switch (innerState) {
    case ('failed'): {
      submitButton.removeAttribute('disabled');
      const { error } = state.form;
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = error;
      form.elements.url.classList.add('is-invalid');
      break;
    }
    case ('sending'):
      submitButton.setAttribute('disabled', true);
      feedback.classList.remove('text-danger');
      form.elements.url.classList.remove('is-invalid');
      feedback.classList.add('text-success');
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = i18next.t('messages.loading');
      break;
    case ('finished'):
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
  }
};

const view = (state, document, form, feedback, submitButton, feeds) => {
  const watchedState = onChange(state, () => render(document, form, feedback, submitButton,
    feeds, watchedState));
  return watchedState;
};

export default view;
