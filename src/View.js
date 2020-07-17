import i18next from 'i18next';
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
    const feedName = document.createTextNode(state.data.feeds[0].title);
    const h2El = document.createElement('h2');
    h2El.id = state.data.feeds[0].id;
    h2El.append(feedName);
    const aElements = state.data.feeds[0].posts.map(({ title, url }) => createPostElem(title, url));
    feeds.prepend(h2El);
    h2El.after(...aElements);
  };

  const updateFeeds = () => {
    state.data.feeds.forEach(({ id, posts }) => {
      const feed = document.getElementById(id);
      const lastUpdatedPostEl = feed.nextElementSibling.firstElementChild;
      const lastUpdatedPostURL = lastUpdatedPostEl.href;
      const lastUpdatedPostIndex = _.findIndex(posts, (obj) => obj.url === lastUpdatedPostURL);
      for (let i = 0; i < lastUpdatedPostIndex; i += 1) {
        const { title, url } = posts[i];
        const postEl = createPostElem(title, url);
        feed.after(postEl);
      }
    });
  };

  const changeFormData = (addOrRemoveSuccess, addOrRemoveDanger, message) => {
    feedback.classList[addOrRemoveDanger]('text-danger');
    feedback.classList[addOrRemoveSuccess]('text-success');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = message;
    form.elements.url.classList[addOrRemoveDanger]('is-invalid');
    // eslint-disable-next-line no-unused-expressions
    (addOrRemoveSuccess === 'add')
      ? submitButton.removeAttribute('disabled')
      : submitButton.setAttribute('disabled', true);
  };

  const { processState } = state.form;
  switch (processState) {
    case ('filling'):
      changeFormData('add', 'remove', '');
      break;
    case ('failed'): {
      const errMsg = state.form.error;
      changeFormData('remove', 'add', errMsg);
      break;
    }
    case ('unexpected'): {
      const errMsg = state.form.error;
      changeFormData('remove', 'add', errMsg);
      break;
    }
    case ('sending'):
      changeFormData('add', 'remove', i18next.t('messages.loading'));
      break;
    case ('finished'):
      changeFormData('add', 'remove', i18next.t('messages.loaded'));
      form.reset();
      buildFeeds();
      break;
    case ('updated'):
      updateFeeds();
      break;
    default:
      throw new Error(`Unknown state: ${processState}`);
  }
};

export default render;
