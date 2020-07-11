import Example from './Example';
import 'bootstrap';

export default () => {
  const element = document.getElementById('point');
  const obj = new Example(element);
  obj.init();
};
