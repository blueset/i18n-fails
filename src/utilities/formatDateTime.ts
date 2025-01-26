export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp || Date.now())
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
