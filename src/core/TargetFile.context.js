import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import {
  useFile,
} from 'gitea-react-toolkit';

import { AppContext } from '../App.context';

const TargetFileContext = React.createContext();

function TargetFileContextProvider({
  children,
}) {
  const {
    state: {
      authentication, targetRepository, sourceFile, filepath, setFilepath, targetFile,
    }={},
    actions: { setTargetFile },
  } = useContext(AppContext);

  const {
    state, actions, component, components, config,
  } = useFile({
    config: (authentication && authentication.config),
    authentication,
    repository: targetRepository,
    filepath,
    onFilepath: setFilepath,
    defaultContent: (sourceFile && sourceFile.content),
    file: targetFile,
    onFile: setTargetFile,
  });

  const context = {
    state,
    actions,
    component,
    components,
    config,
  };

  return (
    <TargetFileContext.Provider value={context}>
      {children}
    </TargetFileContext.Provider>
  );
};

TargetFileContextProvider.propTypes = {
  /** Children to render inside of Provider */
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export {
  TargetFileContextProvider,
  TargetFileContext,
};
