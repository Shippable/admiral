module.exports = {
  "env": {
    "browser": true
  },
  "plugins": [
    "callback-function"
  ],
  "globals": {
    "_": true,
    "$": true,
    "ActErr": true,
    "async": true,
    "config": true,
    "logger": true,
    "moment": true,
    "respondWithError": true,
    "sendJSONResponse": true,
    "util": true,
    "www": true
  },
  "extends": "airbnb-base/legacy",
  "rules": {
    // rules to override from airbnb/legacy
    "object-curly-spacing": ["error", "never"],
    "curly": ["error", "multi", "consistent"],
    "no-param-reassign": ["error", { "props": false }],
    "no-underscore-dangle": ["error", { "allow": ["_r", "_p"] }],
    "quote-props": ["error", "consistent-as-needed"],

    // rules from airbnb that we won't be using
    "consistent-return": 0,
    "default-case": 0,
    "func-names": 0,
    "no-plusplus": 0,
    "no-use-before-define": 0,
    "vars-on-top": 0,
    "no-loop-func": 0,
    "no-underscore-dangle": 0,
    "no-param-reassign": 0,
    "one-var-declaration-per-line": 0,
    "one-var": 0,
    "no-multi-assign": 0,
    "global-require": 0,

    // extra rules not present in airbnb
    "max-len": ["error", 80],
  }
};
