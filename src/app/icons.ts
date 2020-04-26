const day = `
  <svg id="day">
    <path
      d="M 2 12 q 5 -20 10 0 t 10 0"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
`;

const threeDays = `
  <svg id="three-days">
    <path
      d="M 1.5 12 q 1.75 -20 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0 t 3.5 0"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
`;

const week = `
  <svg id="week">
    <path
      d="M 1.5 12 q .75 -20 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0 t 1.5 0"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-linecap="round"
    />
  </svg>
`;

export const icons = `<svg><defs>${day}${threeDays}${week}</defs></svg>`;
