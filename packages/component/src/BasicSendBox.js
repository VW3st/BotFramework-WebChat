import { Constants } from 'botframework-webchat-core';
import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ConnectivityStatus from './SendBox/ConnectivityStatus';
import connectToWebChat from './connectToWebChat';
import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import TextBox from './SendBox/TextBox';
import TypingIndicator from './SendBox/TypingIndicator';
import UploadButton from './SendBox/UploadButton';
import useActivities from './hooks/useActivities';

const {
  DictateState: { DICTATING, STARTING }
} = Constants;

const ROOT_CSS = css({
  '& > .main': {
    display: 'flex'
  }
});

const DICTATION_INTERIMS_CSS = css({ flex: 10000 });
const MICROPHONE_BUTTON_CSS = css({ flex: 1 });
const TEXT_BOX_CSS = css({ flex: 10000 });

// TODO: [P3] We should consider exposing core/src/definitions and use it instead
function activityIsSpeakingOrQueuedToSpeak({ channelData: { speak } = {} }) {
  return !!speak;
}

function useSendBoxDictationStarted(dictateState) {
  const [activities] = useActivities();

  return [
    (dictateState === STARTING || dictateState === DICTATING) &&
      !activities.filter(activityIsSpeakingOrQueuedToSpeak).length
  ];
}

const BasicSendBox = ({ className, dictateState, styleSet, webSpeechPonyfill }) => {
  const [dictationStarted] = useSendBoxDictationStarted(dictateState);

  return (
    <div className={classNames(styleSet.sendBox + '', ROOT_CSS + '', className + '')} role="form">
      <TypingIndicator />
      <ConnectivityStatus />
      <SuggestedActions />
      <div className="main">
        {!styleSet.options.hideUploadButton && <UploadButton />}
        {dictationStarted ? (
          <DictationInterims className={DICTATION_INTERIMS_CSS + ''} />
        ) : (
          <TextBox className={TEXT_BOX_CSS + ''} />
        )}
        <div>
          {(webSpeechPonyfill || {}).SpeechRecognition ? (
            <MicrophoneButton className={MICROPHONE_BUTTON_CSS + ''} />
          ) : (
            <SendButton />
          )}
        </div>
      </div>
    </div>
  );
};

BasicSendBox.defaultProps = {
  className: '',
  webSpeechPonyfill: undefined
};

BasicSendBox.propTypes = {
  className: PropTypes.string,
  dictateState: PropTypes.number.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      hideUploadButton: PropTypes.bool.isRequired
    }).isRequired,
    sendBox: PropTypes.any.isRequired
  }).isRequired,
  webSpeechPonyfill: PropTypes.shape({
    SpeechRecognition: PropTypes.any
  })
};

export default connectToWebChat(({ dictateState, styleSet, webSpeechPonyfill }) => ({
  dictateState,
  styleSet,
  webSpeechPonyfill
}))(BasicSendBox);

export { useSendBoxDictationStarted };
