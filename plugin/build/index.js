"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withUnity = (config, { name = 'react-native-unity' } = {}) => {
    config.name = name;
    config = withProjectBuildGradleMod(config);
    config = withSettingsGradleMod(config);
    config = withGradlePropertiesMod(config);
    config = withStringsXMLMod(config);
    return config;
};
const REPOSITORIES_END_LINE = `maven { url 'https://www.jitpack.io' }`;
const withProjectBuildGradleMod = (config) => (0, config_plugins_1.withProjectBuildGradle)(config, (modConfig) => {
    if (modConfig.modResults.contents.includes(REPOSITORIES_END_LINE)) {
        // use the last known line in expo's build.gradle file to append the newline after
        modConfig.modResults.contents = modConfig.modResults.contents.replace(REPOSITORIES_END_LINE, REPOSITORIES_END_LINE +
            '\nflatDir { dirs "${project(\':unityLibrary\').projectDir}/libs" }\n');
    }
    else {
        throw new Error('Failed to find the end of repositories in the android/build.gradle file`');
    }
    return modConfig;
});
const withSettingsGradleMod = (config) => (0, config_plugins_1.withSettingsGradle)(config, (modConfig) => {
    modConfig.modResults.contents += `
include ':unityLibrary'
project(':unityLibrary').projectDir=new File('../unity/builds/android/unityLibrary')
    `;
    return modConfig;
});
const withGradlePropertiesMod = (config) => (0, config_plugins_1.withGradleProperties)(config, (modConfig) => {
    modConfig.modResults.push({
        type: 'property',
        key: 'unityStreamingAssets',
        value: '.unity3d',
    });
    return modConfig;
});
// add string
const withStringsXMLMod = (config) => (0, config_plugins_1.withStringsXml)(config, (config) => {
    config.modResults = config_plugins_1.AndroidConfig.Strings.setStringItem([
        {
            _: 'Game View',
            $: {
                name: 'game_view_content_description',
            },
        },
    ], config.modResults);
    return config;
});
exports.default = withUnity;
