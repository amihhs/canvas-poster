export function toBase64(string: string) {
  return btoa(string)
}

export function blobToUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}

export function dateFormatted(date: Date | number) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).format(date)
}
