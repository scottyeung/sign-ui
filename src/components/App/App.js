import { hot } from 'react-hot-loader/root';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import { useStore, useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import selectors from 'selectors';
import SignatureModal from 'components/SignatureModal';

import loadDocument from 'helpers/loadDocument';
import getHashParams from 'helpers/getHashParams';
import fireEvent from 'helpers/fireEvent';
import Events from 'constants/events';
import overlays from 'constants/overlays';

import actions from 'actions';

import './App.scss';

// TODO: Use constants
const tabletBreakpoint = window.matchMedia('(min-width: 641px) and (max-width: 900px)');

const propTypes = {
  removeEventHandlers: PropTypes.func.isRequired,
};

const App = ({ removeEventHandlers }) => {
  const store = useStore();
  const dispatch = useDispatch();
  let timeoutReturn;

  const [isInDesktopOnlyMode] = useSelector(state => [
    selectors.isInDesktopOnlyMode(state)
  ]);

  useEffect(() => {
    fireEvent(Events.VIEWER_LOADED);

    // const doc = window.PDFNet.PDFDoc.create();

    function loadInitialDocument() {
      const doesAutoLoad = getHashParams('auto_load', true);
      const initialDoc = getHashParams('d', '');
      const startOffline = getHashParams('startOffline', false);

      if ((initialDoc && doesAutoLoad) || startOffline) {
        const options = {
          extension: getHashParams('extension', null),
          filename: getHashParams('filename', null),
          externalPath: getHashParams('p', ''),
          documentId: getHashParams('did', null),
        };

        loadDocument(dispatch, initialDoc, options);
      }
    }

    function loadDocumentAndCleanup() {
      loadInitialDocument();
      window.removeEventListener('message', messageHandler);
      clearTimeout(timeoutReturn);
    }

    function messageHandler(event) {
      if (event.isTrusted &&
        typeof event.data === 'object' &&
        event.data.type === 'viewerLoaded') {
        loadDocumentAndCleanup();
      }
    }

    window.addEventListener('blur', () => { dispatch(actions.closeElements(overlays)); });
    window.addEventListener('message', messageHandler, false);

    dispatch(actions.openElement('signatureModal'));
    dispatch(actions.closeElement('toolStylePopup'));
    // In case WV is used outside of iframe, postMessage will not
    // receive the message, and this timeout will trigger loadInitialDocument
    timeoutReturn = setTimeout(loadDocumentAndCleanup, 100);

    return removeEventHandlers;
    // eslint-disable-next-line
  }, []);

  return (
    <React.Fragment>
      <div className={classNames({ "App": true, 'is-in-desktop-only-mode': isInDesktopOnlyMode })}>
        <SignatureModal />
      </div>
    </React.Fragment>
  );
};

App.propTypes = propTypes;

export default hot(App);
