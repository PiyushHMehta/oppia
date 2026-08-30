// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utility functions for voiceover admin page.
 */

import {Page} from '@playwright/test';
import {BaseUser} from '../common/playwright-utils';
import testConstants from '../common/test-constants';
import {showMessage} from '../common/show-message';

const baseURL = testConstants.URLs.BaseURL;
const voiceoverAdminURL = testConstants.URLs.VoiceoverAdmin;

const languageAccentOptionSelector =
  '.e2e-test-language-accent-selector-option';
const addNewLanguageAccentButtonSelector =
  '.e2e-test-add-new-language-accent-button';
const languageAccentDropdownSelector =
  '.e2e-test-language-accent-dropdown-selector';

const settingsTabSelector = 'a.e2e-test-exploration-settings-tab';
const mobileOptionsButtonSelector = 'i.e2e-test-mobile-options';
const mobileNavbarDropdownSelector = 'div.e2e-test-mobile-options-dropdown';
const mobileSettingsBarSelector = 'li.e2e-test-mobile-settings-button';
const dismissWelcomeModalSelector = 'button.e2e-test-dismiss-welcome-modal';
const voiceArtistSectionHeaderSelector = '.e2e-test-voice-artists-header';
const voiceArtistSectionBodySelector = '.e2e-test-voice-artists-content';
const editVoiceoverArtistButton = 'span.e2e-test-edit-voice-artist-roles';
const voiceArtistUsernameInputBox = 'input#newVoicAartistUsername';
const saveVoiceoverArtistEditButton =
  'button.e2e-test-add-voice-artist-role-button';

export class VoiceoverAdmin extends BaseUser {
  /**
   * Function to register supported language and accent combinations for Oppia voiceovers.
   * @param {string} languageAccentDescription - The language-accent to add.
   */
  async addSupportedLanguageAccentPair(
    languageAccentDescription: string
  ): Promise<void> {
    await this.navigateToVoiceoverAdminPage();
    await this.waitForPageToFullyLoad();

    await this.expectElementToBeVisible(addNewLanguageAccentButtonSelector);
    await this.clickOnElementWithSelector(addNewLanguageAccentButtonSelector);

    await this.expectElementToBeVisible(languageAccentDropdownSelector);
    await this.clickOnElementWithSelector(languageAccentDropdownSelector);

    await this.clickOnElementWithSelectorAndText(
      languageAccentOptionSelector,
      languageAccentDescription
    );
    await this.expectElementToBeVisible(addNewLanguageAccentButtonSelector);
  }

  /**
   * Navigate to the voiceover admin page.
   */
  async navigateToVoiceoverAdminPage(): Promise<void> {
    await this.goto(voiceoverAdminURL);
  }

  /**
   * Add one or more voiceover artists to the exploration currently open in
   * the Settings tab.
   * @param {string[]} voiceArtists - Usernames to add.
   */
  async addVoiceoverArtistsToExploration(
    voiceArtists: string[]
  ): Promise<void> {
    if (!(await this.isElementVisible(voiceArtistSectionBodySelector))) {
      await this.clickOnElementWithSelector(voiceArtistSectionHeaderSelector);
      await this.expectElementToBeVisible(voiceArtistSectionBodySelector);
    }
    for (const artist of voiceArtists) {
      await this.expectElementToBeVisible(editVoiceoverArtistButton);
      await this.clickOnElementWithSelector(editVoiceoverArtistButton);
      await this.expectElementToBeVisible(voiceArtistUsernameInputBox);
      await this.clearAllTextFrom(voiceArtistUsernameInputBox);
      await this.typeInInputField(voiceArtistUsernameInputBox, artist);
      await this.clickOnElementWithSelector(saveVoiceoverArtistEditButton);
      await this.expectElementToBeVisible(
        `div.e2e-test-voice-artist-${artist}`
      );
      showMessage(`${artist} added as a voiceover artist.`);
    }
  }

  /**
   * Navigate to the given exploration's editor settings tab and add the user
   * as a voiceover artist.
   * @param {string} explorationId - The exploration ID.
   * @param {string} voiceArtistUsername - Username to add.
   */
  async addVoiceoverArtistToExplorationWithID(
    explorationId: string,
    voiceArtistUsername: string
  ): Promise<void> {
    await this.goto(`${baseURL}/create/${explorationId}#/`);
    await this.waitForPageToFullyLoad();
    const modal = await this.page.$(dismissWelcomeModalSelector);
    if (modal) {
      await this.clickOnElementWithSelector(dismissWelcomeModalSelector);
      await this.expectElementToBeVisible(dismissWelcomeModalSelector, false);
    }
    if (this.isViewportAtMobileWidth()) {
      const dropdown = await this.page.$(mobileNavbarDropdownSelector);
      if (!dropdown) {
        await this.clickOnElementWithSelector(mobileOptionsButtonSelector);
        await this.expectElementToBeVisible(mobileNavbarDropdownSelector);
      }
      await this.clickOnElementWithSelector(mobileSettingsBarSelector);
    } else {
      await this.clickOnElementWithSelector(settingsTabSelector);
    }
    await this.addVoiceoverArtistsToExploration([voiceArtistUsername]);
  }
}

export let VoiceoverAdminFactory = (page: Page): VoiceoverAdmin => {
  return new VoiceoverAdmin(page);
};
