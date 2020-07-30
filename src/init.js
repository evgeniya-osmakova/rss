import * as yup from 'yup';
import * as _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index';
import parseRSS from './rssParser';
import watchForm from './view/formView';
import watchData from './view/dataView';

const timeout = 5000;

const proxy = 'https://cors-anywhere.herokuapp.com/';
const getProxyURL = (url) => `${proxy}${url}`;

const updateFeeds = (state) => {
  const { feeds: allFeeds } = state;
  const arrOfPromises = allFeeds.map(({ feedUrl, feedId }) => axios.get(getProxyURL(feedUrl),
    { timeout })
    .then((response) => {
      const parsedData = parseRSS(response.data);
      const { posts: updatedPosts } = parsedData;
      const oldPostsTitlesAndURLs = state.posts.reduce((acc,
        { postTitle, postURL, feedId: id }) => ((id === feedId)
        ? [...acc, { postTitle, postURL }] : acc), []);
      const newPosts = _.differenceWith(updatedPosts, oldPostsTitlesAndURLs, _.isEqual);
      newPosts.reverse();
      newPosts.forEach(({ postTitle, postURL }) => {
        state.posts.unshift({
          postId: _.uniqueId(),
          feedId,
          postTitle,
          postURL,
        });
      });
    }));
  Promise.all(arrOfPromises).finally(() => setTimeout(() => updateFeeds(state), timeout));
};

const init = () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then(() => {
    const stateOfForm = { state: 'filling', error: null, isValid: true };
    const stateOfData = { feeds: [], posts: [] };

    const form = document.querySelector('.rss-form');
    const feedback = document.querySelector('.feedback');
    const submitButton = document.querySelector('.btn');
    const feeds = document.querySelector('.feeds');
    const input = document.querySelector('.form-control');

    const watchedFormState = watchForm(stateOfForm, form, feedback, submitButton, input);
    const watchedDataState = watchData(stateOfData, document, feeds);

    const schema = yup.string()
      .when('$urlsList', (urlsList) => yup.string()
        .url(i18next.t('messages.invalidURL'))
        .notOneOf(urlsList, i18next.t('messages.duplicatedURL')));

    const checkFormValidity = (url, urls) => schema.validate(url, { context: { urlsList: urls } })
      .catch((error) => {
        watchedFormState.error = `Error: ${error.message}`;
        watchedFormState.isValid = false;
      });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedFormState.state = 'sending';
      watchedFormState.error = null;
      watchedFormState.isValid = true;
      const formData = new FormData(e.target);
      const feedUrl = formData.get('url');
      const urlsList = watchedDataState.feeds.map(({ feedUrl: url }) => url);
      checkFormValidity(feedUrl, urlsList)
        .then((valid) => {
          if (valid) {
            axios.get(getProxyURL(feedUrl), { timeout })
              .then((response) => {
                const parsedData = parseRSS(response.data);
                const { feedTitle, posts } = parsedData;
                const feedId = _.uniqueId();
                watchedDataState.feeds.unshift({ feedId, feedTitle, feedUrl });
                posts.reverse();
                posts.forEach(({ postTitle, postURL }) => watchedDataState.posts.unshift({
                  postId: _.uniqueId(),
                  feedId,
                  postTitle,
                  postURL,
                }));
                watchedFormState.state = 'loaded';
                setTimeout(() => updateFeeds(watchedDataState), timeout);
              })
              .catch((error) => {
                watchedFormState.error = `Error: ${error.message}`;
                watchedFormState.isValid = false;
              });
          }
        });
    });
  });
};

export default init;
