/* --- JSON Import --- */

declare module '*.json' {
  const content: string;
}

/* --- Images --- */

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

/* --- Map Assets --- */

declare module '*.bin' {
  const content: string;
  export default content;
}

declare module '*.def' {
  const content: string;
  export default content;
}
