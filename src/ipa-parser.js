var IpaSyntaxError = require("./error/ipa-syntax-error");
let UnitsBuilder = require("./builder/units-builder");

module.exports = class IpaParser {

  constructor(mapper, normalization) {
    this.mapper = mapper;
    this.normalization = normalization;
  }

  /**
  * @param {String} ipaString
  * @returns 
  */
  parse(ipaString) {

    if (typeof ipaString != 'string' && !(ipaString instanceof String)) {
      throw new TypeError("Input is not a string : " + ipaString);
    }

    // Replace character by the standards ones, like ligatures, diacrtics, etc.
    let normalized = this._normalize(ipaString);

    let alternatives = this._alternatives(normalized);
    if (alternatives.length === 1 && alternatives[0] !== normalized) {
      throw new IpaSyntaxError("Alternatives parsing failed: got '" + alternatives[0] + "', want '" + normalized + "'");
    }

    let results = [];
    for (let i = 0; i < alternatives.length; i++) {
      results.push(this._parse(alternatives[i]));
    }
    return results;
  }

  /**
   * 
   * @param {String} input a 'IPA' string
   * @returns {String} 
   */
  _normalize(input) {
    let tmp = this._replaceAll(input, this.normalization);

    // Use the 'decompose' form of the letter with diacritic
    // except for C with cedilla
    tmp = tmp.normalize("NFD");
    tmp = tmp.replace(/\u0063\u0327/g, "\u00E7"); // LATIN SMALL LETTER C WITH CEDILLA

    return tmp;
  }

  _alternatives(normalized) {
    let transcriptionType = "none";
    let alternativeType = "indistinguishable";
    let state = "INIT";
    let alternatives = [];
    let activeAlternative = [];
    for (let i = 0; i < normalized.length; i++) {
      let char = normalized[i];
      let symbol = this.mapper.get(char);

      switch (symbol.type) {
        // BRACKET MANAGEMENT
        case "bracket": {
          switch (state) {

            case "INIT": {
              if (!symbol.start) {
                throw new IpaSyntaxError("Unexpected close bracket without open bracket. Close bracket: " + char);
              }
              transcriptionType = symbol.start;
              state = "OPEN";
              alternatives.push(char);
            }; break;

            case "OPEN": {
              if (symbol.start && symbol.start === alternativeType) {
                state = "ALTERNATIVE";
                activeAlternative = [];
                continue;
              }
              if (!symbol.end) {
                throw new IpaSyntaxError("Unexpected open bracket after another one. State: " + state + ". Second bracket: " + char);
              }
              if (symbol.end !== transcriptionType) {
                throw new IpaSyntaxError("Opening bracket does not match ending bracket. Ending bracket: " + char);
              }
              state = "CLOSE";
              alternatives.push(char);
            }; break;

            case "ALTERNATIVE": {
              if (!symbol.end) {
                throw new IpaSyntaxError("Unexpected open bracket inside alternative group. Second bracket: " + char);
              }
              if (symbol.end !== alternativeType) {
                throw new IpaSyntaxError("Ending bracket inside alternative block doesn't match. Ending bracket: " + char);
              }
              state = "OPEN";
              alternatives.push(activeAlternative);
            }; break;

            case "CLOSE":
              throw new IpaSyntaxError("Unexpected bracket: " + char);
          }
        }; break;

        // DATA MANAGEMENT
        default: {
          if (state == "CLOSE") {
            throw new IpaSyntaxError("Data after closing bracket. Data: " + char);
          } else if (state == "INIT") {
            state = "OPEN";
          }
          if (state === "ALTERNATIVE") {
            activeAlternative.push(char);
          } else {
            alternatives.push(char);
          }
        }
      }

    }
    // End of input
    if (transcriptionType !== "none" && state == "OPEN") {
      throw new IpaSyntaxError("Closing bracket is mising");
    }

    let expansion = [""];
    for (let i = 0; i < alternatives.length; i++) {
      if (!Array.isArray(alternatives[i])) {
        for (let j = 0; j < expansion.length; j++) {
          expansion[j] += alternatives[i];
        }
        continue;
      }
      let newExpansion = [];
      // Push empty versions (without any of the alternatives).
      for (let k = 0; k < expansion.length; k++) {
        newExpansion.push(expansion[k]);
      }
      for (let j = 0; j < alternatives[i].length; j++) {
        for (let k = 0; k < expansion.length; k++) {
          newExpansion.push(expansion[k] + alternatives[i][j]);
        }
      }
      expansion = newExpansion;
    }
    return expansion;
  }


  /**
   * @param {String} normalized a 'IPA' normalized String 
   * @returns
   */
  _parse(normalized) {
    let builder = new UnitsBuilder();

    let transcriptionType = "none";
    let state = "INIT";
    for (let i = 0; i < normalized.length; i++) {
      let char = normalized[i];
      let symbol = this.mapper.get(char);

      switch (symbol.type) {
        // BRACKET MANAGEMENT
        case "bracket": {
          switch (state) {

            case "INIT": {
              if (!symbol.start) {
                throw new IpaSyntaxError("Parse: Unexpected close bracket without open bracket. Close bracket: " + char);
              }
              transcriptionType = symbol.start;
              state = "OPEN";
            }; break;

            case "OPEN": {
              if (!symbol.end) {
                throw new IpaSyntaxError("Parse: Unexpected open bracket after another one. State: " + state + ". Second bracket: " + char + ". Parsed: '" + normalized.substring(0, i+1) + "'");
              }
              if (symbol.end !== transcriptionType) {
                throw new IpaSyntaxError("Parse: Opening bracket do not match ending bracket. Ending bracket: " + char);
              }
              state = "CLOSE";
            }; break;

            case "CLOSE":
              throw new IpaSyntaxError("Parse: Unexpected bracket: " + char);
          }
        }; break;

        // SPACING MANAGEMENT
        case "spacing": {
          builder.spacing();
        }; break;

        // DATA MANAGEMENT
        default: {

          if (state == "CLOSE") {
            throw new IpaSyntaxError("Data after closing bracket. Data: " + char);
          } else if (state == "INIT") {
            state = "OPEN";
          }
          builder.add(symbol);
        }
      }

    }
    // End of input
    if (transcriptionType !== "none" && state == "OPEN") {
      throw new IpaSyntaxError("Closing bracket is mising");
    }
    let phonemes = builder.end();

    return {
      "type": transcriptionType,
      "units": phonemes
    };
  }

  _replaceAll(input, actions) {
    let tmp = input;
    for (let key in actions) {
      let regex = new RegExp(key, 'gu');
      tmp = tmp.replace(regex, actions[key]);
    }
    return tmp;
  }
}
