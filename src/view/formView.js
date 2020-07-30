import i18next from 'i18next';
import onChange from 'on-change';

const renderForm = (form, feedback, submitButton, input, state) => {
  const { isValid } = state;
  if (!isValid) {
    input.removeAttribute('readonly');
    submitButton.removeAttribute('disabled');
    const { error } = state;
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    // eslint-disable-next-line no-param-reassign
    feedback.textContent = error;
    form.elements.url.classList.add('is-invalid');
  } else {
    const { state: innerState } = state;
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
        break;
      default:
        submitButton.removeAttribute('disabled');
        input.removeAttribute('readonly');
    }
  }
};

const watchForm = (state, form, feedback, submitButton, input) => {
  const watchedState = onChange(state, () => renderForm(form, feedback,
    submitButton, input, watchedState));
  return watchedState;
};

export default watchForm;
