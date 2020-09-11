import i18next from 'i18next';
import onChange from 'on-change';
/* eslint no-param-reassign: 0 */

const buildFeeds = (feeds, feedsList, posts) => {
  feeds.innerHTML = feedsList.map((feed) => {
    const { feedId, title } = feed;
    const feedPosts = posts.filter(({ feedId: id }) => (id === feedId));
    const feedPostsList = feedPosts.map((post) => {
      const {
        postId,
        title: postTitle,
        link,
      } = post;
      return `<div id='${postId}'><a href=${link}>${postTitle}</a></div>`;
    }).join('\n');
    return `<h2 id='${feedId}'>${title}</h2>${feedPostsList}`;
  }).join('\n');
};

const handleLoadingProcess = (state, docElements, loadingError) => {
  const {
    form,
    submitBtn,
    input,
    feedback,
  } = docElements;
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
      break;
    }
    case ('failed'): {
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
};

const handleValidityProcess = (validError, isValid, feedback, form) => {
  if (isValid) {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    form.elements.url.classList.remove('is-invalid');
  } else {
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    form.elements.url.classList.add('is-invalid');
    feedback.textContent = validError;
  }
};

const render = (path, value, docElements) => {
  const { feedback, form, feeds } = docElements;

  const mapping = {
    stateOfForm: ({ validError, isValid }) => handleValidityProcess(validError,
      isValid, feedback, form),
    stateOfLoading: ({ state, loadingError }) => handleLoadingProcess(state,
      docElements, loadingError),
    data: ({ feeds: feedsList, posts }) => buildFeeds(feeds, feedsList, posts),
  };

  mapping[path](value);
};

const watch = (state, docElements) => onChange(state,
  (path, value) => render(path, value, docElements));

export default watch;
