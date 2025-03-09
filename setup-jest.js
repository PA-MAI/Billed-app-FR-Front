import $ from 'jquery';
global.$ = global.jQuery = $;
$.fn.modal = jest.fn((action) => {
  console.log(`Bootstrap modal mock appelé avec action: ${action}`);
});
