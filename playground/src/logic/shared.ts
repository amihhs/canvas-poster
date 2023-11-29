export async function parseSourceUrl(url: string, empty?: string) {
  if (!/^(image)|.*/.test(url))
    return url

  const source = await getSource(url)
  return source?.blob ? URL.createObjectURL(source.blob) : empty || url
}
