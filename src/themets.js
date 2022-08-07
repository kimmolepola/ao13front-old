const borderRadius = '2px';
const borderWidth = '1px';
const colors = {
  bgMain: '#FFE4E1',
  bgStrong: '#ADD8E6',
  bgMedium: '#A0A0A0',
  bgLight: '#DCDCDC',
  bgVerylight: '#F0F0F0',
  highlight1: '#A52A2A',
  highlight2: '#FF6347',
};
const shadow = `0px 0px 1px 0px ${colors.bgMedium}`;
const border = `${borderWidth} solid ${colors.bgLight}`;

const basicButton = `
  cursor: pointer;
  color: white;
  background: ${colors.highlight1};
  box-shadow: ${shadow};
  border: ${border};
  border-radius: ${borderRadius};
  :active {
    color: ${colors.bgVerylight};
    background: black;
  }
  :focus {
    border-color: ${colors.bgStrong};
    outline: none;
  }
  :hover:not(:focus) {
    border-color: ${colors.bgMedium};
  }
  :disabled {
    background-color: ${colors.bgLight};
    :hover:not(:focus) {
      border-color: ${colors.bgLight};
    }
    cursor: auto;
  }
`;

const secondaryButton = `
  ${basicButton}
  background: ${colors.highlight2};
`;

const theme = {
  appbarHeight: '15mm',
  opacity: {
    basic: '85%',
  },
  borders: {
    basic: border,
  },
  margins: {
    basic: '2px',
    large: '6px',
  },
  fontFamily: 'Arial, Helvetica, sans-serif',
  basicInput: `
    padding-left: 6px;
    box-shadow: ${shadow};
    border: ${border};
    border-radius: ${borderRadius};
    :focus {
      border-color: ${colors.bgStrong};
      outline: none;
    }
    :hover:not(:focus) {
      border-color: ${colors.bgMedium};
    }
    ::placeholder {
      /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: lightgrey;
      opacity: 1; /* Firefox */
    }
    ::-ms-input-placeholder {
      /* Microsoft Edge */
      color: lightgrey;
    }
  `,
  basicButton,
  secondaryButton,
  mobileWidth: 600,
  sidepanelWidthPercent: 30,
  sidepanelMaxWidth: '300px',
  colors,
  shadow,
  borderRadius,
};

module.exports = theme;
