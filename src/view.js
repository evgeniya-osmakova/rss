import i18next from 'i18next';
import onChange from 'on-change';

const buildFeeds = (feeds, feedsList, posts) => {
  // eslint-disable-next-line no-param-reassign
  feeds.innerHTML = feedsList.map((feed) => {
    const { feedId, title } = feed;
    const feedPosts = posts.filter(({ feedId: id }) => (id === feedId));
    const feedPostsList = feedPosts.map((post) => {
      const {
        postId,
        title: postTitle,
        link,
      } = post;
      return `<div id='${postId}'><a href=${link}">${postTitle}</a></div>`;
    }).join('\n');
    return `<h2 id='${feedId}'>${title}</h2>${feedPostsList}`;
  }).join('\n');
};

const render = (document, docElements, watchedState) => {
  const {
    form,
    submitBtn,
    input,
    feedback,
    feeds,
  } = docElements;
  const { validError, isValid } = watchedState.stateOfForm;
  if (!isValid) {
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    form.elements.url.classList.add('is-invalid');
    feedback.textContent = validError;
  } else {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    form.elements.url.classList.remove('is-invalid');
    const { state, loadingError } = watchedState.stateOfLoading;
    switch (state) {
      case ('loading'): {
        submitBtn.setAttribute('disabled', true);
        input.setAttribute('readonly', true);
        feedback.textContent = i18next.t('messages.loading');
        break;
      }
      case ('loaded'): {
        input.removeAttribute('readonly');
        submitBtn.removeAttribute('disabled');
        feedback.textContent = i18next.t('messages.loaded');
        form.reset();
        const { feeds: feedsList, posts } = watchedState.data;
        buildFeeds(feeds, feedsList, posts);
        break;
      }
      case ('unloaded'): {
        submitBtn.removeAttribute('disabled');
        input.removeAttribute('readonly');
        feedback.textContent = loadingError;
        feedback.classList.add('text-danger');
        feedback.classList.remove('text-success');
        form.elements.url.classList.add('is-invalid');
        break;
      }
      default:
        throw new Error(`Unknown loading state: '${state}'!`);
    }
  }
};

const watch = (state, document, docElements) => {
  const watchedState = onChange(state,
    () => render(document, docElements, watchedState), { pathAsArray: true, ignoreKeys: ['data'] });
  return watchedState;
};

export default watch;
