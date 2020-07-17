import * as yup from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import resources from './locales/index';
import render from './View';
import rssParser from './RSSparser';

const init = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    const state = {
      form: {
        processState: 'filling',
        error: null,
      },
      data: {
        urls: [],
        feeds: [],
      },
    };
    const form = document.querySelector('.rss-form');
    const feedback = document.querySelector('.feedback');
    const submitButton = document.querySelector('.btn');
    const feeds = document.querySelector('.feeds');

    const watchedState = onChange(state, () => render(document, form, feedback, submitButton,
      feeds, watchedState));

    form.addEventListener('change', (e) => {
      watchedState.form.error = null;
      watchedState.form.processState = 'filling';
      const { value } = e.target;
      const schema = yup.object().shape({ website: yup.string().url() });
      schema
        .isValid({ website: value })
        .then((valid) => {
          if (!valid) {
            watchedState.form.error = i18next.t('messages.invalidURL');
            watchedState.form.processState = 'failed';
          }
        });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      if (watchedState.data.urls.includes(url)) {
        watchedState.form.error = i18next.t('messages.duplicateURL');
        watchedState.form.processState = 'failed';
      } else {
        watchedState.form.processState = 'sending';
        const proxy = 'https://cors-anywhere.herokuapp.com/';
        axios.get(`${proxy}${url}`, { timeout: 5000 })
          .then((response) => {
            const parsedData = rssParser(response.data, url);
            watchedState.data.feeds.unshift(parsedData);
            watchedState.data.feeds[0].id = _.uniqueId();
            watchedState.data.urls.push(url);
            watchedState.form.processState = 'finished';
          })
          .catch((error) => {
            watchedState.form.processState = 'unexpected';
            watchedState.form.error = `Error: ${error.message}`;
          });
      }
    });
    const inner = () => {
      const updateRSS = () => {
        const { feeds: listOfFeeds } = state.data;
        listOfFeeds.forEach((feed) => {
          const { url } = feed;
          const proxy = 'https://cors-anywhere.herokuapp.com/';
          axios.get(`${proxy}${url}`, { timeout: 5000 })
            .then((response) => {
              const parsedData = rssParser(response.data, url);
              const updatedFeedIndex = _.findIndex(listOfFeeds, (obj) => obj.url === url);
              watchedState.form.processState = 'updated';
              watchedState.data.feeds[updatedFeedIndex].posts = parsedData.posts;
            })
            .catch((error) => {
              watchedState.form.error = `Error: ${error.message}`;
              watchedState.form.processState = 'unexpected';
            });
        });
      };

      updateRSS();
      setTimeout(inner, 5000);
    };

    inner();
  });
};

export default init;
