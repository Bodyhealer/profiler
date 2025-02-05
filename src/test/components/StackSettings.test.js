/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow
import * as React from 'react';
import { fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';

import { render } from 'firefox-profiler/test/fixtures/testing-library';
import { StackSettings } from '../../components/shared/StackSettings';
import { storeWithProfile } from '../fixtures/stores';
import {
  getImplementationFilter,
  getCurrentSearchString,
} from '../../selectors/url-state';
import { fireFullClick } from '../fixtures/utils';

describe('StackSettings', function() {
  function setup() {
    jest.useFakeTimers();
    const store = storeWithProfile();

    const renderResult = render(
      <Provider store={store}>
        <StackSettings />
      </Provider>
    );

    return {
      ...renderResult,
      ...store,
    };
  }

  it('matches the snapshot', () => {
    const { container } = setup();
    expect(container).toMatchSnapshot();
  });

  /**
   * Get around the type constraints of refining an HTMLElement into a radio input.
   */
  function getCheckedState(element: HTMLElement): mixed {
    return (element: any).checked;
  }

  it('can change the implementation filter to JavaScript', async function() {
    const { getByLabelText, getState } = setup();
    expect(getImplementationFilter(getState())).toEqual('combined');
    const radioButton = getByLabelText(/JavaScript/);

    fireFullClick(radioButton);

    expect(getCheckedState(radioButton)).toBe(true);
    expect(getImplementationFilter(getState())).toEqual('js');
  });

  it('can change the implementation filter to Native', function() {
    const { getByLabelText, getState } = setup();
    expect(getImplementationFilter(getState())).toEqual('combined');
    const radioButton = getByLabelText(/Native/);

    fireFullClick(radioButton);

    expect(getCheckedState(radioButton)).toBe(true);
    expect(getImplementationFilter(getState())).toEqual('cpp');
  });

  it('can change the implementation filter to All stacks', function() {
    const { getByLabelText, getState } = setup();
    fireFullClick(getByLabelText(/Native/));
    expect(getImplementationFilter(getState())).toEqual('cpp');
    const radioButton = getByLabelText(/All stacks/);

    fireFullClick(radioButton);

    expect(getCheckedState(radioButton)).toBe(true);
    expect(getImplementationFilter(getState())).toEqual('combined');
  });

  it('can change the search', function() {
    const { getByLabelText, getState } = setup();
    expect(getCurrentSearchString(getState())).toEqual('');
    const searchText = 'some search';
    const input: HTMLInputElement = (getByLabelText(/Filter stacks/): any);

    fireEvent.change(input, {
      target: { value: searchText },
    });

    jest.runAllTimers();
    expect(getCurrentSearchString(getState())).toEqual(searchText);
    expect(input.value).toEqual(searchText);
  });
});
