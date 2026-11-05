declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any;
  export default pdfMake;
}
declare module 'pdfmake/build/vfs_fonts' {
  const vfs: any;
  export default vfs;
}
declare module 'html-to-pdfmake' {
  const htmlToPdfmake: (html: string, options?: Record<string, unknown>) => any;
  export default htmlToPdfmake;
}
