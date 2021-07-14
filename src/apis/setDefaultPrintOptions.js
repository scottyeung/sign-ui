/**
 * Sets the default print options.
 * @method UI.setDefaultPrintOptions
 * @param {object} options - The default print options of the document to print. Must be an object.
 * @example
WebViewer(...) .then(function(instance) {
  instance.UI.setDefaultPrintOptions({ includeComments: true, includeAnnotations: true });
});
 */

import actions from 'actions';

export default store => options => {
  if ( typeof options !== 'object' || options === undefined || Object.keys(options).filter(option => option !== "includeComments" && option !== "includeAnnotations").length !== 0 || Object.values(options).filter(val => val !== true && val !== false).length !== 0 ) {
    throw Error('Invalid options provided');
  } else {
    store.dispatch(actions.setDefaultPrintOptions(options));
  }
};