declare module "downloadjs" {
  export default function download(
    data: any,
    filename?: string,
    mimeType?: string
  ): void;
}

declare module "dom-to-image-more" {
  const domtoimage: {
    toPng(node: HTMLElement, options?: any): Promise<string>;
    toSvg(node: HTMLElement, options?: any): Promise<string>;
    toJpeg(node: HTMLElement, options?: any): Promise<string>;
    toBlob(node: HTMLElement, options?: any): Promise<Blob>;
    toPixelData(node: HTMLElement, options?: any): Promise<Uint8ClampedArray>;
  };
  export default domtoimage;
}