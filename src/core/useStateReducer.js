import { useCallback, useReducer } from 'react';
import {ensureRepo} from 'gitea-react-toolkit';

import {stateReducer} from './state.reducer';
import {saveState} from './persistence';
import defaults from './state.defaults';

export const useStateReducer = ({
  authentication, language, sourceRepository, filepath,
}) => {
  const _defaults = { ...defaults, authentication, sourceRepository, language, filepath };
  const [state, dispatch] = useReducer(stateReducer, _defaults);

  const setFontScale = useCallback((value) => {
    dispatch({type: 'set_font_scale', value});
  },[]);

  const setConfig = useCallback((value) => {
    dispatch({type: 'set_config', value});
  },[]);

  const setSourceRepository = useCallback((value) => {
    dispatch({type: 'set_source_repository', value});
    saveState('sourceRepository', value);
    if (!value) dispatch({type: 'set_target_repository'});
  },[]);

  const setAuthentication = useCallback((value) => {
    if (JSON.stringify(value) !== JSON.stringify(state.authentication)) {
      dispatch({type: 'set_authentication', value});
      saveState('authentication', value);
      if (!value && !!state.sourceRepository) setSourceRepository(); // reset if logged out
    };
  }, [state.authentication, state.sourceRepository, setSourceRepository]);

  const setLanguage = useCallback((value) => {
    if (value !== state.language) {
      dispatch({type: 'set_language', value});
      saveState('language', value);
      if (!value) setSourceRepository(); // reset if no language
    };
  }, [state.language, setSourceRepository]);

  const setTargetRepository = useCallback((value) => {
    dispatch({type: 'set_target_repository', value});
  },[]);

  const setFilepath = useCallback((value) => {
    if (value !== state.filepath) {
      dispatch({type: 'set_filepath', value});
      saveState('filepath', value);
    };
  },[state.filepath]);

  const setSourceFile = useCallback((value) => {
    if (JSON.stringify(value) !== JSON.stringify(state.sourceFile)) {
      dispatch({type: 'set_source_file', value});
    };
  }, [state.sourceFile]);  
  
  const setTargetFile = useCallback((value) => {
    if (JSON.stringify(value) !== JSON.stringify(state.targetFile)) {
      dispatch({type: 'set_target_file', value});
    };
  }, [state.targetFile]);

  const resumeState = useCallback((value) => {
    dispatch({type: 'resume_state', value});
  },[]);

  const setTargetRepoFromSourceRepo = useCallback(({authentication, sourceRepository, language}) => {
    if (authentication && sourceRepository && language) {
      const repositoryNameArray = sourceRepository.name.split('_');
      const resourceNameArray = repositoryNameArray.slice(1);
      const translationRepoName = `${language.languageId}_${resourceNameArray.join('_')}`;
      const {description} = sourceRepository;
      const sourceRepoPush = sourceRepository.permissions.push;
      const sameRepositoryName = translationRepoName === sourceRepository.name;
      const editSource = (sourceRepoPush && sameRepositoryName);
      if (editSource) {
        const branch = `${authentication.user.username}-tc-create-1`;
        const _targetRepository = { ...sourceRepository, branch };
        setTargetRepository(_targetRepository);
      } else {
        const owner = authentication.user.username;
        const params = {
          owner,
          repo: translationRepoName,
          config: authentication.config,
          settings: {description},
        };
        ensureRepo(params).then(setTargetRepository);
      }
    } else {
      setTargetRepository();
    }
  },[setTargetRepository]);

  const actions = {
    setAuthentication,
    setLanguage,
    setFontScale,
    setConfig,
    setSourceRepository,
    setTargetRepository,
    setSourceFile,
    setTargetFile,
    setTargetRepoFromSourceRepo,
    setFilepath,
    resumeState,
  };
  return [state, actions];
};
