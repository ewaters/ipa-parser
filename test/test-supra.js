var expect = require("chai").expect;

var ipaParser = require("../src/index.js");

var parser = ipaParser.parser;

function expectUnitsOf(string) {
  return expect(parser.parse(string).units);
}

function supra(category, value) {
  return { "segment": false, "category": category, "value": value };
}

function tone(label, ...heights) {
  return { "segment": false, "category": "tone", "label": label, "heights": heights };
}


describe("ipa-parser : supra", () => {
  describe('Tone', () => {
    describe('Tone-mark', () => {
      it("should parse extra-low", () => {
        expectUnitsOf("ȅ").to.deep.include(tone("extra-low", 1));
      });
      it("should parse low", () => {
        expectUnitsOf("è").to.deep.include(tone("low", 2));
      });
      it("should parse mid", () => {
        expectUnitsOf("ē").to.deep.include(tone("mid", 3));
      });
      it("should parse high", () => {
        expectUnitsOf("é").to.deep.include(tone("high", 4));
      });
      it("should parse extra-high", () => {
        expectUnitsOf("e̋").to.deep.include(tone("extra-high", 5));
      });
      // Contour
      it("should parse rising", () => {
        expectUnitsOf("e\u030C").to.deep.include(tone("rising", 1, 5));
      });
      it("should parse falling", () => {
        expectUnitsOf("e\u0302").to.deep.include(tone("falling", 5, 1));
      });
      it("should parse high-rising", () => {
        expectUnitsOf("e\u1DC4").to.deep.include(tone("high-rising", 4, 5));
      });
      it("should parse low-rising", () => {
        expectUnitsOf("e\u1DC5").to.deep.include(tone("low-rising", 1, 2));
      });
      it("should parse low-falling", () => {
        expectUnitsOf("e\u1DC6").to.deep.include(tone("low-falling", 2, 1));
      });
      it("should parse high-falling", () => {
        expectUnitsOf("e\u1DC7").to.deep.include(tone("high-falling", 5, 4));
      });
      it("should parse rising-falling", () => {
        expectUnitsOf("e\u1DC8").to.deep.include(tone("rising-falling", 3, 4, 3));
      });
      it("should parse falling-rising", () => {
        expectUnitsOf("e\u1DC9").to.deep.include(tone("falling-rising", 3, 2, 3));
      });
    });

    describe('Tone-letter', () => {
      describe('Single tone-letter', () => {
        it("should parse extra-low", () => {
          expectUnitsOf("˩").to.eql([tone("extra-low", 1)]);
        });
        it("should parse low", () => {
          expectUnitsOf("˨").to.eql([tone("low", 2)]);
        });
        it("should parse mid", () => {
          expectUnitsOf("˧").to.eql([tone("mid", 3)]);
        });
        it("should parse high", () => {
          expectUnitsOf("˦").to.eql([tone("high", 4)]);
        });
        it("should parse extra-high", () => {
          expectUnitsOf("˥").to.eql([tone("extra-high", 5)]);
        });
      });
      describe('Multiple tone-letter', () => {
        it("should parse multiple tone with same heighs to the single heigh equivalent", () => {
          expectUnitsOf("˩˩").to.eql([tone("extra-low", 1, 1)]);
          expectUnitsOf("˦˦˦").to.eql([tone("high", 4, 4, 4)]);
          expectUnitsOf("˥˥˥˥").to.eql([tone("extra-high", 5, 5, 5, 5)]);
        });
        it("should parse rising", () => {
          expectUnitsOf("˩˥").to.eql([tone("rising", 1, 5)]);
          expectUnitsOf("˨˦").to.eql([tone("rising", 2, 4)]);
          expectUnitsOf("˩˧˥").to.eql([tone("rising", 1, 3, 5)]);
        });
        it("should parse rising + equal as rising", () => {
          expectUnitsOf("˩˩˥").to.eql([tone("rising", 1, 1, 5)]);
          expectUnitsOf("˨˦˦").to.eql([tone("rising", 2, 4, 4)]);
          expectUnitsOf("˩˧˧˥").to.eql([tone("rising", 1, 3, 3, 5)]);
          expectUnitsOf("˩˩˥˥").to.eql([tone("rising", 1, 1, 5, 5)]);
        });
        it("should parse falling", () => {
          expectUnitsOf("˥˩").to.eql([tone("falling", 5, 1)]);
          expectUnitsOf("˦˨").to.eql([tone("falling", 4, 2)]);
          expectUnitsOf("˥˧˩").to.eql([tone("falling", 5, 3, 1)]);
          expectUnitsOf("˥˩˩").to.eql([tone("falling", 5, 1, 1)]);
          expectUnitsOf("˦˦˨").to.eql([tone("falling", 4, 4, 2)]);
          expectUnitsOf("˥˧˧˩").to.eql([tone("falling", 5, 3, 3, 1)]);
          expectUnitsOf("˥˥˩˩").to.eql([tone("falling", 5, 5, 1, 1)]);
        });
        it("should parse low-rising", () => {
          expectUnitsOf("˩˧").to.eql([tone("low-rising", 1, 3)]);
          expectUnitsOf("˩˨˨").to.eql([tone("low-rising", 1, 2, 2)]);
          expectUnitsOf("˩˩˨").to.eql([tone("low-rising", 1, 1, 2)]);
        });
        it("should parse high-rising", () => {
          expectUnitsOf("˧˥").to.eql([tone("high-rising", 3, 5)]);
          expectUnitsOf("˧˥˥").to.eql([tone("high-rising", 3, 5, 5)]);
          expectUnitsOf("˧˧˥").to.eql([tone("high-rising", 3, 3, 5)]);
        });
        it("should parse low-falling", () => {
          expectUnitsOf("˧˩").to.eql([tone("low-falling", 3, 1)]);
          expectUnitsOf("˧˧˨").to.eql([tone("low-falling", 3, 3, 2)]);
          expectUnitsOf("˨˩˩").to.eql([tone("low-falling", 2, 1, 1)]);
        });
        it("should parse high-falling", () => {
          expectUnitsOf("˥˧").to.eql([tone("high-falling", 5, 3)]);
          expectUnitsOf("˥˦˦").to.eql([tone("high-falling", 5, 4, 4)]);
          expectUnitsOf("˦˦˧").to.eql([tone("high-falling", 4, 4, 3)]);
        });
        it("should parse rising-falling", () => {
          expectUnitsOf("˧˥˩").to.eql([tone("rising-falling", 3, 5, 1)]);
          expectUnitsOf("˨˦˧").to.eql([tone("rising-falling", 2, 4, 3)]);
          expectUnitsOf("˦˥˦").to.eql([tone("rising-falling", 4, 5, 4)]);
          expectUnitsOf("˦˥˥˦").to.eql([tone("rising-falling", 4, 5, 5, 4)]);
        });
        it("should parse falling-rising", () => {
          expectUnitsOf("˧˩˥").to.eql([tone("falling-rising", 3, 1, 5)]);
          expectUnitsOf("˧˨˦").to.eql([tone("falling-rising", 3, 2, 4)]);
          expectUnitsOf("˥˧˥").to.eql([tone("falling-rising", 5, 3, 5)]);
          expectUnitsOf("˥˧˦˥").to.eql([tone("falling-rising", 5, 3, 4, 5)]);
        });
        it("should parse other", () => {
          expectUnitsOf("˩˥˩˥").to.eql([tone("other", 1, 5, 1, 5)]);
          expectUnitsOf("˦˨˦˨").to.eql([tone("other", 4, 2, 4, 2)]);
        });
      });
    });
  });
  describe('Single-character supra-segmental', () => {
    describe('Stress', () => {
      // Warning primary stress used \u02C8 and not apostrophe \u0027
      it("should parse 'Primary stress'", () => {
        expectUnitsOf("ˈ").to.eql([supra("stress", "primary-stress")]);
      });
      it("should parse 'Secondary stress'", () => {
        expectUnitsOf("ˌ").to.eql([supra("stress", "secondary-stress")]);
      })
    });
    describe('Separator', () => {
      it("should parse 'Syllable break'", () => {
        expectUnitsOf(".").to.eql([supra("separator", "syllable-break")]);
      });
      it("should parse 'Minor group'", () => {
        expectUnitsOf("|").to.eql([supra("separator", "minor-group")]);
      });
      it("should parse 'Major group'", () => {
        expectUnitsOf("‖").to.eql([supra("separator", "major-group")]);
      });
      it("should parse 'Linking'", () => {
        expectUnitsOf("‿").to.eql([supra("separator", "linking")]);
      });
    });
    describe('Tone-step', () => {
      it("should parse 'Downstep'", () => {
        expectUnitsOf("ꜜ").to.eql([supra(`tone-step`, `downstep`)]);
      });
      it("should parse 'Upstep'", () => {
        expectUnitsOf("ꜛ").to.eql([supra(`tone-step`, `upstep`)]);
      });
    });
    describe('Intornation', () => {
      it("should parse 'Global Rise'", () => {
        expectUnitsOf("↗").to.eql([supra(`intonation`, `global-rise`)]);
      });
      it("should parse 'Global Fall'", () => {
        expectUnitsOf("↘").to.eql([supra(`intonation`, `global-fall`)]);
      });
    });
  });
});