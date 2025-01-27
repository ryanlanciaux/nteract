import { actions } from "@nteract/core";
import { remote } from "electron";
import { readFileObservable, writeFileObservable } from "fs-observable";
import { ofType, StateObservable } from "redux-observable";
import { Observable } from "rxjs";
import { map, mapTo, mergeMap, switchMap } from "rxjs/operators";
import { DesktopNotebookAppState } from "../state";

import * as path from "path";

import { Actions } from "../actions";

const HOME = remote.app.getPath("home");

export const CONFIG_FILE_PATH = path.join(HOME, ".jupyter", "nteract.json");

/**
 * An epic that loads the configuration.
 */
export const loadConfigEpic = (action$: Observable<Actions>) =>
  action$.pipe(
    ofType(actions.LOAD_CONFIG),
    switchMap(() =>
      readFileObservable(CONFIG_FILE_PATH).pipe(
        map(data => actions.configLoaded(JSON.parse(data.toString())))
      )
    )
  );

/**
 * An epic that saves the configuration if it has been changed.
 */
export const saveConfigOnChangeEpic = (action$: Observable<Actions>) =>
  action$.pipe(
    ofType(actions.SET_CONFIG),
    mapTo({ type: actions.SAVE_CONFIG })
  );

/**
 * An epic that saves the configuration.
 */
export const saveConfigEpic = (
  action$: Observable<Actions>,
  state$: StateObservable<DesktopNotebookAppState>
) =>
  action$.pipe(
    ofType(actions.SAVE_CONFIG),
    mergeMap(() =>
      writeFileObservable(
        CONFIG_FILE_PATH,
        JSON.stringify(state$.value.config.toJS())
      ).pipe(map(actions.doneSavingConfig))
    )
  );
