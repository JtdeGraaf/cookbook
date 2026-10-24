/**
 * The browser tab title, made of the page's own title and, while a timer rings, an alarm in front of it. Kept in
 * one place so a page change never wipes out the alarm, or the other way round.
 */
let pageTitle = document.title
let alarm: string | null = null

export function setPageTitle(title: string): void {
  pageTitle = title
  showTitle()
}

export function setTitleAlarm(text: string | null): void {
  alarm = text
  showTitle()
}

function showTitle(): void {
  document.title = alarm ? `${alarm} · ${pageTitle}` : pageTitle
}
