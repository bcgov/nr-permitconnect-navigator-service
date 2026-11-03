/* eslint-disable */
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'iframe-resizer/js/iframeResizer' {
  const iframeResize: (options: object, target: HTMLIFrameElement) => void;
  export default iframeResize;
}
