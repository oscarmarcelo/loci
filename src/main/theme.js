// TODO: Remove the unused colors, to minimize calls.
const namedColors = [
  'canvasArtboardTitleColor',
  'canvasBackgroundColor',
  'canvasDarkModeBackgroundColor',
  'canvasLightModeBackgroundColor',
  'canvasFlowArrowColor',
  'canvasLayerHighlightColor',
  'canvasLayerSelectionColor',
  'canvasMeasurementLabelBackgroundColor',
  'canvasPageBackgroundColor',
  'canvasDarkModePageBackgroundColor',
  'canvasLightModePageBackgroundColor',
  'canvasPixelLineColor',
  'canvasRulerBackgroundColor',
  'canvasRulerLineColor',
  'canvasRulerLineOccupiedColor',
  'canvasRulerLockColor',
  'canvasRulerOccupiedColor',
  'canvasRulerTextColor',
  'canvasRulerTextBackgroundColor',
  'canvasSliceOutlineColor',
  'canvasSymbolTitleColor',
  'canvasOverrideSelectionColor',
  'canvasOverrideSelectionBackgroundColor',
  'colorPickerFrequentImageBackgroundColor',
  'colorPickerAssetBorderColor',
  'colorPickerModifiedAssetIndicatorBorder',
  'colorPickerCheckerboardBackgroundColor',
  'colorPickerCheckerboardBorderColor',
  'colorPickerMarkerFillColor',
  'colorPickerMarkerShadowColor',
  'colorPickerSeparatorColor',
  'colorPickerModelPickerBackgroundColor',
  'colorPickerModelPickerBackgroundColorActive',
  'colorPickerColorControlsBorder',
  'colorPickerColorControlsKnobBorder',
  'colorPickerCheckerboardForeground',
  'assetPickerItemBorderColor',
  'assetPickerItemGridHighlightColor',
  'assetPickerImageItemBackgroundColor',
  'overlayButtonBackground',
  'documentsWindowSelectionColor',
  'documentsWindowUnemphasizedSelectionColor',
  'documentItemOverlayColor',
  'documentsWindowThumbnailBorderColor',
  'documentsWindowUnemphasizedThumbnailBorderColor',
  'documentsWindowThumbnailBackgroundColor',
  'documentsWindowTextSelectionColor',
  'documentsWindowUnemphasizedTextSelectionColor',
  'licenseWindowErrorTextColor',
  'preferencesWindowErrorTextColor',
  'preferencesAccountBoxBackgroundColor',
  'windowBadgeFontsMissingColor',
  'windowBadgeLibraryChangesAvailableColor',
  'windowBadgePluginUpdatesAvailableColor',
  'cloudPopoverButtonTintColor',
  'cloudPopoverButtonTintColorPressed',
  'cloudPopoverCancelButtonTintColor',
  'cloudPopoverCancelButtonTintColorPressed',
  'windowBadgeTrialMessageColor',
  'windowBadgeMultipleNotificationsColor',
  'windowBadgeTextColor',
  'windowBadgeUnfocusedPillColor',
  'documentsWindowSeperatorColor',
  'documentsWindowLocalDocumentButtonBackgroundColor',
  'documentsWindowLocalDocumentButtonBackgroundHighlightColor',
  'documentsWindowLocalDocumentButtonInnerShadowColor',
  'documentsWindowLocalDocumentButtonSecondInnerShadowColor',
  'documentsWindowLocalDocumentBorderColor',
  'documentsWindowWidgetColorPressed',
  'documentsWindowStatusIconColor',
  'documentsWindowStatusIconColorSelected',
  'cloudIntroButtonBackgroundColor',
  'cloudIntroButtonBackgroundColorPressed',
  'componentPaneTextItemMissingFontBackgroundColor',
  'hoverButtonHoverColor',
  'hoverButtonNormalColor',
  'splitViewDividerColor',
  'layerListArtboardBorderColor',
  'layerListSelectedArtboardBorderColor',
  'layerListBackgroundColor',
  'layerListLightBackgroundColor',
  'layerListFilterBarBackgroundColor',
  'layerListFilterBarBorderColor',
  'layerListFilterTokenBackgroundColor',
  'layerListFilterTokenSelectedBackgroundColor',
  'layerListFilterTokenTitleColor',
  'layerListFilterTokenSelectedTitleColor',
  'layerListIconTintColor',
  'layerListIconPressedTintColor',
  'layerListIconPressedTintColorSelected',
  'layerListIconSelectedActiveTintColor',
  'layerListIconSelectedInactiveTintColor',
  'layerListIconSharedTintColor',
  'layerListSplitViewDividerColor',
  'layerListSymbolOverrideIconTintColor',
  'layerListTabButtonColor',
  'layerListSelectedTabButtonColor',
  'componentPaneGroupPreviewBackgroundColor',
  'inspectorAccentColor',
  'inspectorAccentedIconColor',
  'inspectorHighlightedAccentedIconColor',
  'inspectorAccentedColorModePickerIconColor',
  'inspectorHighlightedAccentedColorModePickerIconColor',
  'inspectorAlignmentDisabledStrutColor',
  'inspectorAlignmentStrutColor',
  'inspectorAlignmentActiveStrutColor',
  'inspectorAlignmentHighlightedActiveStrutColor',
  'inspectorAlignmentViewBackgroundColor',
  'inspectorBackgroundColor',
  'inspectorBorderColor',
  'inspectorButtonBackgroundColor',
  'inspectorButtonDropShadowColor',
  'inspectorButtonHighlightedBackgroundColor',
  'inspectorHighlightedAccentColor',
  'inspectorHighlightedBorderColor',
  'inspectorHighlightedIconColor',
  'inspectorHighlightedSliderKnobColor',
  'inspectorIconColor',
  'inspectorAccentedBackgroundIconColor',
  'inspectorInlineLabelTextColor',
  'inspectorLabelBackgroundColor',
  'inspectorLabelBorderColor',
  'inspectorLabelTextColor',
  'inspectorPushButtonBackgroundColor',
  'inspectorResizePreviewBackgroundColor',
  'inspectorResizePreviewEdgeIndicatorColor',
  'inspectorResizePreviewInnerLayerBackgroundColor',
  'inspectorResizePreviewInnerLayerBorderColor',
  'inspectorSectionBackgroundColor',
  'inspectorSectionHeaderTextColor',
  'inspectorSectionSeparatorColor',
  'inspectorSeparatorColor',
  'inspectorSliderKnobBorderColor',
  'inspectorSliderKnobColor',
  'inspectorSliderRightTrackColor',
  'inspectorStylePreviewButtonOverlayHighlightingColor',
  'inspectorArtboardPresetHeaderColor',
  'inspectorArtboardPresetTableViewBackgroundColor',
  'inspectorSecondaryLabelTextColor',
  'inspectorSecondaryLabelTextColorHighlighted'
];



function getColor(namedColor) {
  const mscolor = MSColor.colorWithNSColor(MSTheme.sharedTheme()[namedColor]());
  const color = mscolor.NSColorWithColorSpace(nil).hexValue().toLowerCase(); // eslint-ignore new-cap
  const alpha = mscolor.alpha() < 1 ? Math.round(mscolor.alpha() * 255).toString(16).padStart(2, 0) : '';

  return `#${color}${alpha}`;
}



export default () => {
  const colors = {};
  const isGraphite = MSTheme.sharedTheme().isGraphiteAccentColor();
  // const isDark = MSTheme.sharedTheme().isDark();

  const overrides = {
    inspectorAlignmentActiveStrutColor: 'inspectorAccentColor',
    inspectorAlignmentHighlightedActiveStrutColor: 'inspectorHighlightedAccentColor'
  };

  for (const name of namedColors) {
    if (isGraphite && Object.keys(overrides).includes(name)) {
      colors[name] = getColor(overrides[name]);
    } else {
      colors[name] = getColor(name);
    }
  }

  return colors;
};
