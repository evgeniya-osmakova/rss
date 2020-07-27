import * as yup from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index';
import parseRSS from './rssParser';
import watch from './view';

const timeout = 2000;

const init = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    const state = {
      form: {
        error: null,
        isValid: true,
      },
      data: {
        state: 'filling',
        urls: [],
        feeds: {},
        newFeedTitle: '',
        updatedFeedData: {
          feedTitle: '',
          lastNewPostIndex: '',
        },
      },
    };

    const form = document.querySelector('.rss-form');
    const feedback = document.querySelector('.feedback');
    const submitButton = document.querySelector('.btn');
    const feeds = document.querySelector('.feeds');
    const input = document.querySelector('.form-control');

    const watchedState = watch(state, document, form, feedback, submitButton, feeds, input);

    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const getProxyURL = (url) => `${proxy}${url}`;

    const updateFeeds = () => {
      watchedState.data.state = 'filling';

      const updateRSS = () => {
        const { urls } = state.data;
        watchedState.data.state = 'updating';
        urls.forEach((feedURL) => {
          axios.get(getProxyURL(feedURL), { timeout })
            .then((response) => {
              watchedState.data.state = 'filling';
              const parsedData = parseRSS(response.data);
              const { posts: updatedPosts, title } = parsedData;
              const { posts: oldPosts } = state.data.feeds[title];
              const newPosts = _.differenceWith(updatedPosts, oldPosts, _.isEqual);
              if (newPosts.length > 0) {
                const reversedNewPosts = [...newPosts].reverse();
                watchedState.data.updatedFeedData.feedTitle = title;
                watchedState.data.updatedFeedData.lastNewPostIndex = newPosts.length;
                reversedNewPosts.forEach((newPost) => oldPosts.unshift(newPost));
                watchedState.data.state = 'updated';
                watchedState.data.state = 'filling';
              }
            })
            .catch(() => {
              // watchedState.form.error = `Error: ${error.message}`;
              // watchedState.form.isValid = false;
              setTimeout(updateFeeds, timeout);
            });
        });
      };

      updateRSS();

      setTimeout(updateFeeds, timeout);
    };

    const schema = yup.object().shape({
      website: yup.string()
        .url()
        .test((value) => !state.data.urls.includes(value)),
    });

    const checkFormValidity = (url) => schema.validate({ website: url })
      .catch((err) => {
        if (err.type === 'url') {
          watchedState.form.error = i18next.t('messages.invalidURL');
        } else {
          watchedState.form.error = i18next.t('messages.duplicatedURL');
        }
        watchedState.form.isValid = false;
      })
      .then((validURL) => validURL);

    form.addEventListener('submit', (e) => {
      watchedState.data.state = 'sending';
      e.preventDefault();
      watchedState.form.error = null;
      watchedState.form.isValid = true;
      const formData = new FormData(e.target);
      const url = formData.get('url');
      checkFormValidity(url)
        .then((valid) => {
          if (valid) {
            axios.get(getProxyURL(url), { timeout })
              .then((response) => {
                const parsedData = parseRSS(response.data);
                const { title, id, posts } = parsedData;
                watchedState.data.feeds[title] = { id, posts };
                watchedState.data.newFeedTitle = title;
                watchedState.data.urls.push(url);
                watchedState.data.state = 'loaded';
                watchedState.data.state = 'filling';
                setTimeout(updateFeeds, 5000);
              })
              .catch((error) => {
                watchedState.form.error = `Error: ${error.message}`;
                watchedState.form.isValid = false;
              });
          }
        });
    });
  });
};

export default init;
