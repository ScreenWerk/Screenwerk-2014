var constants = {
  __APPLICATION_NAME: undefined,
  __VERSION: undefined,
  __HOSTNAME: undefined,
  __API_URL: undefined,
  __META_DIR: undefined,
  __MEDIA_DIR: undefined,
  __LOG_DIR: undefined,
  __STRUCTURE: undefined,
  __HIERARCHY: undefined,
  __DEFAULT_UPDATE_INTERVAL_MINUTES: undefined,
  __UPDATE_INTERVAL_SECONDS: undefined,
  __DEFAULT_DELAY_MS: undefined,
  __DEBUG_MODE: undefined,
  __SCREEN: undefined,
  __RELAUNCH_THRESHOLD: undefined,
  __API_KEY: undefined,
  __SCREEN_ID: undefined,
}

constants.__STRUCTURE = {
    "name": "screen",
    "reference": {
        "name": "screen-group",
        "reference": {
            "name": "configuration",
            "child": {
                "name": "schedule",
                "reference": {
                    "name": "layout",
                    "child": {
                        "name": "layout-playlist",
                        "reference": {
                            "name": "playlist",
                            "child": {
                                "name": "playlist-media",
                                "reference": {
                                    "name": "media"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
constants.__HIERARCHY = {'child_of': {}, 'parent_of': {}}
function recurseHierarchy(structure, parent_name) {
    if (parent_name) {
        constants.__HIERARCHY.child_of[parent_name] = structure.name
        constants.__HIERARCHY.parent_of[structure.name] = parent_name
    }
    if (structure.child !== undefined)
        recurseHierarchy(structure.child, structure.name)
    else if (structure.reference !== undefined)
        recurseHierarchy(structure.reference, structure.name)
}
recurseHierarchy(constants.__STRUCTURE)


module.exports = constants
