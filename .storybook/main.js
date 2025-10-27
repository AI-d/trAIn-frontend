

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
      "../src/**/*.mdx", // MDX 문서
      "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "../src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      "../src/layouts/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  "addons": [
    //"@chromatic-com/storybook",
    "@storybook/addon-essentials",
    //"@storybook/addon-docs",
    //"@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    //"@storybook/addon-vitest",
    //"@storybook/addon-interactions",
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "docs": {
    "autodocs": true  // 자동 문서화 활성화
  },
  "typescript": {
    "reactDocgen": "react-docgen", // JS 프로젝트를 위한 파서
  },
};
export default config;