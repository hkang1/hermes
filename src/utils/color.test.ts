import * as utils from './color';

const colors = [
  {
    hex: '#000000',
    hsl: { h: 0, l: 0, s: 0 },
    hslString: 'hsl(0, 0%, 0%)',
    rgb: { b: 0, g: 0, r: 0 },
    rgbString: 'rgb(0, 0, 0)',
  },
  {
    hex: '#ff0000',
    hsl: { h: 0, l: 50, s: 100 },
    hslString: 'hsl(0, 100%, 50%)',
    rgb: { b: 0, g: 0, r: 255 },
    rgbString: 'rgb(255, 0, 0)',
  },
  {
    hex: '#cc9933',
    hsl: { h: 40, l: 50, s: 60 },
    hslString: 'hsl(40, 60%, 50%)',
    rgb: { b: 51, g: 153, r: 204 },
    rgbString: 'rgb(204, 153, 51)',
  },
  {
    hex: '#cc3399',
    hsl: { h: 320, l: 50, s: 60 },
    hslString: 'hsl(320, 60%, 50%)',
    rgb: { b: 153, g: 51, r: 204 },
    rgbString: 'rgb(204, 51, 153)',
  },
  {
    hex: '#00ff00',
    hsl: { h: 120, l: 50, s: 100 },
    hslString: 'hsl(120, 100%, 50%)',
    rgb: { b: 0, g: 255, r: 0 },
    rgbString: 'rgb(0, 255, 0)',
  },
  {
    hex: '#99cc33',
    hsl: { h: 80, l: 50, s: 60 },
    hslString: 'hsl(80, 60%, 50%)',
    rgb: { b: 51, g: 204, r: 153 },
    rgbString: 'rgb(153, 204, 51)',
  },
  {
    hex: '#33cc99',
    hsl: { h: 160, l: 50, s: 60 },
    hslString: 'hsl(160, 60%, 50%)',
    rgb: { b: 153, g: 204, r: 51 },
    rgbString: 'rgb(51, 204, 153)',
  },
  {
    hex: '#0000ff',
    hsl: { h: 240, l: 50, s: 100 },
    hslString: 'hsl(240, 100%, 50%)',
    rgb: { b: 255, g: 0, r: 0 },
    rgbString: 'rgb(0, 0, 255)',
  },
  {
    hex: '#9933cc',
    hsl: { h: 280, l: 50, s: 60 },
    hslString: 'hsl(280, 60%, 50%)',
    rgb: { b: 204, g: 51, r: 153 },
    rgbString: 'rgb(153, 51, 204)',
  },
  {
    hex: '#3399cc',
    hsl: { h: 200, l: 50, s: 60 },
    hslString: 'hsl(200, 60%, 50%)',
    rgb: { b: 204, g: 153, r: 51 },
    rgbString: 'rgb(51, 153, 204)',
  },
  {
    hex: '#999999',
    hsl: { h: 0, l: 60, s: 0 },
    hslString: 'hsl(0, 0%, 60%)',
    rgb: { b: 153, g: 153, r: 153 },
    rgbString: 'rgb(153, 153, 153)',
  },
  {
    hex: '#ffffff',
    hsl: { h: 0, l: 100, s: 0 },
    hslString: 'hsl(0, 0%, 100%)',
    rgb: { b: 255, g: 255, r: 255 },
    rgbString: 'rgb(255, 255, 255)',
  },
];

describe('color utilities', () => {
  describe('color conversion utilities', () => {
    describe('hex2hsl', () => {
      it('should convert hex to hsl', () => {
        colors.forEach(color => {
          expect(utils.hex2hsl(color.hex)).toStrictEqual(color.hsl);
        });
      });
    });

    describe('hex2rgb', () => {
      it('should convert hex to rgb', () => {
        colors.forEach(color => {
          expect(utils.hex2rgb(color.hex)).toStrictEqual(color.rgb);
        });
      });
    });

    describe('hsl2str', () => {
      it('should convert hsl to hsl string', () => {
        colors.forEach(color => {
          expect(utils.hsl2str(color.hsl)).toStrictEqual(color.hslString);
        });
      });
    });

    describe('rgba2str', () => {
      it('should convert rgba to rgba string', () => {
        colors.forEach(color => {
          expect(utils.rgba2str(color.rgb)).toStrictEqual(color.rgbString);
        });
      });
    });

    describe('str2rgba', () => {
      it('should convert rgba string to rgba', () => {
        colors.forEach(color => {
          expect(utils.str2rgba(color.rgbString)).toStrictEqual({ ...color.rgb, a: 1 });
        });
      });

      it('should convert hex to rgb', () => {
        colors.forEach(color => {
          expect(utils.str2rgba(color.hex)).toStrictEqual(color.rgb);
        });
      });

      it('should return return a black color if an invalid string is provides', () => {
        expect(utils.str2rgba('junk')).toStrictEqual({ a: 1, b: 0, g: 0, r: 0 });
      });
    });
  });

  describe('color scale utilities', () => {
    describe('rgbaFromGradient', () => {
      const tests: {
        inputs: [ utils.RgbaColor, utils.RgbaColor, number ],
        output: utils.RgbaColor,
      }[] = [
        {
          inputs: [
            { a: 1, b: 0, g: 0, r: 0 },
            { a: 1, b: 255, g: 255, r: 255 },
            0.5,
          ],
          output: { a: 1, b: 128, g: 128, r: 128 },
        },
        {
          inputs: [
            { a: 0.2, b: 250, g: 200, r: 0 },
            { a: 0.8, b: 100, g: 100, r: 200 },
            0.5,
          ],
          output: { a: 0.5, b: 175, g: 150, r: 100 },
        },
      ];
      it('should interpolate color from 2 colors', () => {
        tests.forEach(test => {
          expect(utils.rgbaFromGradient.apply(null, test.inputs)).toStrictEqual(test.output);
        });
      });
    });

    describe('scale2rgba', () => {
      it('should interpolate color from a list of colors', () => {
        const colors = [
          '#123456', 'rgb(255, 200, 150)', '#abcdef',
        ];
        const percent = 0.6;
        const output = 'rgb(238, 201, 168)';
        expect(utils.scale2rgba(colors, percent)).toBe(output);
      });

      it('should interpolate color from a list of rgba color', () => {
        const colors = [
          'rgba(20, 40, 60, 0.8)',
          'rgba(40, 60, 80, 0.7)',
          'rgba(60, 80, 100, 0.6)',
          'rgba(80, 100, 120, 0.5)',
        ];
        const percent = 0.3;
        const output = 'rgba(38, 58, 78, 0.71)';
        expect(utils.scale2rgba(colors, percent)).toBe(output);
      });
    });
  });
});
