import * as yup from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index';
import parseRSS from './rssParser';
import watch from './view';

const timeout = 5000;

const proxy = 'https://cors-anywhere.herokuapp.com/';
const getProxyURL = (url) => `${proxy}${url}`;

const updateFeeds = (state) => {
  const { feeds: allFeeds } = state.data;
  const arrOfPromises = allFeeds.map(({ feedUrl, feedId }) => axios.get(getProxyURL(feedUrl),
    { timeout })
    .then((response) => {
      const parsedData = parseRSS(response.data);
      const { posts: updatedPosts } = parsedData;
      const oldPostsTitlesAndURLs = state.data.posts.reduce((acc,
        { title, link, feedId: id }) => ((id === feedId)
        ? [...acc, { title, link }] : acc), []);
      const newPosts = _.differenceWith(updatedPosts, oldPostsTitlesAndURLs, _.isEqual);
      newPosts.forEach(({ title, link }) => {
        state.data.posts.unshift({
          postId: _.uniqueId(),
          feedId,
          title,
          link,
        });
      });
    }));
  Promise.all(arrOfPromises).finally(() => setTimeout(() => updateFeeds(state), timeout));
};

const loadFeeds = (feedUrl, state) => {
  axios.get(getProxyURL(feedUrl), { timeout })
    .then((response) => {
      const parsedData = parseRSS(response.data);
      const { title, posts } = parsedData;
      const feedId = _.uniqueId();
      state.data.feeds.unshift({ feedId, title, feedUrl });
      posts.forEach(({ title: postTitle, link }) => state.data.posts.unshift({
        postId: _.uniqueId(),
        feedId,
        title: postTitle,
        link,
      }));
      // eslint-disable-next-line no-param-reassign
      state.stateOfLoading.state = 'loaded';
      setTimeout(() => updateFeeds(state), timeout);
    })
    .catch((error) => {
      // eslint-disable-next-line no-param-reassign
      state.stateOfLoading.state = 'unloaded';
      // eslint-disable-next-line no-param-reassign
      state.isValid = false;
      // eslint-disable-next-line no-param-reassign
      state.stateOfLoading.error = `Error: ${error.message}`;
    });
};

const init = () => {
  const state = {
    data: { feeds: [], posts: [] },
    stateOfForm: { error: null },
    stateOfLoading: { state: '', error: null },
    isValid: '',
  };

  const form = document.querySelector('.rss-form');
  const feedback = document.querySelector('.feedback');
  const submitButton = document.querySelector('.btn');
  const feeds = document.querySelector('.feeds');
  const input = document.querySelector('.form-control');

  const schema = yup.string()
    .when('$urlsList', (urlsList) => yup.string()
      .url(i18next.t('messages.invalidURL'))
      .notOneOf(urlsList, i18next.t('messages.duplicatedURL')));

  const checkFormValidity = (url, urls) => {
    try {
      schema.validateSync(url, { context: { urlsList: urls } });
      return false;
    } catch (error) {
      return error.message;
    }
  };

  const watchedState = watch(state, form, feedback, submitButton, input, document, feeds);

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.stateOfLoading.state = 'sending';
      watchedState.stateOfForm.error = null;
      watchedState.stateOfLoading.error = null;
      watchedState.isValid = true;
      const formData = new FormData(e.target);
      const feedUrl = formData.get('url');
      const urlsList = watchedState.data.feeds.map(({ feedUrl: url }) => url);
      const validityError = checkFormValidity(feedUrl, urlsList);
      if (validityError) {
        watchedState.stateOfLoading.state = 'unloaded';
        watchedState.isValid = false;
        watchedState.stateOfForm.error = `Error: ${validityError}`;
      } else {
        loadFeeds(feedUrl, watchedState);
      }
    });
  });
};

export default init;
