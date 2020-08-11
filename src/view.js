import i18next from 'i18next';
import onChange from 'on-change';

const createPostElem = ({
  postId,
  title,
  link,
  feedId,
}, document) => {
  const postName = document.createTextNode(title);
  const aEl = document.createElement('a');
  aEl.append(postName);
  aEl.href = link;
  const divEl = document.createElement('div');
  divEl.id = postId;
  divEl.append(aEl);
  const feed = document.getElementById(feedId);
  feed.after(divEl);
};

const buildFeeds = ({ feedId, title }, feeds) => {
  const feedName = document.createTextNode(title);
  const h2El = document.createElement('h2');
  h2El.id = feedId;
  h2El.append(feedName);
  feeds.prepend(h2El);
};

const changeMessageColor = (success, docElements) => {
  const { feedback, form } = docElements;

  const showDanger = () => {
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    form.elements.url.classList.add('is-invalid');
  };

  const showSuccess = () => {
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = null;
    form.elements.url.classList.remove('is-invalid');
  };

  return (success) ? showSuccess() : showDanger();
};

const showMessage = (message, success, docElements) => {
  const { feedback } = docElements;
  changeMessageColor(success, docElements);
  // eslint-disable-next-line no-param-reassign
  feedback.textContent = message;
};

const showLoadingProcess = (state, docElements, loadingError, success) => {
  const { form, submitBtn, input } = docElements;
  switch (state) {
    case ('loading'): {
      submitBtn.setAttribute('disabled', true);
      input.setAttribute('readonly', true);
      const message = i18next.t('messages.loading');
      showMessage(message, success, docElements);
      break;
    }
    case ('loaded'): {
      input.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
      const message = i18next.t('messages.loaded');
      showMessage(message, success, docElements);
      form.reset();
      break;
    }
    default:
      submitBtn.removeAttribute('disabled');
      input.removeAttribute('readonly');
      showMessage(loadingError, success, docElements);
  }
};

const render = (path, value, document, docElements) => {
  const { feeds } = docElements;

  const mapping = {
    stateOfForm: ({ validError, isValid }) => showMessage(validError, isValid, docElements),
    stateOfLoading: ({ state, loadingError, isLoadingCorrect }) => showLoadingProcess(state,
      docElements, loadingError, isLoadingCorrect),
    feeds: (allFeeds) => {
      const [newFeed] = allFeeds;
      buildFeeds(newFeed, feeds);
    },
    posts: (allPosts) => {
      const [newPost] = allPosts;
      createPostElem(newPost, document);
    },
  };

  mapping[path](value);
};

const watch = (state, document, docElements) => onChange(state,
  (path, value) => render(path, value, document, docElements));

export default watch;
