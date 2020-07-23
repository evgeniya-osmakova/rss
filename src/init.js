import * as yup from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index';
import parseRSS from './RSSparser';
import view from './View';

const init = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    const state = {
      form: {
        innerState: 'checking',
        error: null,
      },
      data: {
        urls: [],
        feeds: {},
        newFeed: {},
        updatedFeed: {},
      },
    };
    const form = document.querySelector('.rss-form');
    const feedback = document.querySelector('.feedback');
    const submitButton = document.querySelector('.btn');
    const feeds = document.querySelector('.feeds');
    const input = document.querySelector('.form-control');

    const watchedState = view(state, document, form, feedback, submitButton, feeds, input);

    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const getProxyURL = (url) => `${proxy}${url}`;

    const schema = yup.object().shape({ website: yup.string().url() });
    const checkFormValidity = (url) => schema.isValid({ website: url });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.form.innerState = 'checking';
      watchedState.form.error = null;
      const formData = new FormData(e.target);
      const url = formData.get('url');
      checkFormValidity(url)
        .then((valid) => {
          if (!valid) {
            watchedState.form.error = i18next.t('messages.invalidURL');
            watchedState.form.innerState = 'failed';
          } else if (watchedState.data.urls.includes(url)) {
            watchedState.form.error = i18next.t('messages.duplicateURL');
            watchedState.form.innerState = 'failed';
          } else {
            watchedState.form.innerState = 'sending';
            axios.get(getProxyURL(url), { timeout: 50000 })
              .then((response) => {
                const parsedData = parseRSS(response.data, url);
                const { title, id, posts } = parsedData;
                watchedState.data.feeds[title] = { id, posts };
                watchedState.data.newFeed = { title, id, posts };
                watchedState.data.urls.push(url);
                watchedState.form.innerState = 'finished';
              })
              .catch((error) => {
                watchedState.form.error = `Error: ${error.message}`;
                watchedState.form.innerState = 'failed';
              });
          }
        });
    });

    const inner = () => {
      const updateRSS = () => {
        watchedState.form.innerState = 'checking';
        const { urls } = state.data;
        urls.forEach((feedURL) => {
          axios.get(getProxyURL(feedURL), { timeout: 5000 })
            .then((response) => {
              const parsedData = parseRSS(response.data, feedURL);
              const { posts: updatedPosts, title } = parsedData;
              const { posts: oldPosts, id } = watchedState.data.feeds[title];
              const newPosts = _.differenceWith(updatedPosts, oldPosts, _.isEqual);
              if (newPosts.length > 0) {
                watchedState.data.updatedFeed = { id, posts: newPosts };
                newPosts.forEach((newPost) => oldPosts.unshift(newPost));
                watchedState.form.innerState = 'updated';
              }
            })
            .catch((error) => {
              watchedState.form.error = `Error: ${error.message}`;
              watchedState.form.innerState = 'failed';
            });
        });
      };

      if (state.data.urls.length > 0) {
        updateRSS();
      }

      setTimeout(inner, 5000);
    };

    inner();
  });
};

export default init;
