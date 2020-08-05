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

const showError = (error, feedback) => {
  // eslint-disable-next-line no-param-reassign
  feedback.textContent = error;
};

const showValidity = (valid, input, submitBtn, feedback, form) => {
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

  return (valid) ? showSuccess() : showDanger();
};

const renderFormMessages = (state, form, feedback, submitButton, input) => {
  switch (state) {
    case ('sending'):
      submitButton.setAttribute('disabled', true);
      input.setAttribute('readonly', true);
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = i18next.t('messages.loading');
      break;
    case ('loaded'):
      input.removeAttribute('readonly');
      submitButton.removeAttribute('disabled');
      // eslint-disable-next-line no-param-reassign
      feedback.textContent = i18next.t('messages.loaded');
      form.reset();
      break;
    case ('unloaded'):
      input.removeAttribute('readonly');
      submitButton.removeAttribute('disabled');
      break;
    default:
      submitButton.removeAttribute('disabled');
      input.removeAttribute('readonly');
  }
};

const render = (path, value, form, feedback, submitBtn, input, document, feeds) => {
  const mapping = {
    'data.feeds': (feed) => buildFeeds(feed, feeds),
    'data.posts': (post) => createPostElem(post, document),
    isValid: (valid) => showValidity(valid, input, submitBtn, feedback, form),
    'stateOfLoading.state': (state) => renderFormMessages(state, form, feedback, submitBtn, input),
    'stateOfLoading.error': (error) => showError(error, feedback),
    'stateOfForm.error': (error) => showError(error, feedback),
  };

  const findChangedValue = (valueAsArr) => {
    const [changedValue] = valueAsArr;
    return changedValue;
  };

  const changedValue = (Array.isArray(value)) ? findChangedValue(value) : value;
  mapping[path](changedValue);
};

const watch = (state, form, feedback, submitButton, input, document, feeds) => onChange(state,
  (path, value) => render(path, value, form, feedback, submitButton, input, document, feeds));

export default watch;
