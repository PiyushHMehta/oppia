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
 * @fileoverview Utility functions for voiceover submitter.
 */

import {Page, expect} from '@playwright/test';
import {BaseUser} from '../common/playwright-utils';
import testConstants from '../common/test-constants';
import {showMessage} from '../common/show-message';

const baseURL = testConstants.URLs.BaseURL;

// Translation tab sub-tabs.
const TRANSLATION_TAB_SELECTORS: Record<string, string> = {
  Content: '.e2e-test-translation-content-tab',
  Interaction: '.e2e-test-translation-interaction-tab',
  Feedback: '.e2e-test-translation-feedback-tab',
  Hints: '.e2e-test-translation-hints-tab',
  Solution: '.e2e-test-translation-solution-tab',
};

const ACCESSIBLE_TAB_SELECTORS: Record<string, string> = {
  Content: '.e2e-test-accessibility-translation-content',
  Feedback: '.e2e-test-accessibility-translation-feedback',
  Hints: '.e2e-test-accessibility-translation-hint',
  Solution: '.e2e-test-accessibility-translation-solution',
};

// Voiceover upload modal.
const addManualVoiceoverButtonSelector = '.e2e-test-voiceover-upload-audio';
const saveUploadedAudioButtonSelector = '.e2e-test-save-uploaded-audio-button';
const uploadErrorMessageSelector = '.e2e-test-upload-error-message';

// Voiceover playback in translation tab.
const voiceoverPlayPauseButtonSelector = '.e2e-test-play-voiceover-button';
const voiceoverPlayIconSelector = `${voiceoverPlayPauseButtonSelector} .e2e-test-play`;
const voiceoverPauseIconSelector = `${voiceoverPlayPauseButtonSelector} .e2e-test-pause`;
const voiceoverProgressBarSelector = '.e2e-test-voiceover-progress-bar';

// Voiceover delete.
const deleteVoiceoverButtonSelector = '.e2e-test-delete-voiceover-button';

// Audio needs-update toggle.
const audioStatusUpdateButtonSelector = '.e2e-test-audio-status-update-button';
const audioNeedsUpdateIconSelector = '.needs-update-button-icon';
const audioDoesNotNeedUpdateIconSelector = '.does-not-needs-update-button-icon';

// Translation numerical status.
const translationNumericalStatusSelector =
  '.e2e-test-translation-numerical-status';

// Voiceover content text selectors.
const contentVoiceoverTextSelector = '.e2e-test-content-text';
const interactionVoiceoverTextSelector = '.e2e-test-interaction-text';
const solutionVoiceoverTextSelector = '.e2e-test-solution-text';

// Language accent selector in translation tab.
const voiceoverLanguageAccentSelector =
  '.e2e-test-voiceover-language-accent-selector';
const uploadVoiceoverFileInputSelector = '.e2e-test-upload-audio-input';

// Node warning sign (stale voiceover indicator).
const nodeWarningSignSelector = '.e2e-test-node-warning-sign';

// Preview tab navigation.
const previewTabButtonSelector = '.e2e-test-preview-tab';
const mobilePreviewTabButtonSelector = '.e2e-test-mobile-preview-button';
const mobileOptionsButtonSelector = '.e2e-test-mobile-options-button';
const mobileNavbarDropdownSelector = '.e2e-test-mobile-options-dropdown';
const mobileNavbarPaneSelector = '.e2e-test-navbar-options-dropdown-toggle-btn';

// Audio bar in lesson preview / lesson player.
const audioExpandButtonSelector = '.e2e-test-lp-audio-expand-button';
const voiceoverDropdownSelector = '.e2e-test-audio-bar';
const voiceoverLanguageSelectSelector = '.e2e-test-audio-lang-select';
const playVoiceoverButtonSelector = '.e2e-test-play-circle';
const audioNotAvailableIconSelector = '.audio-controls-audio-not-available';

export class VoiceoverSubmitter extends BaseUser {
  /**
   * Navigate to the exploration editor for the given explorationId.
   */
  async navigateToExplorationEditor(explorationId: string): Promise<void> {
    await this.goto(`${baseURL}/create/${explorationId}#/`);
    showMessage('Navigated to exploration editor.');
  }

  /**
   * Navigate to the preview tab of the exploration editor.
   */
  async navigateToPreviewTab(): Promise<void> {
    if (this.isViewportAtMobileWidth()) {
      const mobileOptions = await this.page.$(mobileOptionsButtonSelector);
      if (!mobileOptions) {
        await this.expectElementToBeVisible(mobileOptionsButtonSelector);
      }
      const dropdownVisible = await this.isElementVisible(
        mobileNavbarPaneSelector
      );
      if (!dropdownVisible) {
        await this.clickOnElementWithSelector(mobileOptionsButtonSelector);
        await this.expectElementToBeVisible(mobileNavbarDropdownSelector);
      }
      await this.clickOnElementWithSelector(mobilePreviewTabButtonSelector);
    } else {
      await this.expectElementToBeVisible(previewTabButtonSelector);
      await this.clickOnElementWithSelector(previewTabButtonSelector);
    }
    await this.page.waitForFunction(() =>
      window.location.href.includes('#/preview/')
    );
    showMessage('Navigated to preview tab.');
  }

  /**
   * Select the specified voiceover content type in the translation tab.
   */
  async selectVoiceoverContentType(
    type: 'Content' | 'Interaction' | 'Feedback' | 'Hints' | 'Solution'
  ): Promise<void> {
    const selector = TRANSLATION_TAB_SELECTORS[type];
    await this.expectElementToBeVisible(selector);
    await this.clickOnElementWithSelector(selector);
    await this.page.waitForFunction((sel: string) => {
      const el = document.querySelector(sel);
      return el?.parentElement?.classList.contains(
        'oppia-active-translation-tab'
      );
    }, selector);
    showMessage(`Selected voiceover content type: ${type}`);
  }

  /**
   * Check that the content voiceover text contains the expected string.
   */
  async expectContentVoiceoverToContain(expectedText: string): Promise<void> {
    await this.expectTextContentToContain(
      contentVoiceoverTextSelector,
      expectedText
    );
  }

  /**
   * Check that the interaction voiceover text contains the expected string.
   */
  async expectInteractionVoiceoverToContain(
    expectedText: string
  ): Promise<void> {
    await this.expectTextContentToContain(
      interactionVoiceoverTextSelector,
      expectedText
    );
  }

  /**
   * Check that the solution voiceover text contains the expected string.
   */
  async expectSolutionVoiceoverToContain(expectedText: string): Promise<void> {
    await this.expectTextContentToContain(
      solutionVoiceoverTextSelector,
      expectedText
    );
  }

  /**
   * Check that visible feedback cards contain all expected texts (in order).
   */
  async expectVisibleFeedbackTextsToContain(
    expectedTexts: string[]
  ): Promise<void> {
    for (let i = 0; i < expectedTexts.length; i++) {
      const cardSelector = `.e2e-test-feedback-${i}`;
      const textSelector = `.e2e-test-feedback-${i}-text`;
      await this.expectElementToBeVisible(cardSelector);
      await this.clickOnElementWithSelector(cardSelector);
      await this.expectElementToBeVisible(textSelector);
      await this.expectTextContentToContain(textSelector, expectedTexts[i]);
    }
  }

  /**
   * Check that visible hint cards contain all expected texts (in order).
   */
  async expectVisibleHintTextsToContain(
    expectedTexts: string[]
  ): Promise<void> {
    for (let i = 0; i < expectedTexts.length; i++) {
      const hintSelector = `.e2e-test-hint-${i}`;
      const textSelector = `.e2e-test-hint-${i}-text`;
      await this.expectElementToBeVisible(hintSelector);
      await this.clickOnElementWithSelector(hintSelector);
      await this.expectElementToBeVisible(textSelector);
      await this.expectTextContentToContain(textSelector, expectedTexts[i]);
    }
  }

  /**
   * Check the aria-label on the translation progress element.
   */
  async expectTranslationProgressAriaLabelToMatch(
    expectedText: string
  ): Promise<void> {
    await this.expectElementToBeVisible(translationNumericalStatusSelector);
    await this.page.waitForFunction((selector: string) => {
      const el = document.querySelector(selector);
      const label = el?.getAttribute('aria-label') ?? '';
      return (
        label.includes('items translated') &&
        !label.includes('NaN') &&
        !label.includes('undefined')
      );
    }, translationNumericalStatusSelector);
    const ariaLabel = await this.page.$eval(
      translationNumericalStatusSelector,
      el => el.getAttribute('aria-label') || el.textContent
    );
    expect(ariaLabel).toMatch(expectedText);
  }

  /**
   * Check the aria-label on a translation sub-tab.
   */
  async expectTranslationSubTabAriaLabelToBe(
    tabName: 'Content' | 'Feedback' | 'Hints' | 'Solution',
    expectedAriaLabel: string
  ): Promise<void> {
    const selector = ACCESSIBLE_TAB_SELECTORS[tabName];
    await this.expectElementToBeVisible(selector);
    await this.page.waitForFunction(
      (sel: string) =>
        document.querySelector(sel)?.getAttribute('aria-label') !== null,
      selector
    );
    const ariaLabel = await this.page.$eval(selector, el =>
      el.getAttribute('aria-label')
    );
    expect(ariaLabel).toBe(expectedAriaLabel);
  }

  /**
   * Select a voiceover language accent from the translation-tab dropdown.
   */
  async selectVoiceoverLanguageAccent(
    accentDescription: string
  ): Promise<void> {
    await this.expectElementToBeVisible(voiceoverLanguageAccentSelector);
    await this.clickOnElementWithSelector(voiceoverLanguageAccentSelector);
    await this.selectMatOption(accentDescription);
    await this.expectTextContentToContain(
      voiceoverLanguageAccentSelector,
      accentDescription
    );
  }

  /**
   * Click the "Add manual voiceover" button and wait for the modal.
   */
  async clickOnAddManualVoiceoverButton(): Promise<void> {
    await this.expectElementToBeVisible(addManualVoiceoverButtonSelector);
    await this.clickOnElementWithSelector(addManualVoiceoverButtonSelector);
    await this.expectModalTitleToBe('Add Voiceover');
  }

  /**
   * Click the "Save" button in the upload voiceover modal.
   */
  async clickOnSaveUploadVoiceoverButton(): Promise<void> {
    await this.expectElementToBeVisible(saveUploadedAudioButtonSelector);
    await this.clickOnElementWithSelector(saveUploadedAudioButtonSelector);
    await this.expectElementToBeClickable(
      saveUploadedAudioButtonSelector,
      false
    );
  }

  /**
   * Check the accessible name of the upload-voiceover file input.
   */
  async expectUploadVoiceoverFileButtonAccessibleNameToBe(
    expectedName: string
  ): Promise<void> {
    await this.expectElementToBeVisible(uploadVoiceoverFileInputSelector);
    const name = await this.page.$eval(
      uploadVoiceoverFileInputSelector,
      el => el.getAttribute('aria-label') ?? ''
    );
    expect(name).toBe(expectedName);
  }

  /**
   * Check the accessible name of the play-voiceover button.
   */
  async expectPlayVoiceoverButtonAccessibleNameToBe(
    expectedName: string
  ): Promise<void> {
    await this.expectElementToBeVisible(voiceoverPlayPauseButtonSelector);
    const name = await this.page.$eval(voiceoverPlayPauseButtonSelector, el =>
      (el.getAttribute('aria-label') ?? '').trim()
    );
    expect(name).toBe(expectedName);
  }

  /**
   * Verify the voiceover plays by confirming the progress bar advances.
   */
  async expectVoiceoverIsPlayableInTranslationTab(): Promise<void> {
    await this.expectElementToBeVisible(voiceoverProgressBarSelector);
    const initial = parseInt(
      (await this.page.$eval(voiceoverProgressBarSelector, el =>
        el.getAttribute('aria-valuenow')
      )) ?? '0'
    );
    await this.expectElementToBeVisible(voiceoverPlayIconSelector);
    await this.clickOnElementWithSelector(voiceoverPlayPauseButtonSelector);
    await this.page.waitForFunction(
      (selector: string, initialProgress: number) => {
        const el = document.querySelector(selector);
        return (
          parseInt(el?.getAttribute('aria-valuenow') ?? '0') > initialProgress
        );
      },
      voiceoverProgressBarSelector,
      initial
    );
    await this.expectElementToBeVisible(voiceoverPauseIconSelector);
    await this.clickOnElementWithSelector(voiceoverPlayPauseButtonSelector);
    await this.expectElementToBeVisible(voiceoverPlayIconSelector);
  }

  /**
   * Delete the voiceover attached to the current card.
   */
  async deleteVoiceoverInCurrentCard(): Promise<void> {
    await this.expectElementToBeVisible(deleteVoiceoverButtonSelector);
    await this.clickOnElementWithSelector(deleteVoiceoverButtonSelector);
    await this.clickButtonInModal(
      'Are you sure you want to remove this voiceover?',
      'confirm'
    );
  }

  /**
   * Toggle the "audio needs update" button.
   */
  async toggleAudioNeedsUpdateButton(): Promise<void> {
    await this.expectElementToBeVisible(audioStatusUpdateButtonSelector);
    const currentlyNeedsUpdate = await this.isElementVisible(
      `${audioStatusUpdateButtonSelector}${audioNeedsUpdateIconSelector}`
    );
    await this.clickOnElementWithSelector(audioStatusUpdateButtonSelector);
    await this.expectElementToBeVisible(
      `${audioStatusUpdateButtonSelector}${audioNeedsUpdateIconSelector}`,
      !currentlyNeedsUpdate
    );
  }

  /**
   * Check the current voice status button state.
   */
  async expectCurrentVoiceStatusButtonToBe(
    status: 'upto date' | 'needs update'
  ): Promise<void> {
    const statusSelector =
      status === 'upto date'
        ? `${audioStatusUpdateButtonSelector}${audioDoesNotNeedUpdateIconSelector}`
        : `${audioStatusUpdateButtonSelector}${audioNeedsUpdateIconSelector}`;
    await this.expectElementToBeVisible(statusSelector);
  }

  /**
   * Check the numerical translation status label (e.g. "(1/7)").
   */
  async expectTranslationNumericalStatusToBe(status: string): Promise<void> {
    await this.expectTextContentToBe(
      translationNumericalStatusSelector,
      `(${status})`
    );
  }

  /**
   * Check that the node warning sign is visible (or not).
   */
  async expectNodeWarningSignToBeVisible(
    visible: boolean = true
  ): Promise<void> {
    if (this.isViewportAtMobileWidth()) {
      showMessage(
        'Skipping node warning sign check — nodes not visible on mobile.'
      );
      return;
    }
    await this.expectElementToBeVisible(nodeWarningSignSelector, visible);
  }

  /**
   * Check the upload error message shown after an invalid file upload.
   */
  async expectUploadErrorMessageToBe(expectedMessage: string): Promise<void> {
    await this.expectElementToBeVisible(uploadErrorMessageSelector);
    await this.expectTextContentToContain(
      uploadErrorMessageSelector,
      expectedMessage
    );
  }

  /**
   * Check that the audio-expand button is visible in the lesson player / preview.
   */
  async expectAudioExpandButtonToBeVisible(): Promise<void> {
    await this.expectElementToBeVisible(audioExpandButtonSelector);
    showMessage('Audio expand button is visible.');
  }

  /**
   * Expand the voiceover bar by clicking its dropdown.
   */
  async expandVoiceoverBar(): Promise<void> {
    await this.expectElementToBeVisible(voiceoverDropdownSelector);
    await this.clickOnElementWithSelector(voiceoverDropdownSelector);
    await this.expectElementToBeVisible(voiceoverDropdownSelector, false);
  }

  /**
   * Check that the selected voiceover language matches.
   */
  async expectCurrentVoiceoverLanguageToBe(language: string): Promise<void> {
    await this.expectElementToBeVisible(voiceoverLanguageSelectSelector);
    await this.expectElementValueToBe(
      voiceoverLanguageSelectSelector,
      language
    );
  }

  /**
   * Check that the voiceover play button is enabled or disabled.
   */
  async expectVoiceoverPlayButtonToBe(
    status: 'enabled' | 'disabled'
  ): Promise<void> {
    await this.expectElementToBeVisible(playVoiceoverButtonSelector);
    await this.expectElementToBeVisible(
      audioNotAvailableIconSelector,
      status === 'disabled'
    );
  }

  /**
   * Check that a voiceover is playable by starting it and confirming progress.
   */
  async expectVoiceoverIsPlayable(): Promise<void> {
    await this.expectElementToBeVisible(playVoiceoverButtonSelector);
    await this.clickOnElementWithSelector(playVoiceoverButtonSelector);
    showMessage('Voiceover started playing.');
  }
}

export const VoiceoverSubmitterFactory = (page: Page): VoiceoverSubmitter =>
  new VoiceoverSubmitter(page);
