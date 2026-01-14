import {
  AndroidConfig,
  withGradleProperties,
  withProjectBuildGradle,
  withSettingsGradle,
  withStringsXml,
  withAndroidManifest
} from '@expo/config-plugins';
import type { ConfigPlugin } from '@expo/config-plugins';

const withUnity: ConfigPlugin<{ name?: string }> = (
  config,
  { name = 'react-native-unity' } = {}
) => {
  config.name = name;
  config = withProjectBuildGradleMod(config);
  config = withSettingsGradleMod(config);
  config = withGradlePropertiesMod(config);
  config = withStringsXMLMod(config);
  config = withAndroidManifestMod(config);
  return config;
};

const REPOSITORIES_END_LINE = `maven { url 'https://www.jitpack.io' }`;

const withProjectBuildGradleMod: ConfigPlugin = (config) =>
  withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.contents.includes(REPOSITORIES_END_LINE)) {
      // use the last known line in expo's build.gradle file to append the newline after
      modConfig.modResults.contents = modConfig.modResults.contents.replace(
        REPOSITORIES_END_LINE,
        REPOSITORIES_END_LINE +
          '\nflatDir { dirs "${project(\':unityLibrary\').projectDir}/libs" }\n'
      );
    } else {
      throw new Error(
        'Failed to find the end of repositories in the android/build.gradle file`'
      );
    }
    return modConfig;
  });

const withSettingsGradleMod: ConfigPlugin = (config) =>
  withSettingsGradle(config, (modConfig) => {
    modConfig.modResults.contents += `
include ':unityLibrary'
project(':unityLibrary').projectDir=new File('../unity/builds/android/unityLibrary')
    `;
    return modConfig;
  });

const withGradlePropertiesMod: ConfigPlugin = (config) =>
  withGradleProperties(config, (modConfig) => {
    const androidSdkPath = process.env.ANDROID_SDK_ROOT || "";
    const androidNdkPath = process.env.ANDROID_NDK_ROOT || "";
    modConfig.modResults.push({
      type: 'property',
      key: 'unityStreamingAssets',
      value: '.unity3d',
    });
    modConfig.modResults.push(
      {
        type: 'property',
        key: 'unity.androidSdkPath',
        value: androidSdkPath,
      },
      {
        type: 'property',
        key: 'unity.androidNdkPath',
        value: androidNdkPath,
      }
    );
    return modConfig;
  });

// add string
const withStringsXMLMod: ConfigPlugin = (config) =>
  withStringsXml(config, (config) => {
    // tools:replace="android:enableOnBackInvokedCallback"
    config.modResults = AndroidConfig.Strings.setStringItem(
      [
        {
          _: 'Game View',
          $: {
            name: 'game_view_content_description',
          },
        },
      ],
      config.modResults
    );
    return config;
  });

const withAndroidManifestMod: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    // tools:replace="android:enableOnBackInvokedCallback"
    // Get the main manifest
    const manifest = config.modResults.manifest;

    // Find the application tag (it is an array with one element in this structure)
    const application = manifest.application?.[0];

    // Add or modify attributes for the application tag
    // The attributes are stored under the '$' key
    if (application?.$) {
      application.$["tools:replace"] = "android:enableOnBackInvokedCallback";
    }
    return config;
  });

export default withUnity;
